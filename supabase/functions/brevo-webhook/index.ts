// brevo-webhook — receives Brevo (Sendinblue) transactional email events for the
// US side and feeds them into the SAME send-log stats + suppression list the UK
// Resend webhook uses, so bounce/spam/unsubscribe handling is identical across
// providers. The US and UK email systems stay separate at the SENDING layer; this
// only writes back delivery status.
//
// Configure in Brevo → Transactional → Settings → Webhooks with URL:
//   https://<project>.supabase.co/functions/v1/brevo-webhook?secret=<BREVO_WEBHOOK_SECRET>
// Set BREVO_WEBHOOK_SECRET as an Edge Function secret to enable the shared-secret check.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    // Optional shared-secret gate.
    const secret = Deno.env.get('BREVO_WEBHOOK_SECRET');
    if (secret) {
        const url = new URL(req.url);
        if (url.searchParams.get('secret') !== secret) {
            return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
    }

    try {
        const event = await req.json();
        // Brevo event shape: { event, email, "message-id", reason, tag, date, ... }
        const type: string = String(event?.event || '').toLowerCase();
        const messageId: string | undefined = event?.['message-id'] || event?.message_id || event?.messageId;
        const to: string = event?.email || '';
        const reason: string | null = event?.reason ? String(event.reason).slice(0, 500) : null;
        const now = new Date().toISOString();

        // Find the matching send-log row (by Brevo message id, falling back to recipient).
        let logRow: any = null;
        if (messageId) {
            const { data: r } = await supabase.from('email_send_log').select('*').eq('resend_id', messageId).maybeSingle();
            logRow = r;
        }
        if (!logRow && to) {
            const { data: r } = await supabase.from('email_send_log').select('*').ilike('email', to).order('created_at', { ascending: false }).limit(1).maybeSingle();
            logRow = r;
        }
        const campaignId = logRow?.campaign_id;
        const email = (logRow?.email || to || '').toLowerCase();

        const bumpCampaign = async (col: string) => {
            if (!campaignId) return;
            const { data: c } = await supabase.from('email_campaigns').select(col).eq('id', campaignId).maybeSingle();
            if (c) await supabase.from('email_campaigns').update({ [col]: ((c as any)[col] || 0) + 1 }).eq('id', campaignId);
        };

        const suppressBounce = async () => {
            if (logRow) await supabase.from('email_send_log').update({ status: 'bounced', bounced_at: now, error: reason || 'bounced' }).eq('id', logRow.id);
            if (email) {
                await supabase.from('email_suppression').upsert({ email, reason: 'bounce', source_campaign_id: campaignId ?? null }, { onConflict: 'email' });
                await supabase.from('email_contacts').update({ bounced: true, status: 'bounced', email_valid: false, updated_at: now }).ilike('email', email);
            }
            await bumpCampaign('total_bounced');
        };
        const suppressOptOut = async (reasonTag: string) => {
            if (logRow) await supabase.from('email_send_log').update({ status: reasonTag }).eq('id', logRow.id);
            if (email) {
                await supabase.from('email_suppression').upsert({ email, reason: reasonTag === 'complained' ? 'complaint' : 'unsubscribe', source_campaign_id: campaignId ?? null }, { onConflict: 'email' });
                await supabase.from('email_contacts').update({ unsubscribed: true, status: 'unsubscribed', updated_at: now }).ilike('email', email);
            }
            await bumpCampaign('total_unsubscribed');
        };

        switch (type) {
            case 'opened':
            case 'unique_opened':
                if (logRow && !logRow.opened_at) { await supabase.from('email_send_log').update({ opened_at: now }).eq('id', logRow.id); await bumpCampaign('total_opened'); }
                break;
            case 'click':
                if (logRow && !logRow.clicked_at) { await supabase.from('email_send_log').update({ clicked_at: now }).eq('id', logRow.id); await bumpCampaign('total_clicked'); }
                break;
            // Permanent failures → suppress so we never email the address again.
            case 'hard_bounce':
            case 'blocked':
            case 'invalid_email':
            case 'error':
                await suppressBounce();
                break;
            case 'spam':
                await suppressOptOut('complained');
                break;
            case 'unsubscribed':
            case 'list_addition':
            case 'unsubscribe':
                await suppressOptOut('unsubscribed');
                break;
            // soft_bounce / deferred / delivered / sent → transient or informational, no action.
            default:
                break;
        }

        return new Response(JSON.stringify({ ok: true, event: type }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }
});
