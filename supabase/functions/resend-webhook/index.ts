// resend-webhook — receives Resend delivery events (opened/clicked/bounced/
// complained) and feeds them back into send-log stats + the suppression list.
//
// Configure in Resend → Webhooks with URL:
//   https://<project>.supabase.co/functions/v1/resend-webhook?secret=<RESEND_WEBHOOK_SECRET>
// Set RESEND_WEBHOOK_SECRET as an Edge Function secret to enable the shared-secret check.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    // Optional shared-secret gate.
    const secret = Deno.env.get('RESEND_WEBHOOK_SECRET');
    if (secret) {
        const url = new URL(req.url);
        if (url.searchParams.get('secret') !== secret) {
            return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
    }

    try {
        const event = await req.json();
        const type: string = event?.type || '';
        const data = event?.data || {};
        const resendId: string | undefined = data.email_id || data.id;
        const to: string = Array.isArray(data.to) ? data.to[0] : data.to;
        const now = new Date().toISOString();

        // Find the matching send-log row (by resend id, falling back to recipient).
        let logRow: any = null;
        if (resendId) {
            const { data: r } = await supabase.from('email_send_log').select('*').eq('resend_id', resendId).maybeSingle();
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

        switch (type) {
            case 'email.opened':
                if (logRow && !logRow.opened_at) { await supabase.from('email_send_log').update({ opened_at: now }).eq('id', logRow.id); await bumpCampaign('total_opened'); }
                break;
            case 'email.clicked':
                if (logRow && !logRow.clicked_at) { await supabase.from('email_send_log').update({ clicked_at: now }).eq('id', logRow.id); await bumpCampaign('total_clicked'); }
                break;
            case 'email.bounced':
                if (logRow) await supabase.from('email_send_log').update({ status: 'bounced', bounced_at: now }).eq('id', logRow.id);
                if (email) {
                    await supabase.from('email_suppression').upsert({ email, reason: 'bounce', source_campaign_id: campaignId ?? null }, { onConflict: 'email' });
                    await supabase.from('email_contacts').update({ bounced: true, status: 'bounced', email_valid: false, updated_at: now }).ilike('email', email);
                }
                await bumpCampaign('total_bounced');
                break;
            case 'email.complained':
                if (logRow) await supabase.from('email_send_log').update({ status: 'complained' }).eq('id', logRow.id);
                if (email) {
                    await supabase.from('email_suppression').upsert({ email, reason: 'complaint', source_campaign_id: campaignId ?? null }, { onConflict: 'email' });
                    await supabase.from('email_contacts').update({ unsubscribed: true, status: 'unsubscribed', updated_at: now }).ilike('email', email);
                }
                await bumpCampaign('total_unsubscribed');
                break;
            default:
                // delivered / sent / delivery_delayed — no action needed.
                break;
        }

        return new Response(JSON.stringify({ ok: true, type }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }
});
