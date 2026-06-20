// email-orchestrator — safe, throttled bulk sender for the Email Control Centre.
//
// One invocation = ONE chunk per due campaign. After a chunk it sets
// next_run_at = now + delay_between_chunks_ms so the "send N, wait, send N more"
// cadence is enforced ACROSS invocations (Edge Functions can't sleep for minutes).
// Drive repeated cycles with the "Force Run" button or an optional pg_cron job.
//
// Safety layers: domain-verified gate (auto dry-run when unverified), daily +
// hourly caps, warm-up ramp, bounce-rate guard, suppression/unsubscribe/bounce/
// reply/do-not-contact/cooldown skips, duplicate prevention, invalid-email skip,
// and auto-pause on error spikes.
//
// Sequencing: each chunk sends DUE FOLLOW-UPS first (time-sensitive), then fills
// the remaining capacity with brand-new contacts. A campaign's followup_sequence
// (jsonb array of { delay_days, subject, body_html }) defines how many follow-ups
// are allowed and when. A contact with status 'contacted' and sequence_step = N
// has already received N emails; it becomes due for followup_sequence[N-1] once
// delay_days have passed since last_emailed_at. Replied / bounced / unsubscribed /
// do_not_contact contacts are never followed up.
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
    // NOTE: deployed with verify_jwt=true, so the gateway has already verified the
    // token signature before we get here — we can trust decoded role/email claims.
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
const GOOD_TLDS = new Set(['com','net','org','uk','london','us','co','io','biz','info','edu','gov','me','tv','online','site','app','dev','pro','email','company','services','inc','group','live','agency','team','solutions','llc','ca']);
function looksValid(email: string): boolean {
    if (!email || !EMAIL_RE.test(email)) return false;
    const tld = email.toLowerCase().split('.').pop() || '';
    return GOOD_TLDS.has(tld);
}

interface FollowUp { delay_days: number; subject?: string; body_html?: string; }
function followupsOf(camp: any): FollowUp[] {
    const raw = camp?.followup_sequence;
    if (!Array.isArray(raw)) return [];
    return raw.filter((f) => f && typeof f === 'object').map((f) => ({
        delay_days: Math.max(0, Number(f.delay_days) || 0),
        subject: f.subject || undefined,
        body_html: f.body_html || undefined,
    }));
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
        listing_url: c.listing_url || 'https://emergencytradesmen.net',
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

        const domainOk = settings.domain_verified === true;
        const dryRun = requestedDryRun || !domainOk || !resendApiKey;
        if (dryRun && !requestedDryRun) {
            log(`Sending domain not verified — running in DRY RUN (no real emails sent). Verify a domain in Resend Settings to send live.`, 'warn');
        }

        let q = supabase.from('email_campaigns').select('*');
        if (onlyCampaignId) q = q.eq('id', onlyCampaignId);
        else q = q.eq('status', 'active');
        const { data: campaigns, error: cErr } = await q;
        if (cErr) throw cErr;

        const nowIso = new Date().toISOString();
        const due = (campaigns || []).filter((c) => {
            if (onlyCampaignId) return true;
            if (c.scheduled_at && c.scheduled_at > nowIso) return false;
            if (c.next_run_at && c.next_run_at > nowIso) return false;
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

            const followups = followupsOf(camp);
            log(`▶ Processing "${camp.name}" (${camp.target_trade || 'all trades'} · ${camp.target_country})${followups.length ? ` · ${followups.length} follow-up(s) configured` : ''}`);
            await setState('sending', `Sending "${camp.name}"…`, { current_campaign_id: camp.id });

            let dailyLimit = camp.daily_limit ?? settings.daily_limit ?? 200;
            const hourlyLimit = camp.hourly_limit ?? settings.hourly_limit ?? 50;
            if (settings.warmup_enabled) {
                const days = Math.floor((Date.now() - new Date(camp.created_at).getTime()) / 86_400_000);
                const warmCap = (settings.warmup_start_daily ?? 20) + (settings.warmup_increment ?? 10) * days;
                if (warmCap < dailyLimit) { dailyLimit = warmCap; log(`Warm-up active: today's cap is ${dailyLimit}.`); }
            }

            // Bounce-rate guard (spec: block sending if too many bounces happen).
            // Protects domain reputation once there's a meaningful sample.
            const attemptedAll = camp.total_sent || 0;
            const bouncedAll = camp.total_bounced || 0;
            if (!dryRun && attemptedAll >= 25 && bouncedAll / attemptedAll > 0.10) {
                const pct = (100 * bouncedAll / attemptedAll).toFixed(0);
                log(`Bounce rate ${pct}% exceeds 10% — auto-pausing "${camp.name}" to protect sending reputation. Clean/validate the list before resuming.`, 'error');
                await supabase.from('email_campaigns').update({ status: 'paused', next_run_at: null }).eq('id', camp.id);
                await setState('paused', `"${camp.name}" auto-paused: bounce rate ${pct}% (list quality).`, { current_campaign_id: camp.id });
                results.push({ campaign: camp.name, reason: 'bounce_rate', bounce_pct: pct });
                continue;
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

            // ----- shared targeting (country/trade/city/state + can-send guards) -----
            const applyTargeting = (qq: any) => {
                qq = qq.eq('country_code', camp.target_country)
                    .eq('email_valid', true)
                    .eq('unsubscribed', false).eq('bounced', false).eq('replied', false);
                if (camp.target_trade) qq = qq.eq('trade', camp.target_trade);
                if (camp.target_city) qq = qq.ilike('city', camp.target_city);
                if (camp.target_state) qq = qq.ilike('state', camp.target_state);
                return qq;
            };

            // ----- build the send queue: due follow-ups first, then new contacts -----
            // Each entry carries `stage`: 0 = first/initial email, N = followups[N-1].
            const queued: { contact: any; stage: number }[] = [];
            const overSelect = (n: number) => Math.max(n, n * 3);

            for (let i = 0; i < followups.length && queued.length < cycleCap; i++) {
                const step = i + 1; // contacts who've already had `step` emails are due for followups[i]
                const dueCut = new Date(Date.now() - followups[i].delay_days * 86_400_000).toISOString();
                const need = cycleCap - queued.length;
                let fq = applyTargeting(supabase.from('email_contacts').select('*'))
                    .eq('status', 'contacted')
                    .eq('sequence_step', step)
                    .lt('last_emailed_at', dueCut)
                    .order('last_emailed_at', { ascending: true })
                    .limit(overSelect(need));
                const { data: fdata, error: ferr } = await fq;
                if (ferr) { log(`Follow-up ${step} query error: ${ferr.message}`, 'error'); continue; }
                for (const c of (fdata || [])) { if (queued.length < cycleCap) queued.push({ contact: c, stage: step }); }
                if ((fdata?.length || 0) > 0) log(`Follow-up ${step}: ${Math.min(fdata!.length, cycleCap - (queued.length - fdata!.length))} due.`);
            }

            // Fill remaining capacity with brand-new contacts (initial outreach).
            if (queued.length < cycleCap) {
                const need = cycleCap - queued.length;
                const cooldownDays = camp.cooldown_days ?? 14;
                const cooldownCut = new Date(Date.now() - cooldownDays * 86_400_000).toISOString();
                let nq = applyTargeting(supabase.from('email_contacts').select('*'))
                    .in('status', ['new', 'queued'])
                    .or(`last_emailed_at.is.null,last_emailed_at.lt.${cooldownCut}`)
                    .limit(overSelect(need));
                const { data: ndata, error: nerr } = await nq;
                if (nerr) { log(`Contact query error: ${nerr.message}`, 'error'); }
                for (const c of (ndata || [])) { if (queued.length < cycleCap) queued.push({ contact: c, stage: 0 }); }
            }

            if (!queued.length) {
                // Nothing to send this cycle. If contacts are still mid-sequence (awaiting a
                // future follow-up window) keep the campaign active and re-check later.
                let pending = 0;
                if (followups.length) {
                    const { count } = await applyTargeting(supabase.from('email_contacts').select('id', { count: 'exact', head: true }))
                        .eq('status', 'contacted').gte('sequence_step', 1).lte('sequence_step', followups.length);
                    pending = count || 0;
                }
                if (pending > 0) {
                    const nextRun = new Date(Date.now() + (settings.delay_between_chunks_ms ?? 120000)).toISOString();
                    await supabase.from('email_campaigns').update({ last_run_at: nowIso, next_run_at: nextRun }).eq('id', camp.id);
                    log(`No emails due this cycle — ${pending} contact(s) waiting for their next follow-up window.`);
                    await setState('idle', `"${camp.name}" idle — ${pending} awaiting follow-up.`, { current_campaign_id: camp.id });
                    results.push({ campaign: camp.name, sent: 0, waiting_followups: pending });
                    continue;
                }
                log(`No remaining sendable contacts — marking "${camp.name}" completed.`, 'success');
                await supabase.from('email_campaigns').update({ status: 'completed', last_run_at: nowIso, next_run_at: null }).eq('id', camp.id);
                await setState('completed', `"${camp.name}" completed — no more contacts.`, { current_campaign_id: camp.id });
                results.push({ campaign: camp.name, sent: 0, completed: true });
                continue;
            }

            // Final duplicate / suppression guard right before sending.
            const emails = queued.map((x) => x.contact.email.toLowerCase());
            const { data: suppressed } = await supabase.from('email_suppression').select('email').in('email', emails);
            const blocked = new Set((suppressed || []).map((s) => s.email.toLowerCase()));
            const seen = new Set<string>();
            const queue = queued.filter(({ contact }) => {
                const e = contact.email.toLowerCase();
                if (blocked.has(e) || seen.has(e) || !looksValid(contact.email)) return false; // de-dupe within the chunk too
                seen.add(e);
                return true;
            });

            const followCount = queue.filter((x) => x.stage > 0).length;
            log(`Queue: ${queue.length} this chunk (${followCount} follow-up, ${queue.length - followCount} first-touch; cap ${cycleCap}; ${blocked.size} suppressed skipped).`);
            await setState('sending', `Sending chunk for "${camp.name}" (${queue.length})…`, { current_campaign_id: camp.id, progress_current: 0, progress_total: queue.length });

            const fromName = camp.from_name || settings.from_name || 'Emergency Tradesmen';
            const fromEmail = camp.from_email || settings.from_email;
            const replyTo = camp.reply_to || settings.reply_to;
            const optOut = camp.opt_out_text || settings.opt_out_text || '';
            const bizAddr = camp.business_address || settings.business_address || '';
            const delayMs = settings.delay_between_emails_ms ?? 2000;

            // Resolve the subject/body for a given send stage (0 = initial, N = followups[N-1]).
            const tplFor = (stage: number) => {
                if (stage > 0 && followups[stage - 1]) {
                    return {
                        subject: followups[stage - 1].subject || camp.subject || `Following up — claim your Emergency Tradesmen listing`,
                        body: followups[stage - 1].body_html || camp.body_html || DEFAULT_BODY,
                    };
                }
                return { subject: camp.subject || `Claim your free Emergency Tradesmen listing`, body: camp.body_html || DEFAULT_BODY };
            };

            let sent = 0, failed = 0, consecutiveErr = 0, i = 0;
            for (const { contact, stage } of queue) {
                i++;
                if (Date.now() - t0 > TIME_BUDGET_MS) { log('Time budget reached mid-chunk — stopping cleanly.', 'warn'); break; }

                const tpl = tplFor(stage);
                const newStep = (contact.sequence_step || 0) + 1; // this email is the Nth this contact receives
                const subject = render(tpl.subject, contact);
                let bodyHtml = render(tpl.body, contact);
                if (!/unsubscribe|opt[\s-]?out/i.test(bodyHtml)) {
                    bodyHtml += `<hr style="margin:28px 0;border:none;border-top:1px solid #e2e8f0"/>\n<p style="color:#94a3b8;font-size:12px;line-height:1.5">${esc(optOut)}<br/>${esc(bizAddr)} · Reply to this email (${esc(replyTo)}) to reach us.</p>`;
                }
                // next follow-up after THIS send, if the sequence has one more entry.
                const nextFollow = followups[newStep - 1];
                const nextFollowAt = nextFollow ? new Date(Date.now() + nextFollow.delay_days * 86_400_000).toISOString() : null;

                try {
                    if (dryRun) {
                        log(`  [DRY RUN] ${stage > 0 ? `follow-up ${stage}` : 'first email'} → ${contact.email} (${contact.business_name})`);
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
                            await supabase.from('email_send_log').insert({ campaign_id: camp.id, contact_id: contact.id, email: contact.email, subject, sequence_step: newStep, status: 'failed', error: String(msg) });
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
                        await supabase.from('email_send_log').insert({ campaign_id: camp.id, contact_id: contact.id, email: contact.email, subject, sequence_step: newStep, status: 'sent', resend_id: data?.id });
                        await supabase.from('email_contacts').update({ last_emailed_at: nowIso, status: 'contacted', sequence_step: newStep, next_follow_up_at: nextFollowAt, updated_at: nowIso }).eq('id', contact.id);
                    }
                    sent++;
                    await setState('sending', `Sending "${camp.name}" (${i}/${queue.length})`, { current_campaign_id: camp.id, progress_current: i, progress_total: queue.length });
                } catch (e) {
                    if ((e as Error).message === '__break_campaign_loop__') throw e;
                    failed++; consecutiveErr++;
                    log(`  ✖ ${contact.email}: ${(e as Error).message}`, 'error');
                }

                if (i < queue.length) await sleep(dryRun ? 250 : delayMs);
            }

            const attempted = sent + failed;
            if (!dryRun && attempted >= 5 && failed / attempted > (settings.max_error_rate ?? 0.25)) {
                log(`Error rate ${(100 * failed / attempted).toFixed(0)}% exceeded threshold — auto-pausing "${camp.name}".`, 'error');
                await supabase.from('email_campaigns').update({ status: 'paused' }).eq('id', camp.id);
            }

            const nextRun = new Date(Date.now() + (settings.delay_between_chunks_ms ?? 120000)).toISOString();
            if (!dryRun) {
                await supabase.from('email_campaigns').update({
                    total_sent: (camp.total_sent || 0) + sent,
                    total_failed: (camp.total_failed || 0) + failed,
                    last_run_at: nowIso,
                    next_run_at: nextRun,
                }).eq('id', camp.id);
                await supabase.from('email_campaign_logs').insert({ campaign_id: camp.id, status: sent > 0 ? 'success' : (failed > 0 ? 'failed' : 'success'), contacts_imported: sent, contacts_skipped: failed, metadata: { dry_run: false, cycle_cap: cycleCap, follow_ups: followCount } });
            }

            log(`Chunk done for "${camp.name}": ${sent} sent (${followCount} follow-up), ${failed} failed.${dryRun ? ' (dry run)' : ` Next chunk after ${Math.round((settings.delay_between_chunks_ms ?? 120000) / 1000)}s.`}`, 'success');
            results.push({ campaign: camp.name, sent, failed, follow_ups: followCount, dryRun, next_run_at: dryRun ? null : nextRun });
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
  <p><strong>{{business_name}}</strong> is listed on <strong>Emergency Tradesmen</strong> — the directory customers use to find emergency tradespeople fast when they need urgent help.</p>
  <p>Claim your local listing to control your details and start getting calls for urgent jobs in {{city}}:</p>
  <ul>
    <li>✅ Claim your local emergency listing</li>
    <li>✅ Get found by customers in your area when they need help now</li>
    <li>✅ More visibility for urgent, high-value jobs</li>
    <li>✅ Early Pro listing opportunity — free emergency-ready website for early Pro sign-ups (while available)</li>
  </ul>
  <p style="text-align:center;margin:28px 0">
    <a href="{{listing_url}}" style="background:#b91c1c;color:#fff;padding:14px 26px;border-radius:8px;text-decoration:none;font-weight:bold">View &amp; Claim Your Listing →</a>
  </p>
  <p>Reply to this email if you have any questions — a real person will get back to you.</p>
</div>`;
