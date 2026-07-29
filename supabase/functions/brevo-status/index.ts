// brevo-status — admin-only health check for the US (Brevo) sending side.
// Reads the server-side BREVO_API_KEY and reports whether Brevo is connected,
// the daily send limit, whether emergencycontractor@outlook.com is a verified
// sender, and how many US emails have gone out today. Never returns the key.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

class HttpError extends Error { status: number; constructor(s: number, m: string) { super(m); this.status = s; } }
function adminEmails(): string[] {
    return [Deno.env.get('ADMIN_EMAILS'), Deno.env.get('ADMIN_EMAIL'), Deno.env.get('VITE_ADMIN_EMAIL'), 'nicholas.bennett247@gmail.com']
        .filter(Boolean).join(',').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}
function decodeJwt(token: string): any {
    try { let p = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'); while (p.length % 4) p += '='; return JSON.parse(atob(p)); } catch { return null; }
}
async function requireAdmin(req: Request) {
    const token = (req.headers.get('authorization') || '').match(/^Bearer\s+(.+)$/i)?.[1] || null;
    const url = Deno.env.get('SUPABASE_URL'); const svc = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!token) throw new HttpError(401, 'Missing authorization token');
    if (svc && token === svc) return;
    const claims = decodeJwt(token);
    if (claims?.role === 'service_role') return;
    if (claims?.email && adminEmails().includes(String(claims.email).toLowerCase())) return;
    if (!url || !svc) throw new HttpError(500, 'Server auth not configured');
    const sb = createClient(url, svc, { auth: { persistSession: false } });
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data.user?.email || !adminEmails().includes(data.user.email.toLowerCase())) throw new HttpError(403, 'Admin access required');
}

const TARGET_SENDER = 'emergencycontractor@outlook.com';

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    const json = (payload: any, status = 200) => new Response(JSON.stringify(payload), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status });

    try {
        await requireAdmin(req);

        const key = Deno.env.get('BREVO_API_KEY');
        if (!key) return json({ configured: false, connected: false, provider: 'brevo' });

        // Account / plan (also proves the key + IP are accepted).
        const ar = await fetch('https://api.brevo.com/v3/account', { headers: { 'api-key': key, 'accept': 'application/json' } });
        const adata = await ar.json().catch(() => null);
        if (!ar.ok) {
            const msg = (adata && adata.message) || `HTTP ${ar.status}`;
            const ipBlocked = /unrecognised ip|unrecognized ip|authorised_ips|authorized ip/i.test(String(msg));
            return json({ configured: true, connected: false, ipBlocked, error: String(msg) });
        }

        let dailyLimit: number | null = null;
        if (Array.isArray(adata?.plan)) {
            const sl = adata.plan.find((p: any) => p.creditsType === 'sendLimit') || adata.plan[0];
            if (sl && typeof sl.credits === 'number') dailyLimit = sl.credits;
        }

        // Verified senders.
        const sr = await fetch('https://api.brevo.com/v3/senders', { headers: { 'api-key': key, 'accept': 'application/json' } });
        const sdata = await sr.json().catch(() => null);
        const senders = Array.isArray(sdata?.senders) ? sdata.senders.map((s: any) => ({ email: String(s.email || ''), active: !!s.active })) : [];
        const senderVerified = senders.some((s: any) => s.email.toLowerCase() === TARGET_SENDER && s.active);

        // US emails sent today (across all US campaigns).
        let usSentToday = 0;
        const url = Deno.env.get('SUPABASE_URL'); const svc = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (url && svc) {
            const supabase = createClient(url, svc);
            const { data: usCamps } = await supabase.from('email_campaigns').select('id').eq('target_country', 'US');
            const ids = (usCamps || []).map((c: any) => c.id);
            if (ids.length) {
                const d = new Date(); d.setUTCHours(0, 0, 0, 0);
                const { count } = await supabase.from('email_send_log').select('id', { count: 'exact', head: true })
                    .in('campaign_id', ids).eq('status', 'sent').gte('created_at', d.toISOString());
                usSentToday = count || 0;
            }
        }

        return json({
            configured: true,
            connected: true,
            provider: 'brevo',
            accountEmail: adata?.email || null,
            dailyLimit,
            senderVerified,
            targetSender: TARGET_SENDER,
            senders,
            usSentToday,
        });
    } catch (error) {
        const status = error instanceof HttpError ? error.status : 500;
        return json({ error: error instanceof Error ? error.message : 'error' }, status);
    }
});
