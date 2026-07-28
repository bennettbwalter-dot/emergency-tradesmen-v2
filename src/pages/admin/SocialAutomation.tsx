import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  SOCIAL_ACCOUNT_TARGETS,
  type SocialPlatform,
  summarizeSocialAccountReadiness,
} from "@/features/social-automation/accounts";
import { supabase } from "@/lib/supabase";

const platformLabels = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
} as const;

const statusLabels = {
  connected: "Connected",
  unverified: "Unverified",
  action_required: "Action required",
} as const;

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
    posts: {
      title: string;
      slug: string;
    };
  };
};

type PublicationDraft = {
  headline: string;
  caption: string;
  scheduledAt: string;
};

function toLocalInputValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function SocialAutomation() {
  const summary = summarizeSocialAccountReadiness(SOCIAL_ACCOUNT_TARGETS);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, PublicationDraft>>({});

  const {
    data: publications = [],
    isLoading: scheduleLoading,
    refetch,
  } = useQuery({
    queryKey: ["social-publication-schedule"],
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
          social_campaigns!inner(id, state, posts!inner(title, slug))
        `)
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return (data ?? []) as unknown as ScheduledPublication[];
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

      <div className="space-y-3">
        {SOCIAL_ACCOUNT_TARGETS.map((target) => (
          <article
            key={`${target.market}-${target.platform}`}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{platformLabels[target.platform]}</h2>
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
                    {statusLabels[target.connectionStatus]}
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                    {target.market}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {target.externalAccountId
                    ? `Account ID ${target.externalAccountId}`
                    : `@${target.handle}`}
                </p>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {target.verificationNote}
                </p>
              </div>
              <a
                href={target.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline"
              >
                Open profile
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </article>
        ))}
      </div>

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
          <Button variant="outline" onClick={() => refetch()} disabled={scheduleLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {scheduleLoading ? (
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
                          {platformLabels[platform]}
                        </span>
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                          {publication.status}
                        </span>
                      </div>

                      <Input
                        aria-label={`${platformLabels[platform]} headline`}
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
                        aria-label={`${platformLabels[platform]} caption`}
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
