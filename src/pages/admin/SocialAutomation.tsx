import { ExternalLink, ShieldCheck } from "lucide-react";
import {
  SOCIAL_ACCOUNT_TARGETS,
  summarizeSocialAccountReadiness,
} from "@/features/social-automation/accounts";

const platformLabels = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
} as const;

export default function SocialAutomation() {
  const summary = summarizeSocialAccountReadiness(SOCIAL_ACCOUNT_TARGETS);

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-medium text-gold">Content operations</p>
        <h1 className="mt-1 text-3xl font-display text-foreground">Social Automation</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          These are the approved account targets. They remain unverified until each
          platform connection has completed successfully.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Configured targets", summary.configured],
          ["Connected", summary.connected],
          ["Awaiting verification", summary.unverified],
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
                    Unverified
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
