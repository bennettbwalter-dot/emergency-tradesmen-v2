// send-email — single transactional/test email via Resend.
// Used by the "Send test email" button and any one-off admin send.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- inline admin/service-role auth (kept self-contained for MCP deploys) ---
class HttpError extends Error { status: number; constructor(s: number, m: string) { super(m); this.status = s; } }
function adminEmails(): string[] {
    return [Deno.env.get('ADMIN_EMAILS'), Deno.env.get('ADMIN_EMAIL'), Deno.env.get('VITE_ADMIN_EMAIL'), 'nicholas.bennett247@gmail.com']
        .filter(Boolean).join(',').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}
async function requireAdminOrServiceRole(req: Request) {
    const token = (req.headers.get('authorization') || '').match(/^Bearer\s+(.+)$/i)?.[1] || null;
    const url = Deno.env.get('SUPABASE_URL'); const svc = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!token) throw new HttpError(401, 'Missing authorization token');
    if (svc && token === svc) return { role: 'service_role' };
    if (!url || !svc) throw new HttpError(500, 'Server auth not configured');
    const sb = createClient(url, svc, { auth: { persistSession: false } });
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data.user?.email) throw new HttpError(401, 'Invalid authorization token');
    if (!adminEmails().includes(data.user.email.toLowerCase())) throw new HttpError(403, 'Admin access required');
    return { role: 'admin', email: data.user.email };
}
function errorResponse(error: unknown, headers: HeadersInit = {}) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: message }), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        await requireAdminOrServiceRole(req)

        const { to, subject, html, text, from_name, reply_to } = await req.json()

        if (!to || !subject) {
            throw new Error('Missing required fields: "to" and "subject"')
        }

        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
        if (!RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not configured on the server. Add it in Supabase → Edge Functions → Secrets.')
        }

        // Pull sender defaults from email_settings (falls back to env / sane defaults).
        let fromName = from_name || 'Emergency Contractors'
        let fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev'
        let replyTo = reply_to || 'emergencytradesmen@gmail.com'

        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        if (supabaseUrl && serviceKey) {
            const supabase = createClient(supabaseUrl, serviceKey)
            const { data: settings } = await supabase
                .from('email_settings').select('from_name, from_email, reply_to').eq('id', 1).maybeSingle()
            if (settings) {
                fromName = from_name || settings.from_name || fromName
                fromEmail = settings.from_email || fromEmail
                replyTo = reply_to || settings.reply_to || replyTo
            }
        }

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: `${fromName} <${fromEmail}>`,
                to: Array.isArray(to) ? to : [to],
                reply_to: replyTo,
                subject,
                html: html || text || '',
                text: text || undefined,
            }),
        })

        const data = await res.json().catch(() => null)

        if (!res.ok) {
            return new Response(
                JSON.stringify({ error: (data && (data.message || data.name)) || 'Resend rejected the email', detail: data }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        return new Response(
            JSON.stringify({ message: 'Email sent successfully', id: data?.id, data }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error) {
        return errorResponse(error, corsHeaders)
    }
})
