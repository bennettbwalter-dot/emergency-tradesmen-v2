// Shared types, constants and helpers for the Email Control Centre (UK Emergency Tradesmen / US Emergency Contractors).

export interface EmailSettings {
  id: number;
  from_name: string;
  from_email: string;
  reply_to: string;
  sending_domain: string | null;
  domain_verified: boolean;
  business_address: string | null;
  opt_out_text: string | null;
  daily_limit: number;
  hourly_limit: number;
  chunk_size: number;
  delay_between_emails_ms: number;
  delay_between_chunks_ms: number;
  warmup_enabled: boolean;
  warmup_start_daily: number;
  warmup_increment: number;
  max_consecutive_errors: number;
  max_error_rate: number;
  updated_at?: string;
}

export interface EmailCampaign {
  id: string;
  created_at: string;
  name: string;
  status: 'draft' | 'paused' | 'scheduled' | 'active' | 'completed' | 'stopped';
  variant: 'hard_sell' | 'soft_sell';
  target_country: string;
  target_trade: string | null;
  target_city: string | null;
  target_state: string | null;
  subject: string | null;
  body_html: string | null;
  from_name: string | null;
  from_email: string | null;
  reply_to: string | null;
  opt_out_text: string | null;
  business_address: string | null;
  followup_sequence: FollowUp[];
  scheduled_at: string | null;
  batch_size: number;
  daily_limit: number | null;
  hourly_limit: number | null;
  cooldown_days: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_replied: number;
  total_bounced: number;
  total_unsubscribed: number;
  total_failed: number;
  total_converted: number;
  last_run_at: string | null;
  next_run_at: string | null;
}

export interface FollowUp {
  delay_days: number;
  subject: string;
  body_html: string;
}

export interface EmailContact {
  id: string;
  business_id: string | null;
  business_name: string;
  contact_name: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  trade: string | null;
  city: string | null;
  state: string | null;
  country_code: string;
  listing_url: string | null;
  source: string;
  status: string;
  email_valid: boolean;
  replied: boolean;
  unsubscribed: boolean;
  bounced: boolean;
  sequence_step: number;
  last_emailed_at: string | null;
  next_follow_up_at: string | null;
  notes: string | null;
}

export interface OrchestratorState {
  id: number;
  state: 'idle' | 'checking' | 'sending' | 'paused' | 'completed' | 'failed' | 'rate_limited' | 'setup_required';
  current_campaign_id: string | null;
  message: string | null;
  progress_current: number;
  progress_total: number;
  sent_today: number;
  log: { ts: string; level: string; line: string }[];
  last_run_at: string | null;
  updated_at: string;
}

// Trades present in the US contact pool (slug -> label).
export const US_TRADES: { slug: string; label: string }[] = [
  { slug: 'plumber', label: 'Plumbers' },
  { slug: 'electrician', label: 'Electricians' },
  { slug: 'locksmith', label: 'Locksmiths' },
  { slug: 'hvac', label: 'HVAC' },
  { slug: 'hvac-engineer', label: 'HVAC Engineers' },
  { slug: 'roofer', label: 'Roofers' },
  { slug: 'drain-specialist', label: 'Drain Cleaning' },
  { slug: 'water-restoration', label: 'Water Restoration' },
  { slug: 'glazier', label: 'Glaziers' },
  { slug: 'breakdown', label: 'Towing / Breakdown' },
  { slug: 'builder', label: 'Builders / General Contractor' },
  { slug: 'gas-engineer', label: 'Gas Engineers' },
];

export const PERSONALIZATION_FIELDS = [
  'first_name', 'business_name', 'trade', 'city', 'state', 'email', 'phone', 'website', 'listing_url',
];

export const DEFAULT_SUBJECT = 'Claim your free Emergency Tradesmen listing in {{city}}';

export const DEFAULT_TEMPLATE = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#0f172a">
  <h2 style="color:#b91c1c;margin:0 0 8px">Get found for emergency {{trade}} jobs in {{city}}</h2>
  <p>Hi {{first_name}},</p>
  <p><strong>{{business_name}}</strong> is listed on <strong>Emergency Tradesmen</strong>  -  the directory customers use to find emergency tradespeople fast when they need urgent help.</p>
  <p>Claim your local listing to control your details and start getting calls for urgent jobs in {{city}}:</p>
  <ul>
    <li>✅ Claim your local emergency listing</li>
    <li>✅ Get found by customers in your area when they need help now</li>
    <li>✅ More visibility for urgent, high-value jobs</li>
    <li>✅ Early Pro listing opportunity  -  free emergency-ready website for early Pro sign-ups (while available)</li>
  </ul>
  <p style="text-align:center;margin:28px 0">
    <a href="{{listing_url}}" style="background:#b91c1c;color:#fff;padding:14px 26px;border-radius:8px;text-decoration:none;font-weight:bold">View &amp; Claim Your Listing →</a>
  </p>
  <p>Reply to this email if you have any questions  -  a real person will get back to you.</p>
</div>`;

const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const GOOD_TLDS = new Set(['com', 'net', 'org', 'uk', 'london', 'us', 'co', 'io', 'biz', 'info', 'edu', 'gov', 'me', 'tv', 'online', 'site', 'app', 'dev', 'pro', 'email', 'company', 'services', 'inc', 'group', 'live', 'agency', 'team', 'solutions', 'llc', 'ca']);

export function isValidEmail(email: string): boolean {
  if (!email || !EMAIL_RE.test(email.trim())) return false;
  const tld = email.trim().toLowerCase().split('.').pop() || '';
  return GOOD_TLDS.has(tld);
}

export function renderTemplate(tpl: string, c: Partial<EmailContact>): string {
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
  return (tpl || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => map[k] ?? '');
}

// Parse a pasted CSV (header row required) into contact rows.
export function parseContactsCsv(text: string): { rows: Partial<EmailContact>[]; errors: string[] } {
  const errors: string[] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { rows: [], errors: ['CSV needs a header row and at least one data row.'] };

  const split = (line: string) => {
    const out: string[] = []; let cur = ''; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
      else if (ch === ',' && !inQ) { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };

  const headers = split(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'));
  const alias: Record<string, string> = {
    business: 'business_name', company: 'business_name', name: 'business_name',
    contact: 'contact_name', first_name: 'contact_name',
    mail: 'email', 'e-mail': 'email', tel: 'phone', telephone: 'phone',
    url: 'website', region: 'state', province: 'state',
  };
  const rows: Partial<EmailContact>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = split(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[alias[h] || h] = cells[idx] ?? ''; });
    if (!row.email) { errors.push(`Row ${i + 1}: missing email  -  skipped.`); continue; }
    rows.push({
      business_name: row.business_name || row.email,
      contact_name: row.contact_name || null,
      email: row.email,
      phone: row.phone || null,
      website: row.website || null,
      trade: (row.trade || '').toLowerCase() || null,
      city: row.city || null,
      state: row.state || null,
      country_code: 'US',
      source: 'import',
      status: 'new',
      email_valid: isValidEmail(row.email),
    });
  }
  return { rows, errors };
}

export const ORCH_STATE_META: Record<string, { label: string; color: string }> = {
  idle: { label: 'Idle', color: 'bg-slate-500' },
  checking: { label: 'Checking queue', color: 'bg-blue-500' },
  sending: { label: 'Sending', color: 'bg-green-500' },
  paused: { label: 'Paused', color: 'bg-amber-500' },
  completed: { label: 'Completed', color: 'bg-emerald-600' },
  failed: { label: 'Failed', color: 'bg-red-600' },
  rate_limited: { label: 'Rate limited', color: 'bg-orange-500' },
  setup_required: { label: 'Setup required', color: 'bg-purple-600' },
};
