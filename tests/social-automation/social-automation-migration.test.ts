import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  "supabase/migrations/20260728081755_social_automation_foundation.sql",
);
const sql = readFileSync(migrationPath, "utf8");

describe("social automation migration", () => {
  it("creates four durable admin-only tables linked to blog posts", () => {
    for (const table of [
      "social_accounts",
      "social_campaigns",
      "social_publications",
      "social_approval_events",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS public.${table}`);
      expect(sql).toContain(
        `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`,
      );
    }

    expect(sql).toContain(
      "source_post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE RESTRICT",
    );
    expect(sql.match(/public\.is_admin\(\)/g)?.length).toBeGreaterThanOrEqual(8);
    expect(sql.match(/FOR ALL\s+TO authenticated/g)).toHaveLength(4);
    expect(sql.match(/\(select public\.is_admin\(\)\)/g)).toHaveLength(8);
  });

  it("enforces market, platform, workflow, status, and idempotency boundaries", () => {
    expect(sql).toContain("market IN ('GB', 'US')");
    expect(sql).toContain(
      "platform IN ('facebook', 'instagram', 'tiktok')",
    );
    expect(sql).toContain(
      "publishing_mode IN ('api_after_oauth', 'api_after_meta_link', 'creator_assisted')",
    );
    expect(sql).toContain(
      "connection_status IN ('unverified', 'connected', 'action_required', 'revoked')",
    );
    expect(sql).toContain(
      "state IN ('detected', 'researched', 'drafted', 'review_required', 'approved', 'scheduled', 'publishing', 'published', 'failed', 'cancelled')",
    );
    expect(sql).toContain(
      "status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled', 'creator_action_required')",
    );
    expect(sql).toContain(
      "decision IN ('requested', 'approved', 'rejected', 'cancelled')",
    );
    expect(sql).toContain("idempotency_key text NOT NULL UNIQUE");
    expect(sql).toContain("UNIQUE (campaign_id, account_id)");
  });

  it("keeps every campaign approval-first", () => {
    expect(sql).toContain("state text NOT NULL DEFAULT 'detected'");
    expect(sql).toContain(
      "safety_review_required boolean NOT NULL DEFAULT true",
    );
    expect(sql).toContain("approved_at timestamptz");
    expect(sql).toContain(
      "approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL",
    );
  });

  it("seeds only the three supplied unverified GB public identifiers", () => {
    expect(sql).toContain("61588024972553");
    expect(sql.match(/'emergencytradesmen'/g)).toHaveLength(2);
    expect(sql.match(/'unverified'/g)?.length).toBeGreaterThanOrEqual(4);
    expect(sql.match(/'GB'/g)?.length).toBeGreaterThanOrEqual(4);
    expect(sql).toContain(
      "https://www.facebook.com/profile.php?id=61588024972553",
    );
    expect(sql).toContain(
      "https://www.instagram.com/emergencytradesmen/",
    );
    expect(sql).toContain(
      "https://www.tiktok.com/@emergencytradesmen?lang=en-GB",
    );
    expect(sql).not.toMatch(/access_token|refresh_token|client_secret/i);
  });
});
