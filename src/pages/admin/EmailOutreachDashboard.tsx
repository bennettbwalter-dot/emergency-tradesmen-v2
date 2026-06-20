import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Play, Pause, Square, Copy, Plus, Activity, Mail, Users, RefreshCw, Send, ShieldCheck,
  AlertTriangle, CheckCircle2, XCircle, Settings, Terminal, FileText, ListChecks, Upload, Trash2, Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  EmailSettings, EmailCampaign, OrchestratorState, US_TRADES, PERSONALIZATION_FIELDS,
  DEFAULT_SUBJECT, DEFAULT_TEMPLATE, renderTemplate, parseContactsCsv, isValidEmail, ORCH_STATE_META,
} from '@/lib/emailControl';

const SAMPLE_CONTACT = {
  contact_name: 'Dave Smith', business_name: 'Rapid Response Plumbing', trade: 'plumber',
  city: 'Manchester', state: '', email: 'dave@rapidplumbing.co.uk', phone: '07700 900123',
  website: 'https://rapidplumbing.co.uk', listing_url: 'https://emergencytradesmen.net/business/123',
};

function complianceBlockers(s?: EmailSettings | null, c?: Partial<EmailCampaign> | null, sendable?: number): string[] {
  const b: string[] = [];
  if (!s?.from_email) b.push('No sender (From) email configured — set it in Resend Settings.');
  if (!s?.reply_to) b.push('No reply-to email configured — set it in Resend Settings.');
  if (c && !c.subject?.trim()) b.push('Campaign is missing a subject line.');
  if (!(c?.opt_out_text || s?.opt_out_text)) b.push('No opt-out / unsubscribe text configured.');
  if (!(c?.business_address || s?.business_address)) b.push('No business address configured (required by CAN-SPAM).');
  if (typeof sendable === 'number' && sendable === 0) b.push('No sendable contacts match this campaign.');
  return b;
}

const PAGE_SIZE = 25;

export default function EmailOutreachDashboard() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [posthogUrl, setPosthogUrl] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('posthog_dashboard_embed_url');
    if (saved) setPosthogUrl(saved);
  }, []);

  // ---------------------------------------------------------------- queries
  const { data: settings } = useQuery({
    queryKey: ['ecc-settings'],
    queryFn: async (): Promise<EmailSettings | null> => {
      const { data, error } = await supabase.from('email_settings').select('*').eq('id', 1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['ecc-campaigns'],
    queryFn: async (): Promise<EmailCampaign[]> => {
      const { data, error } = await supabase.from('email_campaigns').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as EmailCampaign[];
    },
  });

  const { data: orch } = useQuery({
    queryKey: ['ecc-orch'],
    refetchInterval: 4000,
    queryFn: async (): Promise<OrchestratorState | null> => {
      const { data, error } = await supabase.from('email_orchestrator_state').select('*').eq('id', 1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: contactStats } = useQuery({
    queryKey: ['ecc-contact-stats'],
    queryFn: async () => {
      const head = async (build: (q: any) => any) => {
        const { count } = await build(supabase.from('email_contacts').select('id', { count: 'exact', head: true }));
        return count || 0;
      };
      const [total, valid, sendable, replied, bounced, unsub] = await Promise.all([
        head((q) => q),
        head((q) => q.eq('email_valid', true)),
        head((q) => q.eq('email_valid', true).eq('unsubscribed', false).eq('bounced', false).eq('replied', false).in('status', ['new', 'queued'])),
        head((q) => q.eq('replied', true)),
        head((q) => q.eq('bounced', true)),
        head((q) => q.eq('unsubscribed', true)),
      ]);
      const { count: suppressed } = await supabase.from('email_suppression').select('email', { count: 'exact', head: true });
      return { total, valid, invalid: total - valid, sendable, replied, bounced, unsub, suppressed: suppressed || 0 };
    },
  });

  const { data: sendLog } = useQuery({
    queryKey: ['ecc-sendlog'],
    refetchInterval: activeTab === 'logs' ? 6000 : false,
    queryFn: async () => {
      const { data } = await supabase.from('email_send_log').select('*').order('created_at', { ascending: false }).limit(50);
      return data || [];
    },
  });

  const { data: campaignLogs } = useQuery({
    queryKey: ['ecc-campaignlogs'],
    queryFn: async () => {
      const { data } = await supabase.from('email_campaign_logs').select('*').order('created_at', { ascending: false }).limit(30);
      return data || [];
    },
  });

  // ---------------------------------------------------------------- mutations
  const invalidateAll = () => {
    ['ecc-settings', 'ecc-campaigns', 'ecc-orch', 'ecc-contact-stats', 'ecc-sendlog', 'ecc-campaignlogs', 'ecc-contacts'].forEach(
      (k) => qc.invalidateQueries({ queryKey: [k] }),
    );
  };

  const saveSettings = useMutation({
    mutationFn: async (patch: Partial<EmailSettings>) => {
      const { error } = await supabase.from('email_settings').upsert({ id: 1, ...patch, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ecc-settings'] }); toast.success('Settings saved'); },
    onError: (e: any) => toast.error(`Save failed: ${e.message}`),
  });

  const setCampaignStatus = useMutation({
    mutationFn: async ({ id, status, extra }: { id: string; status: string; extra?: any }) => {
      const { error } = await supabase.from('email_campaigns').update({ status, ...extra }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ecc-campaigns'] }); toast.success('Campaign updated'); },
    onError: (e: any) => toast.error(`Error: ${e.message}`),
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('email_campaigns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ecc-campaigns'] }); toast.success('Campaign deleted'); },
    onError: (e: any) => toast.error(`Error: ${e.message}`),
  });

  const runOrchestrator = useMutation({
    mutationFn: async (body?: { campaign_id?: string; dryRun?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('email-orchestrator', { body: body || {} });
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      invalidateAll();
      if (data?.state === 'setup_required') toast.warning(`Setup required: ${data?.problems?.join(' ') || ''}`);
      else if (data?.dryRun) toast.info('Dry run complete — no real emails were sent (domain not verified).');
      else {
        const sent = (data?.processed || []).reduce((a: number, r: any) => a + (r.sent || 0), 0);
        toast.success(`Orchestrator cycle done — ${sent} sent.`);
      }
    },
    onError: (e: any) => toast.error(`Orchestrator error: ${e.message}`),
  });

  const sendTest = useMutation({
    mutationFn: async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
      const { data, error } = await supabase.functions.invoke('send-email', { body: { to, subject, html } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => toast.success('Test email sent — check the inbox.'),
    onError: (e: any) => toast.error(`Test failed: ${e.message}`),
  });

  // ---------------------------------------------------------------- launch helper
  const launchCampaign = async (camp: EmailCampaign, amount: number, live: boolean) => {
    const blockers = complianceBlockers(settings, camp);
    if (blockers.length) { toast.error(blockers[0]); setActiveTab('campaigns'); return; }
    if (live && !settings?.domain_verified) {
      toast.error('Sending domain not verified — live sending is blocked. Run a Dry Run or verify a domain in Deliverability.');
      return;
    }
    await supabase.from('email_campaigns').update({ status: 'active', daily_limit: amount, next_run_at: null, scheduled_at: null }).eq('id', camp.id);
    qc.invalidateQueries({ queryKey: ['ecc-campaigns'] });
    toast.message(`Starting "${camp.name}"`, { description: `Up to ${amount} today, in throttled chunks of ${settings?.chunk_size ?? 10}.` });
    runOrchestrator.mutate({ campaign_id: camp.id, dryRun: !live });
  };

  const orchMeta = ORCH_STATE_META[orch?.state || 'idle'] || ORCH_STATE_META.idle;
  const domainVerified = !!settings?.domain_verified;

  // ================================================================ render
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Control Centre</h1>
          <p className="text-muted-foreground mt-1">{settings?.from_name || 'Emergency Tradesmen'}{settings?.sending_domain ? ` · ${settings.sending_domain}` : ''} — safe, throttled outreach through Resend.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { invalidateAll(); toast.success('Refreshed'); }}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={() => runOrchestrator.mutate({})} disabled={runOrchestrator.isPending} className="bg-blue-600 hover:bg-blue-700">
            <Play className="w-4 h-4 mr-2" />
            {runOrchestrator.isPending ? 'Processing…' : 'Force Run Orchestrator'}
          </Button>
        </div>
      </div>

      {/* Orchestrator status strip */}
      <Card>
        <CardContent className="py-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 min-w-[220px]">
            <span className={`w-3 h-3 rounded-full ${orchMeta.color} ${orch?.state === 'sending' ? 'animate-pulse' : ''}`} />
            <div>
              <div className="font-semibold">{orchMeta.label}</div>
              <div className="text-xs text-muted-foreground">{orch?.message || 'Orchestrator ready.'}</div>
            </div>
          </div>
          {!!(orch?.progress_total) && (
            <div className="flex-1 min-w-[200px]">
              <Progress value={Math.round((100 * (orch?.progress_current || 0)) / (orch?.progress_total || 1))} />
              <div className="text-xs text-muted-foreground mt-1">{orch?.progress_current}/{orch?.progress_total} this chunk</div>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs">
            {!domainVerified && (
              <Badge variant="outline" className="border-amber-300 text-amber-700"><AlertTriangle className="w-3 h-3 mr-1" /> Test mode — domain not verified</Badge>
            )}
            {domainVerified && <Badge className="bg-emerald-600"><ShieldCheck className="w-3 h-3 mr-1" /> Live sending enabled</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Hands-free automation (pg_cron) */}
      <AutomationCard />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview"><Activity className="w-4 h-4 mr-1" />Overview</TabsTrigger>
          <TabsTrigger value="campaigns"><Mail className="w-4 h-4 mr-1" />Campaigns</TabsTrigger>
          <TabsTrigger value="contacts"><Users className="w-4 h-4 mr-1" />Contacts</TabsTrigger>
          <TabsTrigger value="templates"><FileText className="w-4 h-4 mr-1" />Templates</TabsTrigger>
          <TabsTrigger value="queue"><ListChecks className="w-4 h-4 mr-1" />Send Queue</TabsTrigger>
          <TabsTrigger value="resend"><Settings className="w-4 h-4 mr-1" />Resend Settings</TabsTrigger>
          <TabsTrigger value="deliverability"><ShieldCheck className="w-4 h-4 mr-1" />Deliverability</TabsTrigger>
          <TabsTrigger value="posthog"><Activity className="w-4 h-4 mr-1" />PostHog</TabsTrigger>
          <TabsTrigger value="logs"><Terminal className="w-4 h-4 mr-1" />Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab campaigns={campaigns} contactStats={contactStats} settings={settings} orch={orch} setTab={setActiveTab} />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <CampaignsTab
            campaigns={campaigns} loading={campaignsLoading} settings={settings}
            onStatus={(id, status, extra) => setCampaignStatus.mutate({ id, status, extra })}
            onDelete={(id) => deleteCampaign.mutate(id)}
            onLaunch={launchCampaign}
            onDryRun={(id) => runOrchestrator.mutate({ campaign_id: id, dryRun: true })}
            onSaved={() => qc.invalidateQueries({ queryKey: ['ecc-campaigns'] })}
          />
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <ContactsTab onChanged={() => { qc.invalidateQueries({ queryKey: ['ecc-contacts'] }); qc.invalidateQueries({ queryKey: ['ecc-contact-stats'] }); }} />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplatesTab />
        </TabsContent>

        <TabsContent value="queue" className="mt-6">
          <SendQueueTab campaigns={campaigns} settings={settings} onForceRun={() => runOrchestrator.mutate({})} />
        </TabsContent>

        <TabsContent value="resend" className="mt-6">
          <ResendSettingsTab settings={settings} onSave={(p) => saveSettings.mutate(p)} onTest={(p) => sendTest.mutate(p)} testing={sendTest.isPending} />
        </TabsContent>

        <TabsContent value="deliverability" className="mt-6">
          <DeliverabilityTab settings={settings} contactStats={contactStats} onSave={(p) => saveSettings.mutate(p)} onChanged={() => qc.invalidateQueries({ queryKey: ['ecc-contact-stats'] })} />
        </TabsContent>

        <TabsContent value="posthog" className="mt-6">
          <PostHogTab url={posthogUrl} setUrl={(u) => { setPosthogUrl(u); localStorage.setItem('posthog_dashboard_embed_url', u); }} />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <LogsTab orch={orch} sendLog={sendLog} campaignLogs={campaignLogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ============================================================ AUTOMATION */
function fmtAgo(iso?: string | null): string {
  if (!iso) return 'never';
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 0) return 'just now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

function AutomationCard() {
  const qc = useQueryClient();
  const { data: auto, error, isLoading } = useQuery<any>({
    queryKey: ['ecc-automation'],
    refetchInterval: 15000,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('email_automation_status');
      if (error) throw error;
      return data;
    },
  });
  const setEnabled = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase.rpc('email_automation_set_enabled', { p_enabled: enabled });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ecc-automation'] }); toast.success('Automation updated'); },
    onError: (e: any) => toast.error(`Automation: ${e.message}`),
  });
  const runNow = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('email_automation_run_now');
      if (error) throw error;
      // pg_net performs the HTTP call asynchronously, so wait and then read the real outcome.
      await new Promise((r) => setTimeout(r, 4500));
      const { data } = await supabase.rpc('email_automation_status');
      return data as any;
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ['ecc-automation'] });
      qc.invalidateQueries({ queryKey: ['ecc-orch'] });
      const h = data?.last_http;
      if (h?.status === 200) toast.success('Run complete — orchestrator responded 200 OK.');
      else if (h?.status) toast.error(`Run failed — HTTP ${h.status}. ${h.body || ''}`.trim());
      else toast.message('Triggered — result not captured yet. Click Refresh in a moment.');
    },
    onError: (e: any) => toast.error(`Run failed: ${e.message}`),
  });

  const msg = String((error as any)?.message || '');
  const backendMissing = /does not exist|could not find|schema cache|email_automation_status/i.test(msg);
  const adminOnly = /admin only|permission denied|jwt|not authorized/i.test(msg);

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base"><Clock className="w-4 h-4 text-blue-600" /> Hands-free Automation (UK)</CardTitle>
          {auto && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{auto.enabled ? 'On' : 'Off'}</span>
              <Switch checked={!!auto.enabled} disabled={setEnabled.isPending || !(auto.vault_secret_valid ?? auto.vault_secret_present)}
                onCheckedChange={(v) => setEnabled.mutate(v)} />
            </div>
          )}
        </div>
        <CardDescription>
          pg_cron calls the orchestrator on a schedule (service-role auth) so sends keep flowing with nobody logged in.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        {isLoading && <div className="text-muted-foreground">Loading automation status…</div>}
        {error && backendMissing && (
          <div className="text-amber-700">Automation backend isn’t installed yet — run the setup SQL in Supabase, then Refresh.</div>
        )}
        {error && !backendMissing && adminOnly && (
          <div className="text-amber-700">Sign in as the admin account to view and control automation.</div>
        )}
        {error && !backendMissing && !adminOnly && (
          <div className="text-red-600">Couldn’t load automation status: {msg}</div>
        )}
        {auto && (
          <div className="space-y-3">
            {!auto.vault_secret_present && (
              <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 p-2 text-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Vault secret <code>email_orchestrator_service_key</code> not set — the toggle stays disabled until you add it (Supabase → Project Settings → Vault).</span>
              </div>
            )}
            {auto.vault_secret_present && auto.vault_secret_valid === false && (
              <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 p-2 text-red-800 text-xs">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>The stored key isn’t a valid <code>service_role</code> JWT (must start with <code>eyJ</code>) — it looks like the placeholder or a wrong key. Update it (see the SQL), then click Run now.</span>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><div className="text-xs uppercase tracking-wider text-muted-foreground">Status</div>
                <div className="font-semibold flex items-center gap-1">
                  {auto.enabled ? <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Running</> : <><Pause className="w-4 h-4 text-amber-600" /> Paused</>}
                </div></div>
              <div><div className="text-xs uppercase tracking-wider text-muted-foreground">Schedule</div>
                <div className="font-mono text-sm">{auto.schedule || '—'}</div></div>
              <div><div className="text-xs uppercase tracking-wider text-muted-foreground">Last check</div>
                <div className="flex items-center gap-1">{fmtAgo(auto.last_run?.start_time)}{auto.last_run?.status ? <Badge variant="outline" className="ml-1">{auto.last_run.status}</Badge> : null}</div></div>
              <div><div className="text-xs uppercase tracking-wider text-muted-foreground">Active campaigns</div>
                <div className="font-semibold">{auto.active_campaigns ?? 0}</div></div>
            </div>
            <div className="text-xs text-muted-foreground">
              Engine: <span className="font-medium">{auto.orchestrator_state || 'idle'}</span>
              {auto.orchestrator_message ? ` — ${auto.orchestrator_message}` : ''} · updated {fmtAgo(auto.orchestrator_updated_at)}
            </div>
            {auto.last_http && (
              <div className="text-xs flex items-center gap-1 flex-wrap">
                <span className="text-muted-foreground">Last automation call:</span>
                <Badge variant="outline" className={auto.last_http.status === 200 ? 'border-emerald-300 text-emerald-700' : 'border-red-300 text-red-700'}>
                  HTTP {auto.last_http.status}
                </Badge>
                {auto.last_http.status !== 200 && auto.last_http.body ? <span className="text-red-600">{auto.last_http.body}</span> : null}
                <span className="text-muted-foreground">· {fmtAgo(auto.last_http.created)}</span>
              </div>
            )}
            {auto.active_campaigns === 0 && auto.enabled && (
              <div className="text-xs text-blue-700">Automation is on, but no campaign is <b>active</b> — nothing sends until you Resume a campaign in the Campaigns tab.</div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => runNow.mutate()} disabled={runNow.isPending || !(auto.vault_secret_valid ?? auto.vault_secret_present)}>
                <Play className="w-4 h-4 mr-1" /> {runNow.isPending ? 'Triggering…' : 'Run now'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => qc.invalidateQueries({ queryKey: ['ecc-automation'] })}>
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================ OVERVIEW */
function OverviewTab({ campaigns, contactStats, settings, orch, setTab }: any) {
  const totals = useMemo(() => {
    const c = campaigns || [];
    const sum = (k: string) => c.reduce((a: number, x: any) => a + (x[k] || 0), 0);
    return { sent: sum('total_sent'), opened: sum('total_opened'), clicked: sum('total_clicked'), replied: sum('total_replied'), bounced: sum('total_bounced'), unsub: sum('total_unsubscribed'), converted: sum('total_converted') };
  }, [campaigns]);
  const active = (campaigns || []).filter((c: any) => c.status === 'active').length;
  const openRate = totals.sent ? Math.round((100 * totals.opened) / totals.sent) : 0;
  const stat = (label: string, value: any, sub?: string) => (
    <Card><CardContent className="py-4"><div className="text-2xl font-bold">{value}</div><div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>{sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}</CardContent></Card>
  );
  return (
    <div className="space-y-6">
      {!settings?.domain_verified && (
        <Card className="border-amber-300 bg-amber-50/50">
          <CardContent className="py-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <strong>Test mode.</strong> Sending domain isn't verified yet, so bulk sending is blocked and the orchestrator runs as a non-destructive dry run.
              Verify a domain in <button className="underline font-medium" onClick={() => setTab('deliverability')}>Deliverability</button> to send live.
            </div>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {stat('Emails sent', totals.sent)}
        {stat('Opens', totals.opened, `${openRate}% open rate`)}
        {stat('Clicks', totals.clicked)}
        {stat('Replies', totals.replied)}
        {stat('Bounces', totals.bounced)}
        {stat('Unsubscribes', totals.unsub)}
        {stat('Listing claims', totals.converted)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stat('Active campaigns', active)}
        {stat('Total contacts', contactStats?.total ?? '—')}
        {stat('Sendable now', contactStats?.sendable ?? '—', 'valid · not opted-out · not emailed')}
        {stat('Suppressed', contactStats?.suppressed ?? '—', 'unsub + bounce + complaints')}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Pipeline economics</CardTitle><CardDescription>Cost-per-lead and ROI populate as conversions are tracked. Resend's first 3,000 emails/month are free.</CardDescription></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><div className="text-muted-foreground">Reply rate</div><div className="text-lg font-semibold">{totals.sent ? `${((100 * totals.replied) / totals.sent).toFixed(1)}%` : '—'}</div></div>
          <div><div className="text-muted-foreground">Bounce rate</div><div className="text-lg font-semibold">{totals.sent ? `${((100 * totals.bounced) / totals.sent).toFixed(1)}%` : '—'}</div></div>
          <div><div className="text-muted-foreground">Claims</div><div className="text-lg font-semibold">{totals.converted}</div></div>
          <div><div className="text-muted-foreground">Cost / lead</div><div className="text-lg font-semibold">{totals.converted ? `£${(0).toFixed(2)}` : '—'}</div></div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================ CAMPAIGNS */
function CampaignsTab({ campaigns, loading, settings, onStatus, onDelete, onLaunch, onDryRun, onSaved }: any) {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editing, setEditing] = useState<EmailCampaign | null>(null);

  if (loading) return <div className="p-8 text-muted-foreground">Loading campaigns…</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Campaigns</h2>
        <Button onClick={() => { setEditing(null); setBuilderOpen(true); }}><Plus className="w-4 h-4 mr-2" /> New Campaign</Button>
      </div>

      <div className="grid gap-4">
        {(campaigns || []).map((camp: EmailCampaign) => {
          const blockers = complianceBlockers(settings, camp);
          return (
            <Card key={camp.id} className="overflow-hidden">
              <div className="p-4 px-6 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">{camp.name}</h3>
                      <Badge className={camp.status === 'active' ? 'bg-green-500' : camp.status === 'paused' ? 'bg-amber-500' : camp.status === 'completed' ? 'bg-emerald-600' : camp.status === 'stopped' ? 'bg-red-500' : ''} variant={['active', 'paused', 'completed', 'stopped'].includes(camp.status) ? 'default' : 'outline'}>{camp.status.toUpperCase()}</Badge>
                      <Badge variant="outline">{camp.variant === 'hard_sell' ? 'Hard sell' : 'Soft sell'}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>Trade: <strong>{US_TRADES.find((t) => t.slug === camp.target_trade)?.label || camp.target_trade || 'All'}</strong></span>
                      <span>Region: <strong>{camp.target_country === 'US' ? 'USA' : 'UK'}{[camp.target_city, camp.target_state].filter(Boolean).length ? ' · ' + [camp.target_city, camp.target_state].filter(Boolean).join(', ') : ''}</strong></span>
                      <span>Cooldown: <strong>{camp.cooldown_days}d</strong></span>
                      {camp.scheduled_at && <span>Scheduled: <strong>{new Date(camp.scheduled_at).toLocaleString()}</strong></span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(camp); setBuilderOpen(true); }}>Edit</Button>
                    <Button size="icon" variant="ghost" title="Duplicate" onClick={async () => {
                      const { id, created_at, ...rest } = camp as any;
                      await supabase.from('email_campaigns').insert({ ...rest, name: `${camp.name} (copy)`, status: 'draft', total_sent: 0, total_opened: 0, total_clicked: 0, total_replied: 0, total_bounced: 0, total_unsubscribed: 0, last_run_at: null, next_run_at: null });
                      onSaved(); toast.success('Campaign duplicated');
                    }}><Copy className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" title="Delete" onClick={() => { if (confirm(`Delete "${camp.name}"? This cannot be undone.`)) onDelete(camp.id); }}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 md:grid-cols-7 gap-2 text-center">
                  {[['Sent', camp.total_sent], ['Opened', camp.total_opened], ['Clicked', camp.total_clicked], ['Replied', camp.total_replied], ['Bounced', camp.total_bounced], ['Unsub', camp.total_unsubscribed], ['Failed', camp.total_failed]].map(([l, v]) => (
                    <div key={l as string} className="bg-muted/40 rounded p-2"><div className="font-bold">{v as number}</div><div className="text-[10px] uppercase text-muted-foreground">{l}</div></div>
                  ))}
                </div>

                {blockers.length > 0 && (
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /><span>Before launching: {blockers.join(' ')}</span></div>
                )}

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground mr-1">Send batch:</span>
                  <Button size="sm" variant="outline" disabled={blockers.length > 0} onClick={() => onLaunch(camp, 50, settings?.domain_verified)}>50</Button>
                  <Button size="sm" variant="outline" disabled={blockers.length > 0} onClick={() => onLaunch(camp, 100, settings?.domain_verified)}>100</Button>
                  <CustomSendButton disabled={blockers.length > 0} onSend={(n) => onLaunch(camp, n, settings?.domain_verified)} />
                  <Button size="sm" variant="ghost" disabled={blockers.length > 0} onClick={() => onDryRun(camp.id)} title="Simulate a chunk without sending"><Activity className="w-4 h-4 mr-1" />Dry run</Button>
                  <div className="flex-1" />
                  {camp.status === 'active' ? (
                    <Button size="sm" variant="outline" className="text-amber-600 border-amber-200" onClick={() => onStatus(camp.id, 'paused', { next_run_at: null })}><Pause className="w-4 h-4 mr-1" />Pause</Button>
                  ) : (camp.status === 'paused' || camp.status === 'scheduled') ? (
                    <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={() => onStatus(camp.id, 'active', { next_run_at: null })}><Play className="w-4 h-4 mr-1" />Resume</Button>
                  ) : null}
                  {camp.status !== 'stopped' && camp.status !== 'completed' && (
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => onStatus(camp.id, 'stopped', { next_run_at: null })}><Square className="w-4 h-4 mr-1" />Stop</Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {!campaigns?.length && (
          <div className="text-center p-12 bg-muted/30 rounded-lg border border-dashed">
            <Mail className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No campaigns yet.</p>
            <p className="text-sm mt-1">Click “New Campaign” to build your first Emergency Tradesmen outreach sequence.</p>
          </div>
        )}
      </div>

      <CampaignBuilder open={builderOpen} onOpenChange={setBuilderOpen} campaign={editing} settings={settings} onSaved={() => { setBuilderOpen(false); onSaved(); }} />
    </div>
  );
}

function CustomSendButton({ onSend, disabled }: { onSend: (n: number) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(25);
  return (
    <>
      <Button size="sm" variant="outline" disabled={disabled} onClick={() => setOpen(true)}>Custom…</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Custom batch size</DialogTitle><DialogDescription>How many emails should this campaign send today (in throttled chunks)?</DialogDescription></DialogHeader>
          <Input type="number" min={1} max={1000} value={n} onChange={(e) => setN(parseInt(e.target.value) || 0)} />
          <DialogFooter><Button onClick={() => { if (n > 0) { onSend(n); setOpen(false); } }}>Send up to {n}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------------------------------- Campaign builder dialog */
function CampaignBuilder({ open, onOpenChange, campaign, settings, onSaved }: any) {
  const empty = {
    name: '', variant: 'soft_sell', target_country: 'GB', target_trade: '', target_city: '', target_state: '',
    subject: DEFAULT_SUBJECT, body_html: DEFAULT_TEMPLATE, batch_size: 50, daily_limit: 50, hourly_limit: 30,
    cooldown_days: 14, scheduled_at: '', status: 'draft',
  };
  const [form, setForm] = useState<any>(empty);
  useEffect(() => { setForm(campaign ? { ...empty, ...campaign, scheduled_at: campaign.scheduled_at ? campaign.scheduled_at.slice(0, 16) : '' } : empty); /* eslint-disable-next-line */ }, [campaign, open]);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async (launchScheduled = false) => {
    if (!form.name?.trim()) { toast.error('Campaign needs a name.'); return; }
    if (!form.subject?.trim()) { toast.error('Campaign needs a subject line.'); return; }
    const payload: any = {
      name: form.name, variant: form.variant, target_country: form.target_country || 'GB',
      target_trade: form.target_trade || null, target_city: form.target_city || null, target_state: form.target_state || null,
      subject: form.subject, body_html: form.body_html, batch_size: Number(form.batch_size) || 50,
      daily_limit: Number(form.daily_limit) || null, hourly_limit: Number(form.hourly_limit) || null,
      cooldown_days: Number(form.cooldown_days) || 14,
      from_name: settings?.from_name, reply_to: settings?.reply_to, opt_out_text: settings?.opt_out_text, business_address: settings?.business_address,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      status: launchScheduled && form.scheduled_at ? 'scheduled' : (form.status === 'active' ? 'active' : form.status || 'draft'),
    };
    let error;
    if (campaign?.id) ({ error } = await supabase.from('email_campaigns').update(payload).eq('id', campaign.id));
    else ({ error } = await supabase.from('email_campaigns').insert(payload));
    if (error) { toast.error(error.message); return; }
    toast.success(campaign?.id ? 'Campaign updated' : 'Campaign created');
    onSaved();
  };

  const preview = renderTemplate(form.body_html || '', SAMPLE_CONTACT);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{campaign?.id ? 'Edit campaign' : 'New campaign'}</DialogTitle><DialogDescription>Outreach campaign. Personalisation tokens: {PERSONALIZATION_FIELDS.map((f) => `{{${f}}}`).join(' ')}</DialogDescription></DialogHeader>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div><Label>Campaign name</Label><Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="UK Plumbers — Claim Listing" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Region</Label>
                <Select value={form.target_country || 'GB'} onValueChange={(v) => set('target_country', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="GB">United Kingdom (Emergency Tradesmen)</SelectItem><SelectItem value="US">United States (Emergency Contractors)</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Target trade</Label>
                <Select value={form.target_trade || 'all'} onValueChange={(v) => set('target_trade', v === 'all' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="All trades" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All trades</SelectItem>{US_TRADES.map((t) => <SelectItem key={t.slug} value={t.slug}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Approach</Label>
                <Select value={form.variant} onValueChange={(v) => set('variant', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="soft_sell">Soft sell</SelectItem><SelectItem value="hard_sell">Hard sell</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Target city (optional)</Label><Input value={form.target_city} onChange={(e) => set('target_city', e.target.value)} placeholder={form.target_country === 'US' ? 'e.g. Dallas' : 'e.g. Manchester'} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Target {form.target_country === 'US' ? 'state' : 'county'} (optional)</Label><Input value={form.target_state} onChange={(e) => set('target_state', e.target.value)} placeholder={form.target_country === 'US' ? 'e.g. TX' : 'e.g. Greater Manchester'} /></div>
            </div>
            <div><Label>Subject line</Label><Input value={form.subject} onChange={(e) => set('subject', e.target.value)} /></div>
            <div><Label>Email body (HTML, supports tokens)</Label><Textarea rows={10} value={form.body_html} onChange={(e) => set('body_html', e.target.value)} className="font-mono text-xs" /></div>
            <div className="grid grid-cols-4 gap-2">
              <div><Label className="text-xs">Batch size</Label><Input type="number" value={form.batch_size} onChange={(e) => set('batch_size', e.target.value)} /></div>
              <div><Label className="text-xs">Daily cap</Label><Input type="number" value={form.daily_limit || ''} onChange={(e) => set('daily_limit', e.target.value)} /></div>
              <div><Label className="text-xs">Hourly cap</Label><Input type="number" value={form.hourly_limit || ''} onChange={(e) => set('hourly_limit', e.target.value)} /></div>
              <div><Label className="text-xs">Cooldown (d)</Label><Input type="number" value={form.cooldown_days} onChange={(e) => set('cooldown_days', e.target.value)} /></div>
            </div>
            <div><Label className="text-xs flex items-center gap-1"><Clock className="w-3 h-3" />Schedule send (optional)</Label><Input type="datetime-local" value={form.scheduled_at} onChange={(e) => set('scheduled_at', e.target.value)} /></div>
          </div>

          <div className="space-y-2">
            <Label>Live preview</Label>
            <div className="border rounded-lg p-3 bg-white max-h-[420px] overflow-y-auto" dangerouslySetInnerHTML={{ __html: preview }} />
            <p className="text-xs text-muted-foreground">Compliance footer (opt-out, business address, reply-to) is added automatically to every send.</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {form.scheduled_at && <Button variant="secondary" onClick={() => save(true)}>Save &amp; schedule</Button>}
          <Button onClick={() => save(false)}>{campaign?.id ? 'Save changes' : 'Create campaign'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================ CONTACTS */
function ContactsTab({ onChanged }: any) {
  const [filters, setFilters] = useState({ country: 'GB', trade: 'all', status: 'all', city: '', state: '', quick: 'all', search: '' });
  const [page, setPage] = useState(0);
  const [importOpen, setImportOpen] = useState(false);

  const { data, isFetching } = useQuery({
    queryKey: ['ecc-contacts', filters, page],
    queryFn: async () => {
      let q = supabase.from('email_contacts').select('*', { count: 'exact' }).order('created_at', { ascending: false });
      if (filters.country !== 'all') q = q.eq('country_code', filters.country);
      if (filters.trade !== 'all') q = q.eq('trade', filters.trade);
      if (filters.status !== 'all') q = q.eq('status', filters.status);
      if (filters.city) q = q.ilike('city', `%${filters.city}%`);
      if (filters.state) q = q.ilike('state', `%${filters.state}%`);
      if (filters.search) q = q.or(`business_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      if (filters.quick === 'not_emailed') q = q.is('last_emailed_at', null);
      if (filters.quick === 'replied') q = q.eq('replied', true);
      if (filters.quick === 'bounced') q = q.eq('bounced', true);
      if (filters.quick === 'unsubscribed') q = q.eq('unsubscribed', true);
      if (filters.quick === 'invalid') q = q.eq('email_valid', false);
      q = q.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      const { data, count, error } = await q;
      if (error) throw error;
      return { rows: data || [], count: count || 0 };
    },
  });

  const act = async (id: string, patch: any, suppress?: { email: string; reason: string }) => {
    await supabase.from('email_contacts').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
    if (suppress) await supabase.from('email_suppression').upsert({ email: suppress.email.toLowerCase(), reason: suppress.reason }, { onConflict: 'email' });
    onChanged(); toast.success('Contact updated');
  };

  const setF = (k: string, v: any) => { setFilters((f) => ({ ...f, [k]: v })); setPage(0); };
  const totalPages = Math.ceil((data?.count || 0) / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end justify-between">
        <div className="flex flex-wrap gap-2 items-end">
          <div><Label className="text-xs">Search</Label><Input className="h-9 w-44" placeholder="name or email" value={filters.search} onChange={(e) => setF('search', e.target.value)} /></div>
          <div><Label className="text-xs">Region</Label>
            <Select value={filters.country} onValueChange={(v) => setF('country', v)}><SelectTrigger className="h-9 w-28"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="GB">UK</SelectItem><SelectItem value="US">USA</SelectItem><SelectItem value="all">All</SelectItem></SelectContent></Select>
          </div>
          <div><Label className="text-xs">Trade</Label>
            <Select value={filters.trade} onValueChange={(v) => setF('trade', v)}><SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All trades</SelectItem>{US_TRADES.map((t) => <SelectItem key={t.slug} value={t.slug}>{t.label}</SelectItem>)}</SelectContent></Select>
          </div>
          <div><Label className="text-xs">State</Label><Input className="h-9 w-20" value={filters.state} onChange={(e) => setF('state', e.target.value)} /></div>
          <div><Label className="text-xs">City</Label><Input className="h-9 w-28" value={filters.city} onChange={(e) => setF('city', e.target.value)} /></div>
          <div><Label className="text-xs">Quick filter</Label>
            <Select value={filters.quick} onValueChange={(v) => setF('quick', v)}><SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everyone</SelectItem>
                <SelectItem value="not_emailed">Not emailed yet</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                <SelectItem value="invalid">Invalid email</SelectItem>
              </SelectContent></Select>
          </div>
        </div>
        <Button variant="outline" onClick={() => setImportOpen(true)}><Upload className="w-4 h-4 mr-2" />Import CSV</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Business</TableHead><TableHead>Email</TableHead><TableHead>Trade</TableHead><TableHead>City/State</TableHead><TableHead>Status</TableHead><TableHead>Last emailed</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(data?.rows || []).map((c: any) => (
                <TableRow key={c.id} className={!c.email_valid ? 'opacity-60' : ''}>
                  <TableCell className="font-medium">{c.business_name}{c.contact_name && <div className="text-xs text-muted-foreground">{c.contact_name}</div>}</TableCell>
                  <TableCell className="text-sm">{c.email}{!c.email_valid && <Badge variant="outline" className="ml-2 text-red-500 border-red-200">invalid</Badge>}</TableCell>
                  <TableCell className="text-sm">{US_TRADES.find((t) => t.slug === c.trade)?.label || c.trade || '—'}</TableCell>
                  <TableCell className="text-sm">{[c.city, c.state].filter(Boolean).join(', ') || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={c.unsubscribed ? 'text-purple-600 border-purple-200' : c.bounced ? 'text-red-600 border-red-200' : c.replied ? 'text-blue-600 border-blue-200' : c.status === 'contacted' ? 'text-green-600 border-green-200' : ''}>{c.unsubscribed ? 'unsubscribed' : c.bounced ? 'bounced' : c.replied ? 'replied' : c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.last_emailed_at ? new Date(c.last_emailed_at).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {!c.replied && <Button size="sm" variant="ghost" title="Mark replied (stops follow-ups)" onClick={() => act(c.id, { replied: true, status: 'replied' })}>Replied</Button>}
                    {!c.unsubscribed && <Button size="sm" variant="ghost" className="text-purple-600" title="Unsubscribe + suppress" onClick={() => act(c.id, { unsubscribed: true, status: 'unsubscribed' }, { email: c.email, reason: 'unsubscribe' })}>Unsub</Button>}
                  </TableCell>
                </TableRow>
              ))}
              {!data?.rows?.length && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{isFetching ? 'Loading…' : 'No contacts match these filters.'}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{data?.count ?? 0} contacts</span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span>Page {page + 1} / {Math.max(1, totalPages)}</span>
          <Button size="sm" variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>

      <ImportContactsDialog open={importOpen} onOpenChange={setImportOpen} onDone={onChanged} />
    </div>
  );
}

function ImportContactsDialog({ open, onOpenChange, onDone }: any) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const doImport = async () => {
    const { rows, errors } = parseContactsCsv(text);
    if (!rows.length) { toast.error(errors[0] || 'No valid rows found.'); return; }
    setBusy(true);
    // upsert on lower(email) — duplicate prevention is enforced by the unique index.
    const { error } = await supabase.from('email_contacts').upsert(rows as any, { onConflict: 'email', ignoreDuplicates: true });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Imported ${rows.length} contact(s)${errors.length ? ` · ${errors.length} skipped` : ''}.`);
    setText(''); onOpenChange(false); onDone();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Import contacts (CSV)</DialogTitle><DialogDescription>Paste CSV with a header row. Recognised columns: business_name, contact_name, email, phone, website, trade, city, state. Duplicate emails are skipped automatically.</DialogDescription></DialogHeader>
        <Textarea rows={10} className="font-mono text-xs" placeholder={'business_name,email,trade,city,state\nRapid Plumbing,info@rapid.co.uk,plumber,Manchester,Greater Manchester'} value={text} onChange={(e) => setText(e.target.value)} />
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={busy || !text.trim()} onClick={doImport}>{busy ? 'Importing…' : 'Import'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================ TEMPLATES */
function TemplatesTab() {
  const [tpl, setTpl] = useState(DEFAULT_TEMPLATE);
  const preview = renderTemplate(tpl, SAMPLE_CONTACT);
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Default outreach template</CardTitle><CardDescription>This is the Emergency Tradesmen “claim your listing” template used when a campaign has no custom body. Tokens: {PERSONALIZATION_FIELDS.map((f) => `{{${f}}}`).join(' ')}</CardDescription></CardHeader>
        <CardContent><Textarea rows={18} className="font-mono text-xs" value={tpl} onChange={(e) => setTpl(e.target.value)} />
          <p className="text-xs text-muted-foreground mt-2">Edit a campaign to save a custom body. This tab is a live scratchpad + reference for the personalisation tokens.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Preview (sample contact)</CardTitle><CardDescription>{SAMPLE_CONTACT.business_name} · {SAMPLE_CONTACT.city}, {SAMPLE_CONTACT.state}</CardDescription></CardHeader>
        <CardContent><div className="border rounded-lg p-3 bg-white" dangerouslySetInnerHTML={{ __html: preview }} /></CardContent>
      </Card>
    </div>
  );
}

/* ============================================================ SEND QUEUE */
function SendQueueTab({ campaigns, settings, onForceRun }: any) {
  const active = (campaigns || []).filter((c: EmailCampaign) => ['active', 'scheduled'].includes(c.status));
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle className="text-base">Throttle settings (current)</CardTitle><CardDescription>Edit these in Resend Settings.</CardDescription></div>
          <Button onClick={onForceRun}><Play className="w-4 h-4 mr-2" />Run next chunk now</Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <div><div className="text-muted-foreground">Chunk size</div><div className="font-semibold">{settings?.chunk_size ?? '—'} emails</div></div>
          <div><div className="text-muted-foreground">Between emails</div><div className="font-semibold">{((settings?.delay_between_emails_ms ?? 0) / 1000)}s</div></div>
          <div><div className="text-muted-foreground">Between chunks</div><div className="font-semibold">{Math.round((settings?.delay_between_chunks_ms ?? 0) / 1000)}s</div></div>
          <div><div className="text-muted-foreground">Daily cap</div><div className="font-semibold">{settings?.daily_limit ?? '—'}</div></div>
          <div><div className="text-muted-foreground">Hourly cap</div><div className="font-semibold">{settings?.hourly_limit ?? '—'}</div></div>
        </CardContent>
      </Card>

      <h3 className="font-semibold">Queued campaigns</h3>
      {active.length === 0 && <div className="text-center p-10 bg-muted/30 rounded border border-dashed text-muted-foreground">Nothing queued. Launch a campaign from the Campaigns tab.</div>}
      {active.map((c: EmailCampaign) => <QueueRow key={c.id} campaign={c} settings={settings} />)}
    </div>
  );
}

function QueueRow({ campaign, settings }: { campaign: EmailCampaign; settings: any }) {
  const { data } = useQuery({
    queryKey: ['ecc-queue', campaign.id],
    refetchInterval: 8000,
    queryFn: async () => {
      const day = new Date(); day.setUTCHours(0, 0, 0, 0);
      const { count: sentToday } = await supabase.from('email_send_log').select('id', { count: 'exact', head: true }).eq('campaign_id', campaign.id).eq('status', 'sent').gte('created_at', day.toISOString());
      let q = supabase.from('email_contacts').select('id', { count: 'exact', head: true }).eq('country_code', campaign.target_country || 'GB').eq('email_valid', true).eq('unsubscribed', false).eq('bounced', false).eq('replied', false).in('status', ['new', 'queued']);
      if (campaign.target_trade) q = q.eq('trade', campaign.target_trade);
      if (campaign.target_city) q = q.ilike('city', `%${campaign.target_city}%`);
      const { count: remaining } = await q;
      return { sentToday: sentToday || 0, remaining: remaining || 0 };
    },
  });
  const cap = campaign.daily_limit ?? settings?.daily_limit ?? 200;
  const nextIn = campaign.next_run_at ? Math.max(0, Math.round((new Date(campaign.next_run_at).getTime() - Date.now()) / 1000)) : 0;
  return (
    <Card><CardContent className="py-4 flex flex-wrap items-center gap-4">
      <div className="min-w-[180px]"><div className="font-semibold">{campaign.name}</div><Badge className={campaign.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}>{campaign.status}</Badge></div>
      <div className="flex-1 min-w-[200px]"><Progress value={Math.min(100, Math.round((100 * (data?.sentToday || 0)) / (cap || 1)))} /><div className="text-xs text-muted-foreground mt-1">{data?.sentToday || 0} / {cap} today · {data?.remaining ?? '—'} eligible remaining</div></div>
      {nextIn > 0 && <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />Next chunk in {nextIn}s</div>}
    </CardContent></Card>
  );
}

/* ============================================================ RESEND SETTINGS */
function ResendSettingsTab({ settings, onSave, onTest, testing }: any) {
  const [f, setF] = useState<any>({});
  useEffect(() => { setF(settings || {}); }, [settings]);
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));
  const [testTo, setTestTo] = useState('');
  useEffect(() => { setTestTo(settings?.reply_to || ''); }, [settings]);

  if (!settings) return <div className="p-8 text-muted-foreground">Loading settings…</div>;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Sender configuration</CardTitle><CardDescription>The RESEND_API_KEY lives as a server secret (never in the browser). These control the From/Reply-To and identity.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>From name</Label><Input value={f.from_name || ''} onChange={(e) => set('from_name', e.target.value)} /></div>
          <div><Label>From email</Label><Input value={f.from_email || ''} onChange={(e) => set('from_email', e.target.value)} /><p className="text-xs text-muted-foreground mt-1">Use onboarding@resend.dev for testing, or an address on your verified domain for live sending.</p></div>
          <div><Label>Reply-to email</Label><Input value={f.reply_to || ''} onChange={(e) => set('reply_to', e.target.value)} /></div>
          <div><Label>Business address (CAN-SPAM)</Label><Input value={f.business_address || ''} onChange={(e) => set('business_address', e.target.value)} /></div>
          <div><Label>Opt-out / unsubscribe text</Label><Textarea rows={2} value={f.opt_out_text || ''} onChange={(e) => set('opt_out_text', e.target.value)} /></div>
          <Button onClick={() => onSave({ from_name: f.from_name, from_email: f.from_email, reply_to: f.reply_to, business_address: f.business_address, opt_out_text: f.opt_out_text })}>Save sender settings</Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Throttling &amp; safety</CardTitle><CardDescription>Controls how fast the orchestrator sends.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Chunk size</Label><Input type="number" value={f.chunk_size ?? ''} onChange={(e) => set('chunk_size', +e.target.value)} /></div>
              <div><Label className="text-xs">Delay between emails (ms)</Label><Input type="number" value={f.delay_between_emails_ms ?? ''} onChange={(e) => set('delay_between_emails_ms', +e.target.value)} /></div>
              <div><Label className="text-xs">Delay between chunks (ms)</Label><Input type="number" value={f.delay_between_chunks_ms ?? ''} onChange={(e) => set('delay_between_chunks_ms', +e.target.value)} /></div>
              <div><Label className="text-xs">Daily limit</Label><Input type="number" value={f.daily_limit ?? ''} onChange={(e) => set('daily_limit', +e.target.value)} /></div>
              <div><Label className="text-xs">Hourly limit</Label><Input type="number" value={f.hourly_limit ?? ''} onChange={(e) => set('hourly_limit', +e.target.value)} /></div>
              <div><Label className="text-xs">Max consecutive errors</Label><Input type="number" value={f.max_consecutive_errors ?? ''} onChange={(e) => set('max_consecutive_errors', +e.target.value)} /></div>
            </div>
            <div className="flex items-center justify-between border rounded p-2"><div><div className="text-sm font-medium">Warm-up mode</div><div className="text-xs text-muted-foreground">Start at {f.warmup_start_daily}/day, +{f.warmup_increment}/day</div></div><Switch checked={!!f.warmup_enabled} onCheckedChange={(v) => set('warmup_enabled', v)} /></div>
            <Button onClick={() => onSave({ chunk_size: f.chunk_size, delay_between_emails_ms: f.delay_between_emails_ms, delay_between_chunks_ms: f.delay_between_chunks_ms, daily_limit: f.daily_limit, hourly_limit: f.hourly_limit, max_consecutive_errors: f.max_consecutive_errors, warmup_enabled: f.warmup_enabled })}>Save throttling</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Send a test email</CardTitle><CardDescription>Verifies Resend end-to-end (uses the From/Reply-To above).</CardDescription></CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="you@example.com" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
            <Button disabled={testing || !isValidEmail(testTo)} onClick={() => onTest({ to: testTo, subject: `${settings?.from_name || 'Emergency Tradesmen'} — test email`, html: '<p>✅ Your Resend integration works. This is a test from the Email Control Centre.</p>' })}><Send className="w-4 h-4 mr-2" />{testing ? 'Sending…' : 'Send test'}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------- List validation (DNS/MX + optional mailbox) */
function ListValidationCard() {
  const qc = useQueryClient();
  const [country, setCountry] = useState('GB');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState('');

  const { data: v, refetch } = useQuery({
    queryKey: ['ecc-validation', country],
    queryFn: async () => {
      const c = async (build: (q: any) => any) => {
        const { count } = await build(supabase.from('email_contacts').select('id', { count: 'exact', head: true }).eq('country_code', country));
        return count || 0;
      };
      const [valid_mx, unvalidated, no_mx, dead, mailbox] = await Promise.all([
        c((q) => q.eq('email_valid', true).eq('validation_status', 'valid_mx')),
        c((q) => q.eq('email_valid', true).is('validation_status', null)),
        c((q) => q.eq('validation_status', 'no_mx')),
        c((q) => q.eq('validation_status', 'dead_domain')),
        c((q) => q.eq('validation_status', 'mailbox_invalid')),
      ]);
      return { valid_mx, unvalidated, no_mx, dead, mailbox };
    },
  });

  const run = async () => {
    setRunning(true);
    let total = 0, invalid = 0;
    try {
      for (let guard = 0; guard < 300; guard++) {
        const { data, error } = await supabase.functions.invoke('validate-contacts', { body: { country, limit: 300 } });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        total += data.checked || 0; invalid += data.invalidated || 0;
        setProgress(`Checked ${total}… ${data.remaining ?? 0} remaining`);
        refetch();
        if (data.done || (data.checked || 0) === 0) break;
      }
      toast.success(`Validation complete — checked ${total}, ${invalid} invalid removed.`);
    } catch (e: any) { toast.error(`Validation failed: ${e.message}`); }
    finally { setRunning(false); setProgress(''); refetch(); qc.invalidateQueries({ queryKey: ['ecc-contact-stats'] }); }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="w-4 h-4" />List validation</CardTitle>
        <CardDescription>DNS/MX check removes dead &amp; web-only domains (guaranteed bounces). Add an <code>EMAIL_VERIFY_API_KEY</code> secret (ZeroBounce) to also verify mailboxes.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end gap-2">
          <div><Label className="text-xs">Region</Label>
            <Select value={country} onValueChange={setCountry}><SelectTrigger className="h-9 w-28"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="GB">UK</SelectItem><SelectItem value="US">USA</SelectItem></SelectContent></Select>
          </div>
          <Button disabled={running} onClick={run}>{running ? (progress || 'Validating…') : 'Run DNS validation'}</Button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">Valid (has mail server): </span><strong className="text-emerald-600">{v?.valid_mx ?? '—'}</strong></div>
          <div><span className="text-muted-foreground">Unvalidated: </span><strong>{v?.unvalidated ?? '—'}</strong></div>
          <div><span className="text-muted-foreground">Dead domain: </span><strong className="text-red-600">{v?.dead ?? '—'}</strong></div>
          <div><span className="text-muted-foreground">No mail server: </span><strong className="text-red-600">{v?.no_mx ?? '—'}</strong></div>
          {(v?.mailbox ?? 0) > 0 && <div><span className="text-muted-foreground">Bad mailbox: </span><strong className="text-red-600">{v?.mailbox}</strong></div>}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================ DELIVERABILITY */
function DeliverabilityTab({ settings, contactStats, onSave, onChanged }: any) {
  const [dns, setDns] = useState<Record<string, boolean>>({ spf: false, dkim: false, dmarc: false });
  const [domain, setDomain] = useState('');
  const [suppEmail, setSuppEmail] = useState('');
  useEffect(() => {
    setDomain(settings?.sending_domain || '');
    try { const s = JSON.parse(localStorage.getItem('ecc_dns_checklist') || '{}'); setDns({ spf: !!s.spf, dkim: !!s.dkim, dmarc: !!s.dmarc }); } catch { /* */ }
  }, [settings]);
  const toggleDns = (k: string) => setDns((d) => { const n = { ...d, [k]: !d[k] }; localStorage.setItem('ecc_dns_checklist', JSON.stringify(n)); return n; });

  const addSuppression = async () => {
    if (!isValidEmail(suppEmail)) { toast.error('Enter a valid email'); return; }
    await supabase.from('email_suppression').upsert({ email: suppEmail.toLowerCase(), reason: 'manual' }, { onConflict: 'email' });
    await supabase.from('email_contacts').update({ unsubscribed: true, status: 'unsubscribed' }).ilike('email', suppEmail);
    setSuppEmail(''); onChanged(); toast.success('Added to suppression list');
  };

  const allDns = dns.spf && dns.dkim && dns.dmarc;
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className={settings?.domain_verified ? 'border-emerald-300' : 'border-amber-300'}>
        <CardHeader><CardTitle className="text-base flex items-center gap-2">{settings?.domain_verified ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />} Sending domain</CardTitle><CardDescription>Bulk live sending is blocked until your domain is verified in Resend and marked verified here.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Sending domain</Label><Input placeholder="emergencytradesmen.net" value={domain} onChange={(e) => setDomain(e.target.value)} /></div>
          <div className="flex items-center justify-between border rounded p-2">
            <div><div className="text-sm font-medium">Domain verified in Resend</div><div className="text-xs text-muted-foreground">Only enable after Resend shows the domain as verified.</div></div>
            <Switch checked={!!settings?.domain_verified} disabled={!allDns} onCheckedChange={(v) => onSave({ domain_verified: v, sending_domain: domain })} />
          </div>
          {!allDns && <p className="text-xs text-amber-700">Tick SPF, DKIM and DMARC first.</p>}
          <Button variant="outline" onClick={() => onSave({ sending_domain: domain })}>Save domain</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">SPF / DKIM / DMARC checklist</CardTitle><CardDescription>Add these DNS records (Resend shows the exact values), then tick each once it verifies.</CardDescription></CardHeader>
        <CardContent className="space-y-2">
          {[['spf', 'SPF record published'], ['dkim', 'DKIM keys verified in Resend'], ['dmarc', 'DMARC policy (p=none → quarantine)']].map(([k, label]) => (
            <label key={k} className="flex items-center gap-3 border rounded p-2 cursor-pointer">
              <input type="checkbox" checked={dns[k as string]} onChange={() => toggleDns(k as string)} />
              <span className="text-sm">{label}</span>
              {dns[k as string] ? <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" /> : <XCircle className="w-4 h-4 text-muted-foreground ml-auto" />}
            </label>
          ))}
        </CardContent>
      </Card>

      <ListValidationCard />

      <Card>
        <CardHeader><CardTitle className="text-base">List hygiene</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><div className="text-muted-foreground">Valid emails</div><div className="text-lg font-semibold text-emerald-600">{contactStats?.valid ?? '—'}</div></div>
          <div><div className="text-muted-foreground">Invalid (skipped)</div><div className="text-lg font-semibold text-red-600">{contactStats?.invalid ?? '—'}</div></div>
          <div><div className="text-muted-foreground">Bounced</div><div className="text-lg font-semibold">{contactStats?.bounced ?? '—'}</div></div>
          <div><div className="text-muted-foreground">Unsubscribed</div><div className="text-lg font-semibold">{contactStats?.unsub ?? '—'}</div></div>
          <div className="col-span-2"><div className="text-muted-foreground">Suppression list size</div><div className="text-lg font-semibold">{contactStats?.suppressed ?? '—'}</div></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Add to suppression list</CardTitle><CardDescription>This address will never be emailed by any campaign.</CardDescription></CardHeader>
        <CardContent className="flex gap-2"><Input placeholder="email to block" value={suppEmail} onChange={(e) => setSuppEmail(e.target.value)} /><Button onClick={addSuppression}>Suppress</Button></CardContent>
      </Card>
    </div>
  );
}

/* ============================================================ POSTHOG */
function PostHogTab({ url, setUrl }: { url: string; setUrl: (u: string) => void }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle>PostHog Live Dashboard</CardTitle><CardDescription>Embed a shared PostHog dashboard to track funnels and ROI.</CardDescription></div>
        <Button variant="outline" size="sm" asChild><a href="https://eu.posthog.com" target="_blank" rel="noopener noreferrer">Open PostHog ↗</a></Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Paste PostHog 'Shared Dashboard' URL here…" value={url} onChange={(e) => setUrl(e.target.value)} />
        {url ? (
          <div className="w-full h-[800px] border rounded-lg overflow-hidden bg-muted/20"><iframe src={url} width="100%" height="100%" frameBorder="0" title="PostHog" /></div>
        ) : (
          <div className="w-full aspect-video bg-muted border rounded-lg flex flex-col items-center justify-center">
            <Activity className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold text-muted-foreground">PostHog dashboard not linked</h3>
            <p className="text-sm text-muted-foreground/70 max-w-md text-center mt-2">In PostHog, open a dashboard → Share → create a public link, then paste the URL above.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================ LOGS */
function LogsTab({ orch, sendLog, campaignLogs }: any) {
  const lines = (orch?.log || []) as { ts: string; level: string; line: string }[];
  const color = (lvl: string) => lvl === 'error' ? 'text-red-400' : lvl === 'warn' ? 'text-amber-400' : lvl === 'success' ? 'text-emerald-400' : 'text-slate-300';
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Terminal className="w-4 h-4" />Orchestrator log</CardTitle></CardHeader>
        <CardContent>
          <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs h-[320px] overflow-y-auto">
            {lines.length === 0 && <div className="text-slate-500">$ waiting for orchestrator activity…</div>}
            {lines.slice().reverse().map((l, i) => (
              <div key={i} className={color(l.level)}><span className="text-slate-600">{new Date(l.ts).toLocaleTimeString()} </span>{l.line}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Recent sends</CardTitle></CardHeader>
          <CardContent className="max-h-[300px] overflow-y-auto">
            <Table><TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead>When</TableHead></TableRow></TableHeader>
              <TableBody>
                {(sendLog || []).map((s: any) => (
                  <TableRow key={s.id}><TableCell className="text-xs">{s.email}</TableCell><TableCell><Badge variant="outline" className={s.status === 'sent' ? 'text-emerald-600 border-emerald-200' : s.status === 'bounced' ? 'text-red-600 border-red-200' : s.status === 'failed' ? 'text-red-500' : ''}>{s.status}</Badge></TableCell><TableCell className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</TableCell></TableRow>
                ))}
                {!sendLog?.length && <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground text-sm">No sends logged yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Batch history</CardTitle></CardHeader>
          <CardContent className="max-h-[300px] overflow-y-auto">
            <Table><TableHeader><TableRow><TableHead>Status</TableHead><TableHead>Sent</TableHead><TableHead>Skipped</TableHead><TableHead>When</TableHead></TableRow></TableHeader>
              <TableBody>
                {(campaignLogs || []).map((l: any) => (
                  <TableRow key={l.id}><TableCell><Badge variant="outline">{l.status}</Badge></TableCell><TableCell>{l.contacts_imported}</TableCell><TableCell>{l.contacts_skipped}</TableCell><TableCell className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</TableCell></TableRow>
                ))}
                {!campaignLogs?.length && <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">No batches yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
