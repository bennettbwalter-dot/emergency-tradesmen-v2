import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("automated blog-to-social pipeline", () => {
  const migration = readFileSync(
    "supabase/migrations/20260728100841_social_automation_pipeline.sql",
    "utf8",
  );
  const worker = readFileSync("scripts/social_automation_worker.mjs", "utf8");
  const quality = readFileSync("scripts/social_content_quality.mjs", "utf8");
  const connectionRequeue = readFileSync(
    "supabase/migrations/20260728112500_social_connection_requeue.sql",
    "utf8",
  );

  it("detects only new publish events and creates an idempotent campaign", () => {
    expect(migration).toContain("enqueue_social_campaign_after_publish");
    expect(migration).toContain("'blog:' || NEW.slug || ':social-v1'");
    expect(migration).toContain("ON CONFLICT (idempotency_key)");
    expect(migration).toContain("Existing posts are deliberately not backfilled");
  });

  it("tracks quality, events, alerts, retries, and future platforms", () => {
    expect(migration).toContain("social_automation_events");
    expect(migration).toContain("social_automation_alerts");
    expect(migration).toContain("minimum_quality_score");
    expect(migration).toContain("'pinterest', 'linkedin', 'x'");
    expect(worker).toContain("LAST30DAYS_SKILL_DIR");
    expect(worker).toContain("creator_action_required");
    expect(worker).toContain("max_publish_attempts");
    expect(worker).toContain("duplicate_content");
    expect(worker).toContain("maybeSingle");
    expect(quality).toContain("reviewContent");
    expect(quality).toContain("requiresSafetyApproval");
    expect(connectionRequeue).toContain(
      "requeue_social_publications_after_connection",
    );
  });

  it("refuses any Supabase project except Emergency Tradesmen", () => {
    expect(worker).toContain('const EXPECTED_PROJECT_REF = "antqstrspkchkoylysqa"');
    expect(worker).toContain("Refusing to run");
  });
});
