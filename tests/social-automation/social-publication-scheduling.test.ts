import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/20260728093028_social_publication_scheduling.sql",
  "utf8",
);

describe("social publication scheduling migration", () => {
  it("stores platform copy, media, and a timezone-aware schedule", () => {
    for (const column of [
      "headline text",
      "caption text",
      "media_url text",
      "scheduled_at timestamptz",
      "schedule_timezone text",
    ]) {
      expect(sql).toContain(column);
    }

    expect(sql).toContain("status <> 'scheduled' OR scheduled_at IS NOT NULL");
    expect(sql).toContain("social_publications_schedule_idx");
  });
});
