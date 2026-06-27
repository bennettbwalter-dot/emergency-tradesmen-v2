// knowledge-graph — ADMIN-ONLY endpoint that serves the Graphify knowledge
// graph (code architecture + domain knowledge) for the admin dashboard viewer.
//
// SECURITY: this is the only place the full graph is exposed, and it is gated
// behind requireAdmin() (same pattern as brevo-status). Public/anon users get
// 401/403 and never receive any graph data. The graph itself is pre-sanitized
// at build time (scripts/graphify/build-graph.mjs) — it contains only file
// names, symbols, relations and public domain knowledge, never secrets.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
// Static, build-time generated graph. Regenerate with `npm run graph:build`
// then redeploy this function.
import graphData from "./graph.data.json" with { type: "json" };

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

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    const json = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status });

    try {
        await requireAdmin(req);
        // ?meta=1 returns only the lightweight metadata (fast freshness check).
        const wantMetaOnly = new URL(req.url).searchParams.get('meta') === '1';
        const data = graphData as { meta?: unknown; nodes?: unknown[]; edges?: unknown[] };
        if (wantMetaOnly) return json({ meta: data.meta ?? null });
        return json(data);
    } catch (e) {
        const status = e instanceof HttpError ? e.status : 500;
        return json({ error: (e as Error).message || 'error' }, status);
    }
});
