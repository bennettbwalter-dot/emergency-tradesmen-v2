import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  ExternalLink,
  Link2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Unplug,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  SOCIAL_ACCOUNT_TARGETS,
  SOCIAL_PLATFORM_CATALOG,
  PLATFORM_LABELS,
  type ConnectionStatus,
  type Market,
  type SocialAccountTarget,
  type SocialPlatform,
  summarizeSocialAccountReadiness,
} from "@/features/social-automation/accounts";
import { supabase } from "@/lib/supabase";
import firstBatchReview from "../../../docs/social-pilot/2026-07-combi-boiler-pressure-first-batch.md?raw";

const statusLabels = {
  connected: "Connected",
  unverified: "Unverified",
  action_required: "Action required",
  revoked: "Disconnected",
} as const;

type SocialAccountRow = {
  id: string;
  platform: SocialPlatform;
  market: Market;
  profile_url: string;
  external_account_id: string | null;
  handle: string | null;
  connection_status: ConnectionStatus;
  publishing_mode: SocialAccountTarget["publishingMode"];
  enabled: boolean;
  connection_error: string | null;
  connection_metadata: SocialAccountTarget["connectionMetadata"];
};

type ScheduledPublication = {
  id: string;
  status: string;
  headline: string | null;
  caption: string | null;
  media_url: string | null;
  scheduled_at: string | null;
  schedule_timezone: string;
  social_accounts: {
    platform: SocialPlatform;
    connection_status: string;
  };
  social_campaigns: {
    id: string;
    state: string;
    trend_status: string;
    quality_status: string;
    quality_score: number | null;
    requires_approval: boolean;
    posts: {
      title: string;
      slug: string;
    };
  };
};

type AutomationAlert = {
  id: string;
  severity: "info" | "warning" | "error";
  alert_type: string;
  message: string;
  created_at: string;
};

type PublicationDraft = {
  headline: string;
  caption: string;
  scheduledAt: string;
};

const emptyScheduledPublications: ScheduledPublication[] = [];
const localReviewPlatforms = ["Facebook", "Instagram", "TikTok"] as const;

function extractMarkdownSection(markdown: string, heading: string) {
  const marker = `## ${heading}`;
  const start = markdown.indexOf(marker);
  if (start === -1) return "";

  const section = markdown.slice(start + marker.length).trimStart();
  const nextHeading = section.search(/\n## /);
  return (nextHeading === -1 ? section : section.slice(0, nextHeading)).trim();
}

function toLocalInputValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function SocialAutomation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, PublicationDraft>>({});
  const isLocalReview = import.meta.env.DEV && !user;

  const { data: accountData = [] } = useQuery({
    queryKey: ["social-account-connections"],
    enabled: !isLocalReview,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_accounts")
        .select(`
          id,
          platform,
          market,
          profile_url,
          external_account_id,
          handle,
          connection_status,
          publishing_mode,
          enabled,
          connection_error,
          connection_metadata
        `)
        .order("market")
        .order("platform");
      if (error) throw error;
      return (data ?? []) as SocialAccountRow[];
    },
  });
  const accountTargets: SocialAccountTarget[] = isLocalReview
    ? SOCIAL_ACCOUNT_TARGETS
    : accountData.map((account) => ({
        id: account.id,
        platform: account.platform,
        market: account.market,
        profileUrl: account.profile_url,
        externalAccountId: account.external_account_id,
        handle: account.handle,
        connectionStatus: account.connection_status,
        publishingMode: account.publishing_mode,
        enabled: account.enabled,
        verificationNote:
          account.connection_error ??
          (account.connection_status === "connected"
            ? "OAuth connection verified. Server-side credentials are stored securely."
            : "Complete the provider authorization to enable publishing."),
        connectionMetadata: account.connection_metadata,
      }));
  const summary = summarizeSocialAccountReadiness(accountTargets);

  const {
    data: publicationData,
    isLoading: scheduleLoading,
    refetch,
  } = useQuery({
    queryKey: ["social-publication-schedule"],
    enabled: !isLocalReview,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_publications")
        .select(`
          id,
          status,
          headline,
          caption,
          media_url,
          scheduled_at,
          schedule_timezone,
          social_accounts!inner(platform, connection_status),
          social_campaigns!inner(
            id,
            state,
            trend_status,
            quality_status,
            quality_score,
            requires_approval,
            posts!inner(title, slug)
          )
        `)
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return (data ?? []) as unknown as ScheduledPublication[];
    },
  });
  const publications = publicationData ?? emptyScheduledPublications;

  const { data: openAlerts = [] } = useQuery({
    queryKey: ["social-automation-alerts"],
    enabled: !isLocalReview,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_automation_alerts")
        .select("id, severity, alert_type, message, created_at")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as AutomationAlert[];
    },
  });

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        publications.map((publication) => [
          publication.id,
          {
            headline: publication.headline ?? "",
            caption: publication.caption ?? "",
            scheduledAt: toLocalInputValue(publication.scheduled_at),
          },
        ]),
      ),
    );
  }, [publications]);

  const savePublication = useMutation({
    mutationFn: async ({
      id,
      draft,
    }: {
      id: string;
      draft: PublicationDraft;
    }) => {
      if (!draft.scheduledAt) throw new Error("Choose a posting date and time.");

      const { error } = await supabase
        .from("social_publications")
        .update({
          headline: draft.headline.trim(),
          caption: draft.caption.trim(),
          scheduled_at: new Date(draft.scheduledAt).toISOString(),
          schedule_timezone: "Europe/London",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["social-publication-schedule"] });
      toast.success("Social draft and posting time saved.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not save the draft.");
    },
  });

  const approveSchedule = useMutation({
    mutationFn: async (campaignId: string) => {
      const campaignPublications = publications.filter(
        (publication) => publication.social_campaigns.id === campaignId,
      );
      const missingSchedule = campaignPublications.some(
        (publication) => !drafts[publication.id]?.scheduledAt,
      );

      if (missingSchedule) throw new Error("Every platform needs a posting time.");

      await Promise.all(
        campaignPublications.map((publication) =>
          savePublication.mutateAsync({
            id: publication.id,
            draft: drafts[publication.id],
          }),
        ),
      );

      const approvedAt = new Date().toISOString();
      const earliestSchedule = campaignPublications
        .map((publication) => new Date(drafts[publication.id].scheduledAt).getTime())
        .sort((a, b) => a - b)[0];

      const { error: campaignError } = await supabase
        .from("social_campaigns")
        .update({
          state: "scheduled",
          approved_at: approvedAt,
          approved_by: user?.id ?? null,
          scheduled_at: new Date(earliestSchedule).toISOString(),
          updated_at: approvedAt,
        })
        .eq("id", campaignId);
      if (campaignError) throw campaignError;

      const { error: publicationError } = await supabase
        .from("social_publications")
        .update({ status: "scheduled", updated_at: approvedAt })
        .eq("campaign_id", campaignId);
      if (publicationError) throw publicationError;

      const { error: approvalError } = await supabase
        .from("social_approval_events")
        .insert({
          campaign_id: campaignId,
          actor_id: user?.id ?? null,
          decision: "approved",
          notes: "Approved and scheduled from the Social Automation admin queue.",
        });
      if (approvalError) throw approvalError;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["social-publication-schedule"] });
      toast.success("Campaign approved and scheduled.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not schedule campaign.");
    },
  });

  const connectAccount = useMutation({
    mutationFn: async ({
      platform,
      accountId,
      market,
    }: {
      platform: SocialPlatform;
      accountId?: string;
      market: Market;
    }) => {
      const { data, error } = await supabase.functions.invoke("social-oauth", {
        body: {
          action: "start",
          platform,
          market,
          account_id: accountId ?? null,
          return_url: window.location.href,
        },
      });
      if (error) throw error;
      if (!data?.authorize_url) {
        throw new Error(`${PLATFORM_LABELS[platform]} did not return an authorization link.`);
      }
      window.location.assign(data.authorize_url);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not start the social account connection.",
      );
    },
  });

  const disconnectAccount = useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase.functions.invoke("social-oauth", {
        body: { action: "disconnect", account_id: accountId },
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["social-account-connections"] });
      toast.success("Social account disconnected.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not disconnect the account.",
      );
    },
  });

  const selectProviderAccount = useMutation({
    mutationFn: async ({
      accountId,
      externalAccountId,
    }: {
      accountId: string;
      externalAccountId: string;
    }) => {
      const { error } = await supabase.functions.invoke("social-oauth", {
        body: {
          action: "select_target",
          account_id: accountId,
          external_account_id: externalAccountId,
        },
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["social-account-connections"] });
      toast.success("Publishing account connected.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not select the publishing account.",
      );
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outcome = params.get("social_connection");
    const platform = params.get("platform") as SocialPlatform | null;
    if (!outcome || !platform) return;

    if (outcome === "success") {
      toast.success(`${PLATFORM_LABELS[platform]} connected.`);
      void queryClient.invalidateQueries({ queryKey: ["social-account-connections"] });
    } else if (outcome === "selection_required") {
      toast.info(`Choose which ${PLATFORM_LABELS[platform]} account to publish to.`);
      void queryClient.invalidateQueries({ queryKey: ["social-account-connections"] });
    } else {
      toast.error(`${PLATFORM_LABELS[platform]} connection was not completed.`);
    }

    params.delete("social_connection");
    params.delete("platform");
    params.delete("reason");
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, [queryClient]);

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-medium text-gold">Content operations</p>
        <h1 className="mt-1 text-3xl font-display text-foreground">Social Automation</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          These are the approved account targets and their current connection status.
          Nothing can publish until the required account actions are completed.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Configured targets", summary.configured],
          ["Connected", summary.connected],
          ["Awaiting verification", summary.unverified],
          ["Action required", summary.actionRequired],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div>
          <p className="text-sm font-medium text-gold">Account connections</p>
          <h2 className="mt-1 text-2xl font-display">Link every publishing platform</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            OAuth credentials stay server-side. Connecting an account never approves or
            publishes a queued campaign.
          </p>
        </div>
        {SOCIAL_PLATFORM_CATALOG.flatMap((definition) =>
          (["GB", "US"] as Market[]).map((market) => ({ definition, market })),
        ).map(({ definition, market }) => {
          const target = accountTargets.find(
            (candidate) =>
              candidate.platform === definition.platform && candidate.market === market,
          );
          const status = target?.connectionStatus ?? "unverified";
          const availableAccounts =
            target?.connectionMetadata?.available_accounts ?? [];

          return (
            <article
              key={`${market}-${definition.platform}`}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold">{definition.label}</h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        status === "connected"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {target ? statusLabels[status] : "Not configured"}
                    </span>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                      {market}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {target
                      ? target.externalAccountId
                        ? `Account ID ${target.externalAccountId}`
                        : target.handle
                          ? `@${target.handle}`
                          : definition.connectionSummary
                      : definition.connectionSummary}
                  </p>
                  {target && (
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                      {target.verificationNote}
                    </p>
                  )}

                  {target?.id && availableAccounts.length > 0 && (
                    <div className="mt-4 space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                      <p className="text-sm font-medium">
                        Choose the account that should receive scheduled posts
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableAccounts.map((account) => (
                          <Button
                            key={account.external_account_id}
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={selectProviderAccount.isPending}
                            onClick={() =>
                              selectProviderAccount.mutate({
                                accountId: target.id!,
                                externalAccountId: account.external_account_id,
                              })
                            }
                          >
                            {account.display_name ??
                              account.handle ??
                              account.external_account_id}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {target && (
                    <a
                      href={target.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline"
                    >
                      Open profile
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <a
                    href={definition.developerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Developer setup
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <Button
                    type="button"
                    size="sm"
                    disabled={isLocalReview || connectAccount.isPending}
                    title={
                      isLocalReview
                        ? "Sign in as an administrator to connect an account."
                        : undefined
                    }
                    onClick={() =>
                      connectAccount.mutate({
                        platform: definition.platform,
                        accountId: target?.id,
                        market,
                      })
                    }
                  >
                    {connectAccount.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Link2 className="mr-2 h-4 w-4" />
                    )}
                    {status === "connected" ? "Reconnect" : "Connect"}
                  </Button>
                  {target?.id && status === "connected" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={disconnectAccount.isPending}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Disconnect ${definition.label}? Scheduled posts will be held until it is connected again.`,
                          )
                        ) {
                          disconnectAccount.mutate(target.id!);
                        }
                      }}
                    >
                      <Unplug className="mr-2 h-4 w-4" />
                      Disconnect
                    </Button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {openAlerts.length > 0 && (
        <section className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div>
            <p className="text-sm font-medium text-amber-700">Needs attention</p>
            <h2 className="mt-1 text-2xl font-display">Automation alerts</h2>
          </div>
          {openAlerts.map((alert) => (
            <article
              key={alert.id}
              className="rounded-lg border border-amber-500/20 bg-background p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium uppercase">
                  {alert.severity}
                </span>
                <span className="text-xs text-muted-foreground">
                  {alert.alert_type.replaceAll("_", " ")}
                </span>
              </div>
              <p className="mt-2 text-sm">{alert.message}</p>
            </article>
          ))}
        </section>
      )}

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gold">Approval-first queue</p>
            <h2 className="mt-1 text-2xl font-display">Scheduled social drafts</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Edit platform copy and posting times here. Drafts only become scheduled
              after the campaign is approved.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={scheduleLoading || isLocalReview}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {isLocalReview ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm">
              <strong>Local first-batch review.</strong> This preview is read-only.
              Nothing here can approve, schedule or publish a post.
            </div>
            <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
              <img
                src="/images/social/combi-boiler-pressure-summer-9x16-v1.png"
                alt="Colour-block illustration of a combi boiler with safe pressure checks"
                className="aspect-[9/16] w-full rounded-xl border border-border object-cover"
              />
              <div className="space-y-4">
                {localReviewPlatforms.map((platform) => (
                  <article
                    key={platform}
                    className="rounded-xl border border-border bg-background p-4"
                  >
                    <h3 className="font-semibold">{platform}</h3>
                    <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {extractMarkdownSection(firstBatchReview, platform)}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : scheduleLoading ? (
          <div className="flex items-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading schedule…
          </div>
        ) : publications.length === 0 ? (
          <p className="py-8 text-sm text-muted-foreground">
            No social campaigns have been prepared yet.
          </p>
        ) : (
          <div className="space-y-5">
            {publications.map((publication, index) => {
              const draft = drafts[publication.id] ?? {
                headline: "",
                caption: "",
                scheduledAt: "",
              };
              const campaign = publication.social_campaigns;
              const platform = publication.social_accounts.platform;
              const isFirstCampaignRow =
                index === 0 ||
                publications[index - 1]?.social_campaigns.id !== campaign.id;

              return (
                <div key={publication.id} className="space-y-4">
                  {isFirstCampaignRow && (
                    <div className="flex flex-col gap-3 border-t border-border pt-5 first:border-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-semibold">{campaign.posts.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Campaign state: {campaign.state.replaceAll("_", " ")}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Trends: {campaign.trend_status.replaceAll("_", " ")} · Quality:{" "}
                          {campaign.quality_status.replaceAll("_", " ")}
                          {campaign.quality_score !== null
                            ? ` (${campaign.quality_score}/50)`
                            : ""}
                          {campaign.requires_approval ? " · Approval required" : ""}
                        </p>
                      </div>
                      {campaign.state !== "scheduled" && campaign.state !== "published" && (
                        <Button
                          onClick={() => approveSchedule.mutate(campaign.id)}
                          disabled={approveSchedule.isPending}
                        >
                          <CalendarClock className="mr-2 h-4 w-4" />
                          Approve &amp; schedule
                        </Button>
                      )}
                    </div>
                  )}

                  <article className="grid gap-4 rounded-xl border border-border bg-background p-4 lg:grid-cols-[160px_1fr]">
                    {publication.media_url ? (
                      <img
                        src={publication.media_url}
                        alt=""
                        className="aspect-[9/16] w-full rounded-lg border border-border object-cover"
                      />
                    ) : (
                      <div className="aspect-[9/16] rounded-lg bg-secondary" />
                    )}
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold">
                          {PLATFORM_LABELS[platform]}
                        </span>
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                          {publication.status}
                        </span>
                      </div>

                      <Input
                        aria-label={`${PLATFORM_LABELS[platform]} headline`}
                        value={draft.headline}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [publication.id]: {
                              ...draft,
                              headline: event.target.value,
                            },
                          }))
                        }
                      />

                      <textarea
                        aria-label={`${PLATFORM_LABELS[platform]} caption`}
                        value={draft.caption}
                        rows={7}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [publication.id]: {
                              ...draft,
                              caption: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <label className="flex-1 text-sm">
                          <span className="mb-1 block font-medium">Posting time</span>
                          <Input
                            type="datetime-local"
                            value={draft.scheduledAt}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [publication.id]: {
                                  ...draft,
                                  scheduledAt: event.target.value,
                                },
                              }))
                            }
                          />
                          <span className="mt-1 block text-xs text-muted-foreground">
                            Europe/London
                          </span>
                        </label>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            savePublication.mutate({ id: publication.id, draft })
                          }
                          disabled={savePublication.isPending}
                        >
                          Save draft
                        </Button>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div>
          <h2 className="font-semibold">Regional coverage</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The supplied profiles cover the GB brand. US accounts are still required
            before EmergencyContractors campaigns can be enabled.
          </p>
        </div>
      </div>
    </section>
  );
}
