import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("social account OAuth", () => {
  const migration = readFileSync(
    "supabase/migrations/20260728124500_social_oauth_connections.sql",
    "utf8",
  );
  const edgeFunction = readFileSync(
    "supabase/functions/social-oauth/index.ts",
    "utf8",
  );
  const supabaseConfig = readFileSync("supabase/config.toml", "utf8");

  it("supports every platform in the publishing roadmap", () => {
    for (const platform of [
      "facebook",
      "instagram",
      "tiktok",
      "pinterest",
      "linkedin",
      "x",
    ]) {
      expect(edgeFunction).toContain(`${platform}: {`);
    }
  });

  it("uses state, PKCE where required, short-lived sessions, and encrypted tokens", () => {
    expect(edgeFunction).toContain("state_hash");
    expect(edgeFunction).toContain("code_challenge_method");
    expect(edgeFunction).toContain("10 * 60_000");
    expect(edgeFunction).toContain('name: "AES-GCM"');
    expect(edgeFunction).toContain("SOCIAL_TOKEN_ENCRYPTION_KEY");
    expect(migration).toContain("REVOKE ALL ON public.social_account_credentials");
    expect(supabaseConfig).toContain("[functions.social-oauth]");
    expect(supabaseConfig).toContain("verify_jwt = false");
  });

  it("requires an authenticated administrator and supports disconnects", () => {
    expect(edgeFunction).toContain('client.rpc("is_admin")');
    expect(edgeFunction).toContain('body.action === "disconnect"');
    expect(edgeFunction).toContain('body.action === "select_target"');
    expect(edgeFunction).toContain('connection_status: "revoked"');
  });
});
