// email-orchestrator — safe, throttled bulk sender for the Email Control Centre.
//
// One invocation = ONE chunk per due campaign. After a chunk it sets
// next_run_at = now + delay_between_chunks_ms so the "send N, wait, send N more"
// cadence is enforced ACROSS invocations (Edge Functions can't sleep for minutes).
// Drive repeated cycles with the "Force Run" button or an optional pg_cron job.
//
// Safety layers: domain-verified gate (auto dry-run when unverified), daily +
// hourly caps, warm-up ramp, suppression/unsubscribe/bounce/reply/cooldown skips,
// duplicate prevention, invalid-email skip, and auto-pause on error spikes.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- inline admin/service-role auth (kept self-contained for MCP deploys) ---
class HttpError extends Error { status: number; constructor(s: number, m: string) { super(m); this.status = s; } }
function adminEmails(): string[] {
    return [Deno.env.get('ADMIN_EMAILS'), Deno.env.get('ADMIN_EMAIL'), Deno.env.get('VITE_ADMIN_EMAIL'), 'nicholas.bennett247@gmail.com']
        .filter(Boolean).join(',').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}
function decodeJwt(token: string): any {
    try {
        let p = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        while (p.length % 4) p += '=';
        return JSON.parse(atob(p));
    } catch { return null; }
}
async function requireAdminOrServiceRole(req: Request) {
    // NOTE: this function is deployed with verify_jwt=true, so the gateway has
    // already verified the token signature before we get here. That lets us
    // trust the decoded role/email claims for the fast paths below.
    const token = (req.headers.get('authorization') || '').match(/^Bearer\s+(.+)$/i)?.[1] || null;
    const url = Deno.env.get('SUPABASE_URL'); const svc = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!token) throw new HttpError(401, 'Missing authorization token');
    if (svc && token === svc) return { role: 'service_role' };
    const claims = decodeJwt(token);
    if (claims?.role === 'service_role') return { role: 'service_role' };
    if (claims?.email && adminEmails().includes(String(claims.email).toLowerCase())) return { role: 'admin', email: claims.email };
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

const TIME_BUDGET_MS = 110_000; // stay safely under the Edge Function wall-clock limit
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const startOfUtcDay = () => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d.toISOString(); };
const oneHourAgo = () => new Date(Date.now() - 3600_000).toISOString();
const esc = (s: string) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const GOOD_TLDS = new Set(['com','net','org','us','co','io','biz','info','edu','gov','me','tv','online','site','app','dev','pro','email','company','services','inc','group','live','agency','team','solutions','llc','ca']);
function looksValid(email: string): boolean {
    if (!email || !EMAIL_RE.test(email)) return false;
    const tld = email.toLowerCase().split('.').pop() || '';
    return GOOD_TLDS.has(tld);
}

function render(tpl: string, c: Record<string, any>): string {
    const first = (c.contact_name || '').trim().split(/\s+/)[0] || 'there';
    const map: Record<string, string> = {
        first_name: first,
        business_name: c.business_name || 'your business',
        trade: (c.trade || 'your trade').replace(/-/g, ' '),
        city: c.city || 'your area',
        state: c.state || '',
        email: c.email || '',
        phone: c.phone || '',
        website: c.website || '',
        listing_url: c.listing_url || 'https://emergencycontractors.net',
    };
    return (tpl || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => esc(map[k] ?? ''));
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    const t0 = Date.now();
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabase = createClient(supabaseUrl, serviceKey);

    // Rolling terminal-log feed the UI polls (capped to last 200 lines).
    const logLines: { ts: string; level: string; line: string }[] = [];
    const log = (line: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
        logLines.push({ ts: new Date().toISOString(), level, line });
        console.log(`[orchestrator] ${line}`);
    };
    const setState = async (state: string, message: string, extra: Record<string, any> = {}) => {
        const { data: cur } = await supabase.from('email_orchestrator_state').select('log').eq('id', 1).maybeSingle();
        const prev = Array.isArray(cur?.log) ? cur!.log : [];
        const merged = [...prev, ...logLines].slice(-200);
        logLines.length = 0;
        await supabase.from('email_orchestrator_state').update({
            state, message, log: merged, updated_at: new Date().toISOString(), ...extra,
        }).eq('id', 1);
    };

    try {
        await requireAdminOrServiceRole(req);

        let body: any = {};
        try { body = await req.json(); } catch { /* no body = run all active */ }
        const requestedDryRun = body?.dryRun === true;
        const onlyCampaignId: string | null = body?.campaign_id ?? null;

        log('Orchestrator triggered — checking queue…');
        await setState('checking', 'Checking campaign queue and safe-sending limits…', { last_run_at: new Date().toISOString() });

        // ---- Load global settings + run compliance/setup gates ----
        const { data: settings } = await supabase.from('email_settings').select('*').eq('id', 1).maybeSingle();
        if (!settings) { await setState('setup_required', 'No email settings row found. Open Resend Settings and save.'); return ok({ state: 'setup_required' }); }

        const setupProblems: string[] = [];
        if (!resendApiKey) setupProblems.push('RESEND_API_KEY secret is not set on the server.');
        if (!settings.from_email) setupProblems.push('No sender (From) email configured.');
        if (!settings.reply_to) setupProblems.push('No reply-to email configured.');
        if (setupProblems.length) {
            setupProblems.forEach((p) => log(p, 'error'));
            await setState('setup_required', setupProblems.join(' '));
            return ok({ state: 'setup_required', problems: setupProblems });
        }

        // Domain not verified (or no Resend key) => force a non-destructive DRY RUN.
        const domainOk = settings.domain_verified === true;
        const dryRun = requestedDryRun || !domainOk || !resendApiKey;
        if (dryRun && !requestedDryRun) {
            log(`Sending domain not verified — running in DRY RUN (no real emails sent). Verify a domain in Resend Settings to send live.`, 'warn');
        }

        // ---- Pick due campaigns ----
        let q = supabase.from('email_campaigns').select('*');
        if (onlyCampaignId) q = q.eq('id', onlyCampaignId);
        else q = q.eq('status', 'active');
        const { data: campaigns, error: cErr } = await q;
        if (cErr) throw cErr;

        const nowIso = new Date().toISOString();
        const due = (campaigns || []).filter((c) => {
            if (onlyCampaignId) return true;
            if (c.scheduled_at && c.scheduled_at > nowIso) return false;       // scheduled for later
            if (c.next_run_at && c.next_run_at > nowIso) return false;          // still in between-chunk rest
            return true;
        });

        if (!due.length) {
            log('No campaigns are due to send right now.');
            await setState('idle', 'Idle — no campaigns due.');
            return ok({ state: 'idle', processed: [] });
        }

        const results: any[] = [];

        for (const camp of due) {
            if (Date.now() - t0 > TIME_BUDGET_MS) { log('Time budget reached — will continue next cycle.', 'warn'); break; }

            log(`▶ Processing "${camp.name}" (${camp.target_trade || 'all trades'} · ${camp.target_country})`);
            await setState('sending', `Sending "${camp.name}"…`, { current_campaign_id: camp.id });

            // Effective limits (campaign override -> global) + warm-up ramp.
            let dailyLimit = camp.daily_limit ?? settings.daily_limit ?? 200;
            const hourlyLimit = camp.hourly_limit ?? settings.hourly_limit ?? 50;
            if (settings.warmup_enabled) {
                const days = Math.floor((Date.now() - new Date(camp.created_at).getTime()) / 86_400_000);
                const warmCap = (settings.warmup_start_daily ?? 20) + (settings.warmup_increment ?? 10) * days;
                if (warmCap < dailyLimit) { dailyLimit = warmCap; log(`Warm-up active: today's cap is ${dailyLimit}.`); }
            }

            const { count: sentToday } = await supabase.from('email_send_log')
                .select('id', { count: 'exact', head: true })
                .eq('campaign_id', camp.id).eq('status', 'sent').gte('created_at', startOfUtcDay());
            const { count: sentHour } = await supabase.from('email_send_log')
                .select('id', { count: 'exact', head: true })
                .eq('campaign_id', camp.id).eq('status', 'sent').gte('created_at', oneHourAgo());

            const remainingToday = dailyLimit - (sentToday || 0);
            const remainingHour = hourlyLimit - (sentHour || 0);
            if (remainingToday <= 0) { log(`Daily limit reached (${sentToday}/${dailyLimit}).`, 'warn'); await setState('rate_limited', `"${camp.name}" hit its daily limit (${dailyLimit}).`, { current_campaign_id: camp.id }); results.push({ campaign: camp.name, reason: 'daily_limit' }); continue; }
            if (remainingHour <= 0) { log(`Hourly limit reached (${sentHour}/${hourlyLimit}).`, 'warn'); await setState('rate_limited', `"${camp.name}" hit its hourly limit (${hourlyLimit}).`, { current_campaign_id: camp.id }); results.push({ campaign: camp.name, reason: 'hourly_limit' }); continue; }

            const chunkSize = Math.max(1, settings.chunk_size ?? 10);
            const cycleCap = Math.min(chunkSize, remainingToday, remainingHour);

            // Candidate contacts (over-fetch to survive suppression filtering).
            let cq = supabase.from('email_contacts').select('*')
                .eq('country_code', camp.target_country)
                .eq('email_valid', true)
                .eq('unsubscribed', false).eq('bounced', false).eq('replied', false)
                .in('status', ['new', 'queued'])
                .limit(cycleCap * 3);
            if (camp.target_trade) cq = cq.eq('trade', camp.target_trade);
            if (camp.target_city) cq = cq.ilike('city', camp.target_city);
            if (camp.target_state) cq = cq.ilike('state', camp.target_state);
            const cooldownDays = camp.cooldown_days ?? 14;
            const cooldownCut = new Date(Date.now() - cooldownDays * 86_400_000).toISOString();
            cq = cq.or(`last_emailed_at.is.null,last_emailed_at.lt.${cooldownCut}`);

            const { data: candidates, error: candErr } = await cq;
            if (candErr) { log(`Contact query error: ${candErr.message}`, 'error'); continue; }
            if (!candidates?.length) {
                log(`No remaining sendable contacts — marking "${camp.name}" completed.`, 'success');
                await supabase.from('email_campaigns').update({ status: 'completed', last_run_at: nowIso, next_run_at: null }).eq('id', camp.id);
                await setState('completed', `"${camp.name}" completed — no more contacts.`, { current_campaign_id: camp.id });
                results.push({ campaign: camp.name, sent: 0, completed: true });
                continue;
            }

            // Global suppression filter (duplicate/opt-out safety net).
            const emails = candidates.map((c) => c.email.toLowerCase());
            const { data: suppressed } = await supabase.from('email_suppression').select('email').in('email', emails);
            const blocked = new Set((suppressed || []).map((s) => s.email.toLowerCase()));
            const queue = candidates.filter((c) => !blocked.has(c.email.toLowerCase()) && looksValid(c.email)).slice(0, cycleCap);

            log(`Queue: ${queue.length} contact(s) this chunk (cap ${cycleCap}; ${blocked.size} suppressed skipped).`);
            await setState('sending', `Sending chunk for "${camp.name}" (${queue.length})…`, { current_campaign_id: camp.id, progress_current: 0, progress_total: queue.length });

            const subjectTpl = camp.subject || `Claim your free Emergency Contractors listing`;
            const fromName = camp.from_name || settings.from_name || 'Emergency Contractors';
            const fromEmail = camp.from_email || settings.from_email;
            const replyTo = camp.reply_to || settings.reply_to;
            const optOut = camp.opt_out_text || settings.opt_out_text || '';
            const bizAddr = camp.business_address || settings.business_address || '';
            const delayMs = settings.delay_between_emails_ms ?? 2000;

            let sent = 0, failed = 0, consecutiveErr = 0, i = 0;
            for (const contact of queue) {
                i++;
                if (Date.now() - t0 > TIME_BUDGET_MS) { log('Time budget reached mid-chunk — stopping cleanly.', 'warn'); break; }

                const subject = render(subjectTpl, contact);
                let bodyHtml = render(camp.body_html || DEFAULT_BODY, contact);
                // Guarantee a compliant footer (opt-out + identity + address) even if the template omits it.
                if (!/unsubscribe|opt[\s-]?out/i.test(bodyHtml)) {
                    bodyHtml += `<hr style="margin:28px 0;border:none;border-top:1px solid #e2e8f0"/>
<p style="color:#94a3b8;font-size:12px;line-height:1.5">${esc(optOut)}<br/>${esc(bizAddr)} · Reply to this email (${esc(replyTo)}) to reach us.</p>`;
                }

                try {
                    if (dryRun) {
                        log(`  [DRY RUN] → ${contact.email} (${contact.business_name})`);
                    } else {
                        const res = await fetch('https://api.resend.com/emails', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                from: `${fromName} <${fromEmail}>`,
                                to: [contact.email],
                                reply_to: replyTo,
                                subject,
                                html: bodyHtml,
                                headers: { 'List-Unsubscribe': `<mailto:${replyTo}?subject=unsubscribe>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
                                tags: [{ name: 'campaign_id', value: camp.id }],
                            }),
                        });
                        const data = await res.json().catch(() => null);
                        if (!res.ok) {
                            failed++; consecutiveErr++;
                            const msg = (data && (data.message || data.name)) || `HTTP ${res.status}`;
                            log(`  ✖ ${contact.email}: ${msg}`, 'error');
                            await supabase.from('email_send_log').insert({ campaign_id: camp.id, contact_id: contact.id, email: contact.email, subject, sequence_step: contact.sequence_step || 0, status: 'failed', error: String(msg) });
                            // Invalid recipient -> stop retrying this address.
                            if (/invalid|not a valid|recipient/i.test(String(msg))) {
                                await supabase.from('email_contacts').update({ email_valid: false, status: 'bounced', bounced: true, updated_at: nowIso }).eq('id', contact.id);
                            }
                            if (consecutiveErr >= (settings.max_consecutive_errors ?? 5)) {
                                log(`Too many consecutive errors (${consecutiveErr}) — auto-pausing "${camp.name}".`, 'error');
                                await supabase.from('email_campaigns').update({ status: 'paused', total_failed: (camp.total_failed || 0) + failed, last_run_at: nowIso }).eq('id', camp.id);
                                await setState('failed', `Auto-paused "${camp.name}" after repeated send failures.`, { current_campaign_id: camp.id });
                                results.push({ campaign: camp.name, sent, failed, paused: true });
                                throw new Error('__break_campaign_loop__');
                            }
                            await sleep(Math.min(delayMs, 1500));
                            continue;
                        }
                        consecutiveErr = 0;
                        await supabase.from('email_send_log').insert({ campaign_id: camp.id, contact_id: contact.id, email: contact.email, subject, sequence_step: contact.sequence_step || 0, status: 'sent', resend_id: data?.id });
                        await supabase.from('email_contacts').update({ last_emailed_at: nowIso, status: 'contacted', sequence_step: (contact.sequence_step || 0) + 1, updated_at: nowIso }).eq('id', contact.id);
                    }
                    sent++;
                    await setState('sending', `Sending "${camp.name}" (${i}/${queue.length})`, { current_campaign_id: camp.id, progress_current: i, progress_total: queue.length });
                } catch (e) {
                    if ((e as Error).message === '__break_campaign_loop__') throw e;
                    failed++; consecutiveErr++;
                    log(`  ✖ ${contact.email}: ${(e as Error).message}`, 'error');
                }

                // Per-email throttle (shortened in dry-run so tests are quick).
                if (i < queue.length) await sleep(dryRun ? 250 : delayMs);
            }

            // Batch error-rate auto-pause.
            const attempted = sent + failed;
            if (!dryRun && attempted >= 5 && failed / attempted > (settings.max_error_rate ?? 0.25)) {
                log(`Error rate ${(100 * failed / attempted).toFixed(0)}% exceeded threshold — auto-pausing "${camp.name}".`, 'error');
                await supabase.from('email_campaigns').update({ status: 'paused' }).eq('id', camp.id);
            }

            // Schedule the next chunk after the longer between-chunk break.
            const nextRun = new Date(Date.now() + (settings.delay_between_chunks_ms ?? 120000)).toISOString();
            if (!dryRun) {
                await supabase.from('email_campaigns').update({
                    total_sent: (camp.total_sent || 0) + sent,
                    total_failed: (camp.total_failed || 0) + failed,
                    last_run_at: nowIso,
                    next_run_at: nextRun,
                }).eq('id', camp.id);
                await supabase.from('email_campaign_logs').insert({ campaign_id: camp.id, status: sent > 0 ? 'success' : (failed > 0 ? 'failed' : 'success'), contacts_imported: sent, contacts_skipped: failed, metadata: { dry_run: false, cycle_cap: cycleCap } });
            }

            log(`Chunk done for "${camp.name}": ${sent} sent, ${failed} failed.${dryRun ? ' (dry run)' : ` Next chunk after ${Math.round((settings.delay_between_chunks_ms ?? 120000) / 1000)}s.`}`, 'success');
            results.push({ campaign: camp.name, sent, failed, dryRun, next_run_at: dryRun ? null : nextRun });
        }

        await setState(dryRunStateNote(results), summarize(results), {});
        return ok({ success: true, dryRun: results.some((r) => r.dryRun), processed: results });
    } catch (error) {
        if ((error as Error).message === '__break_campaign_loop__') {
            return ok({ success: true, paused: true });
        }
        log(`Fatal: ${(error as Error).message}`, 'error');
        try { await setState('failed', `Orchestrator error: ${(error as Error).message}`); } catch { /* ignore */ }
        return errorResponse(error, corsHeaders);
    }

    function ok(payload: any) {
        return new Response(JSON.stringify(payload), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }
});

function summarize(results: any[]): string {
    const sent = results.reduce((a, r) => a + (r.sent || 0), 0);
    const failed = results.reduce((a, r) => a + (r.failed || 0), 0);
    if (!results.length) return 'Idle.';
    return `Cycle complete — ${sent} sent, ${failed} failed across ${results.length} campaign(s).`;
}
function dryRunStateNote(results: any[]): string {
    if (results.some((r) => r.completed)) return 'completed';
    if (results.some((r) => r.next_run_at)) return 'sending';
    return 'idle';
}

const DEFAULT_BODY = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#0f172a">
  <h2 style="color:#b91c1c;margin:0 0 8px">Get found for emergency {{trade}} jobs in {{city}}</h2>
  <p>Hi {{first_name}},</p>
  <p><strong>{{business_name}}</strong> is listed on <strong>Emergency Contractors</strong> — the directory U.S. homeowners use to find emergency contractors fast when they need urgent help.</p>
  <p>Claim your local listing to control your details and start getting calls for urgent jobs in {{city}}:</p>
  <ul>
    <li>✅ Claim your local emergency contractor listing</li>
    <li>✅ Get found by customers in your city when they need help now</li>
    <li>✅ More visibility for urgent, high-value jobs</li>
    <li>✅ Early Pro listing opportunity — free emergency-ready website for early Pro sign-ups (while available)</li>
  </ul>
  <p style="text-align:center;margin:28px 0">
    <a href="{{listing_url}}" style="background:#b91c1c;color:#fff;padding:14px 26px;border-radius:8px;text-decoration:none;font-weight:bold">Claim Your Free Listing →</a>
  </p>
  <p>Reply to this email if you have any questions — a real person will get back to you.</p>
</div>`;
