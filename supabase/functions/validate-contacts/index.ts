// validate-contacts — cleans the contact list to cut bounces.
//
// Layer 1 (free, always on): DNS/MX validation via DoH. Domains with no mail
//   server (no MX and no A) can never receive email -> marked invalid.
// Layer 2 (optional): mailbox verification via a ZeroBounce-compatible API,
//   enabled only when EMAIL_VERIFY_API_KEY is set. Catches dead mailboxes on
//   otherwise-valid domains (the bounces DNS validation can't see).
//
// Processes one batch per call (UI loops it). Body: { country?, limit?, verify? }.
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
    const svc = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!token) throw new HttpError(401, 'Missing authorization token');
    if (svc && token === svc) return;
    const c = decodeJwt(token);
    if (c?.role === 'service_role') return;
    if (c?.email && adminEmails().includes(String(c.email).toLowerCase())) return;
    throw new HttpError(403, 'Admin access required');
}

const TIME_BUDGET_MS = 100_000;
const domainOf = (e: string) => (e.split('@')[1] || '').toLowerCase().trim();

// DNS over HTTPS (Cloudflare). Returns 'valid_mx' | 'no_mx' | 'dead_domain'.
async function classifyDomain(d: string): Promise<string> {
    const q = async (type: string) => {
        try {
            const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(d)}&type=${type}`, { headers: { Accept: 'application/dns-json' } });
            if (!r.ok) return [];
            const j = await r.json();
            return (j.Answer || []).filter((a: any) => (type === 'MX' ? a.type === 15 : a.type === 1));
        } catch { return []; }
    };
    if ((await q('MX')).length) return 'valid_mx';
    if ((await q('A')).length) return 'no_mx';
    return 'dead_domain';
}

// Optional ZeroBounce-compatible mailbox check.
async function verifyMailbox(email: string, key: string): Promise<string | null> {
    try {
        const r = await fetch(`https://api.zerobounce.net/v2/validate?api_key=${key}&email=${encodeURIComponent(email)}`);
        if (!r.ok) return null;
        const j = await r.json();
        return j.status || null; // valid | invalid | catch-all | spamtrap | abuse | do_not_mail | unknown
    } catch { return null; }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    try {
        await requireAdmin(req);
        const t0 = Date.now();
        const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
        let body: any = {}; try { body = await req.json(); } catch { /* defaults */ }
        const country = body.country || 'GB';
        const limit = Math.min(Math.max(Number(body.limit) || 300, 1), 500);
        const verifyKey = body.verify === false ? null : Deno.env.get('EMAIL_VERIFY_API_KEY');

        const { data: rows, error } = await supabase.from('email_contacts')
            .select('id, email').eq('country_code', country).eq('email_valid', true).is('validation_status', null)
            .order('id').limit(limit);
        if (error) throw error;
        if (!rows?.length) {
            const { count } = await supabase.from('email_contacts').select('id', { count: 'exact', head: true }).eq('country_code', country).eq('email_valid', true).is('validation_status', null);
            return ok({ done: true, checked: 0, remaining: count || 0 });
        }

        // Layer 1: DNS/MX (deduped per domain).
        const cache: Record<string, string> = {};
        const domains = [...new Set(rows.map((r) => domainOf(r.email)).filter(Boolean))];
        for (let i = 0; i < domains.length; i += 25) {
            if (Date.now() - t0 > TIME_BUDGET_MS) break;
            await Promise.all(domains.slice(i, i + 25).map(async (d) => { cache[d] = await classifyDomain(d); }));
        }

        const now = new Date().toISOString();
        const stats: Record<string, number> = { valid_mx: 0, no_mx: 0, dead_domain: 0, mailbox_invalid: 0 };
        for (const r of rows) {
            let status = cache[domainOf(r.email)] || 'dead_domain';
            let valid = status === 'valid_mx';
            // Layer 2: optional mailbox verification for domains that passed DNS.
            if (valid && verifyKey && Date.now() - t0 < TIME_BUDGET_MS) {
                const mb = await verifyMailbox(r.email, verifyKey);
                if (mb && ['invalid', 'spamtrap', 'abuse', 'do_not_mail'].includes(mb)) { status = 'mailbox_invalid'; valid = false; }
                else if (mb === 'valid') status = 'verified';
            }
            stats[status === 'verified' ? 'valid_mx' : status] = (stats[status === 'verified' ? 'valid_mx' : status] || 0) + 1;
            await supabase.from('email_contacts').update({ validation_status: status, email_valid: valid, validated_at: now, updated_at: now }).eq('id', r.id);
        }

        const { count: remaining } = await supabase.from('email_contacts').select('id', { count: 'exact', head: true }).eq('country_code', country).eq('email_valid', true).is('validation_status', null);
        return ok({ done: (remaining || 0) === 0, checked: rows.length, invalidated: stats.no_mx + stats.dead_domain + stats.mailbox_invalid, stats, remaining: remaining || 0, mailbox_layer: !!verifyKey });
    } catch (error) {
        const status = error instanceof HttpError ? error.status : 500;
        return new Response(JSON.stringify({ error: (error as Error).message }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    function ok(payload: any) { return new Response(JSON.stringify(payload), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }); }
});
