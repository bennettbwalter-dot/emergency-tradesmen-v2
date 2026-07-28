import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import {
  contentHash,
  improveText,
  requiresSafetyApproval,
  reviewContent,
} from "./social_content_quality.mjs";

const EXPECTED_PROJECT_REF = "antqstrspkchkoylysqa";
const ROOT = process.cwd();

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [name, ...rest] = line.split("=");
    if (process.env[name]) continue;
    process.env[name] = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
  }
}

loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

const configuredSupabaseUrl =
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseUrl =
  configuredSupabaseUrl ?? `https://${EXPECTED_PROJECT_REF}.supabase.co`;
let serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl?.includes(EXPECTED_PROJECT_REF)) {
  throw new Error(
    `Refusing to run: SUPABASE_URL must target ${EXPECTED_PROJECT_REF}.`,
  );
}
if (!serviceRoleKey) {
  const command = process.platform === "win32" ? "cmd.exe" : "npx";
  const commandArgs =
    process.platform === "win32"
      ? [
          "/d",
          "/s",
          "/c",
          `npx.cmd supabase projects api-keys --project-ref ${EXPECTED_PROJECT_REF} --output json`,
        ]
      : [
          "supabase",
          "projects",
          "api-keys",
          "--project-ref",
          EXPECTED_PROJECT_REF,
          "--output",
          "json",
        ];
  const apiKeysJson = execFileSync(
    command,
    commandArgs,
    { cwd: ROOT, encoding: "utf8", windowsHide: true },
  );
  const apiKeys = JSON.parse(apiKeysJson);
  serviceRoleKey = apiKeys.find(
    (item) => item.name === "service_role" || item.name === "secret",
  )?.api_key;
}
if (!serviceRoleKey) {
  throw new Error(
    `No service-role key was available for ${EXPECTED_PROJECT_REF}. Log in to the Supabase CLI or set SUPABASE_SERVICE_ROLE_KEY.`,
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const skipResearch = args.has("--skip-research");
const prepareOnly = args.has("--prepare-only");
const publishOnly = args.has("--publish-only");

function sentenceFromExcerpt(excerpt, title) {
  const text = improveText(excerpt || title);
  const sentence = text.split(/(?<=[.!?])\s+/)[0] || text;
  return sentence.replace(/[.!?]+$/, "");
}

function topicHashtags(title, platform, trendHashtags = []) {
  const base = title
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4)
    .slice(0, 3)
    .map((word) => `#${word.replace(/[^a-zA-Z0-9]/g, "")}`);
  const defaults =
    platform === "tiktok"
      ? ["#HomeSafety", "#EmergencyTradesmen"]
      : ["#HomeMaintenance", "#HomeSafety"];
  return [...new Set([...trendHashtags, ...base, ...defaults])].slice(0, platform === "instagram" ? 8 : 5);
}

function platformCopy({ platform, title, excerpt, destinationUrl, trendHashtags }) {
  const cleanTitle = improveText(title);
  const lead = sentenceFromExcerpt(excerpt, title);
  const tags = topicHashtags(title, platform, trendHashtags).join(" ");

  if (platform === "instagram") {
    return {
      headline: cleanTitle,
      caption: `${lead}.\n\nSave this guide, check the warning signs, and use the link in our bio for the full advice.\n\n${tags}`,
      contentFormat: "image",
    };
  }

  if (platform === "tiktok") {
    return {
      headline: cleanTitle,
      caption: `${lead}. Watch for the warning signs and read the full guide in our bio.\n\n${tags}`,
      contentFormat: "video",
    };
  }

  if (platform === "linkedin") {
    return {
      headline: cleanTitle,
      caption: `${lead}. Read the practical safety guide: ${destinationUrl}\n\n${tags}`,
      contentFormat: "image",
    };
  }

  if (platform === "x") {
    return {
      headline: cleanTitle,
      caption: `${lead}. Read the safe checks: ${destinationUrl}\n\n${tags}`.slice(0, 280),
      contentFormat: "image",
    };
  }

  return {
    headline: cleanTitle,
    caption: `${lead}.\n\nRead the full guide, save it for later, and share it with someone who may need it: ${destinationUrl}\n\n${tags}`,
    contentFormat: "image",
  };
}

function runCommand(command, commandArgs, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: ROOT,
      env: process.env,
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Command timed out after ${timeoutMs}ms.`));
    }, timeoutMs);
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr.trim() || `Command exited with code ${code}.`));
    });
  });
}

async function researchTrends(title) {
  if (skipResearch) return { status: "skipped", hashtags: [] };
  const python = process.env.LAST30DAYS_PYTHON ?? "python";
  const skillDir =
    process.env.LAST30DAYS_SKILL_DIR ??
    "C:\\Users\\Nick\\.codex\\skills\\last30days";
  const script = path.join(skillDir, "scripts", "last30days.py");
  const topic = `${title} homeowner questions safety advice`;
  const { stdout } = await runCommand(
    python,
    [
      script,
      topic,
      "--quick",
      "--auto-resolve",
      "--emit=json",
      "--json-profile=agent",
      "--days=30",
    ],
    300_000,
  );
  const parsed = JSON.parse(stdout);
  const hashtags = [...new Set((stdout.match(/#[A-Za-z0-9_]+/g) ?? []).map((tag) => tag.toLowerCase()))].slice(0, 5);
  return {
    status: "complete",
    researched_at: new Date().toISOString(),
    engine: "last30days",
    schema_version: parsed.schema_version ?? null,
    hashtags,
  };
}

async function addEvent(campaignId, eventType, eventData = {}, publicationId = null) {
  if (dryRun) return;
  const { error } = await supabase.from("social_automation_events").insert({
    campaign_id: campaignId,
    publication_id: publicationId,
    event_type: eventType,
    event_data: eventData,
  });
  if (error) throw error;
}

async function addAlert({ campaignId, publicationId = null, severity, type, message }) {
  if (dryRun) return;
  const dedupeKey = `${campaignId}:${publicationId ?? "campaign"}:${type}`;
  const { error } = await supabase.from("social_automation_alerts").upsert(
    {
      campaign_id: campaignId,
      publication_id: publicationId,
      severity,
      alert_type: type,
      message,
      dedupe_key: dedupeKey,
      status: "open",
    },
    { onConflict: "dedupe_key" },
  );
  if (error) throw error;
}

async function refreshCampaignState(campaignId) {
  if (dryRun) return;
  const { data: publications, error } = await supabase
    .from("social_publications")
    .select("status")
    .eq("campaign_id", campaignId);
  if (error) throw error;

  const statuses = (publications ?? []).map((publication) => publication.status);
  let state = "scheduled";
  if (statuses.length > 0 && statuses.every((status) => status === "published")) {
    state = "published";
  } else if (statuses.some((status) => status === "failed")) {
    state = "failed";
  } else if (statuses.some((status) => status === "publishing")) {
    state = "publishing";
  } else if (statuses.some((status) => status === "creator_action_required")) {
    state = "review_required";
  }

  const { error: updateError } = await supabase
    .from("social_campaigns")
    .update({
      state,
      processing_completed_at:
        state === "published" || state === "failed"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", campaignId);
  if (updateError) throw updateError;
}

async function prepareCampaign(campaign, settings) {
  const post = campaign.posts;
  let trends;
  try {
    if (!dryRun) {
      await supabase
        .from("social_campaigns")
        .update({ trend_status: "running", processing_started_at: new Date().toISOString() })
        .eq("id", campaign.id);
    }
    trends = settings.trend_research_enabled
      ? await researchTrends(post.title)
      : { status: "skipped", hashtags: [] };
  } catch (error) {
    trends = { status: "failed", hashtags: [], error: error.message };
    await addAlert({
      campaignId: campaign.id,
      severity: "warning",
      type: "trend_research_failed",
      message: `Recent trend research failed. The worker can retry: ${error.message}`,
    });
  }

  let lowestScore = 50;
  let duplicateFound = false;
  let requiresApproval =
    settings.approval_mode === "always" ||
    (settings.approval_mode === "safety_only" &&
      requiresSafetyApproval(post.title, post.excerpt, post.content));

  for (const publication of campaign.social_publications) {
    const platform = publication.social_accounts.platform;
    const generated = platformCopy({
      platform,
      title: post.title,
      excerpt: post.excerpt,
      destinationUrl: publication.destination_url,
      trendHashtags: trends.hashtags,
    });
    const headlineReview = reviewContent(generated.headline);
    const captionReview = reviewContent(generated.caption);
    const score = Math.min(headlineReview.score, captionReview.score);
    lowestScore = Math.min(lowestScore, score);
    const passed = score >= settings.minimum_quality_score;
    if (!passed) requiresApproval = true;

    const generatedContentHash = contentHash(
      `${generated.headline}\n${generated.caption}`,
    );
    let duplicate = null;
    if (!dryRun) {
      const { data: duplicateRows, error: duplicateError } = await supabase
        .from("social_publications")
        .select("id")
        .eq("account_id", publication.account_id)
        .eq("content_hash", generatedContentHash)
        .neq("id", publication.id)
        .limit(1);
      if (duplicateError) throw duplicateError;
      duplicate = duplicateRows?.[0] ?? null;
    }
    if (duplicate) {
      duplicateFound = true;
      requiresApproval = true;
      await addAlert({
        campaignId: campaign.id,
        publicationId: publication.id,
        severity: "warning",
        type: "duplicate_content",
        message: `${platform} copy matches an earlier publication and will not be reused.`,
      });
    }

    const update = {
      headline: generated.headline,
      caption: generated.caption,
      content_format: generated.contentFormat,
      content_hash: generatedContentHash,
      quality_score: score,
      quality_report: {
        stop_slop: {
          passed,
          headline: headlineReview,
          caption: captionReview,
        },
      },
      generated_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString(),
      status: duplicate ? "failed" : "draft",
      last_error: duplicate
        ? "Duplicate social copy was blocked."
        : passed
          ? null
          : "Stop/Slop quality score below threshold.",
    };

    if (!dryRun) {
      const { error } = await supabase
        .from("social_publications")
        .update(update)
        .eq("id", publication.id);
      if (error) throw error;
    }
    await addEvent(campaign.id, "publication_generated", { platform, score, passed }, publication.id);
  }

  const passed = lowestScore >= settings.minimum_quality_score;
  const nextState =
    duplicateFound
      ? "failed"
      : passed && !requiresApproval
        ? "scheduled"
        : "review_required";
  if (!dryRun) {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("social_campaigns")
      .update({
        state: nextState,
        trend_status: trends.status,
        trend_snapshot: trends,
        quality_status: passed ? "passed" : "failed",
        quality_score: lowestScore,
        requires_approval: requiresApproval,
        safety_review_required: requiresApproval,
        approved_at: nextState === "scheduled" ? now : null,
        processing_completed_at: now,
        last_error: duplicateFound
          ? "Duplicate social copy was blocked."
          : passed
            ? null
            : "Stop/Slop quality gate failed.",
      })
      .eq("id", campaign.id);
    if (error) throw error;

    if (nextState === "scheduled") {
      await supabase
        .from("social_publications")
        .update({ status: "scheduled", approved_at: now })
        .eq("campaign_id", campaign.id);
    }
  }

  if (requiresApproval) {
    await addAlert({
      campaignId: campaign.id,
      severity: "warning",
      type: "approval_required",
      message: `Human approval is required for “${post.title}”.`,
    });
  }
  await addEvent(campaign.id, nextState, { quality_score: lowestScore, requires_approval: requiresApproval });
}

async function publishPublication(publication, settings) {
  const account = publication.social_accounts;
  if (account.connection_status !== "connected" || account.publishing_mode === "creator_assisted") {
    if (!dryRun) {
      await supabase
        .from("social_publications")
        .update({ status: "creator_action_required" })
        .eq("id", publication.id);
    }
    await addAlert({
      campaignId: publication.campaign_id,
      publicationId: publication.id,
      severity: "warning",
      type: "platform_connection_required",
      message: `${account.platform} needs account connection or creator approval before publishing.`,
    });
    await refreshCampaignState(publication.campaign_id);
    return;
  }

  const platformKey = `SOCIAL_PUBLISH_WEBHOOK_${account.platform.toUpperCase()}`;
  const webhook = process.env[platformKey] ?? process.env.SOCIAL_PUBLISH_WEBHOOK_URL;
  if (!webhook) {
    throw new Error(`No server-side publishing adapter is configured for ${account.platform}.`);
  }

  const response = await fetch(webhook, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(process.env.SOCIAL_PUBLISH_WEBHOOK_TOKEN
        ? { authorization: `Bearer ${process.env.SOCIAL_PUBLISH_WEBHOOK_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({
      idempotency_key: `publication:${publication.id}`,
      platform: account.platform,
      account_id: account.external_account_id,
      handle: account.handle,
      headline: publication.headline,
      caption: publication.caption,
      media_url: publication.media_url,
      destination_url: publication.destination_url,
      content_format: publication.content_format,
    }),
  });
  if (!response.ok) throw new Error(`${account.platform} adapter returned HTTP ${response.status}.`);
  const result = await response.json().catch(() => ({}));

  if (!dryRun) {
    await supabase
      .from("social_publications")
      .update({
        status: "published",
        platform_post_id: result.platform_post_id ?? result.id ?? null,
        published_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", publication.id);
  }
  await addEvent(publication.campaign_id, "publication_published", { platform: account.platform }, publication.id);
  await refreshCampaignState(publication.campaign_id);
}

async function run() {
  const { data: settings, error: settingsError } = await supabase
    .from("social_automation_settings")
    .select("*")
    .eq("id", "default")
    .single();
  if (settingsError) throw settingsError;
  if (!settings.enabled) return console.log("Social automation is disabled.");

  if (!publishOnly) {
    const { data: campaigns, error } = await supabase
      .from("social_campaigns")
      .select(`
        *,
        posts!inner(id, title, slug, excerpt, content, cover_image, published_at),
        social_publications(
          *,
          social_accounts!inner(id, platform, connection_status, publishing_mode)
        )
      `)
      .in("state", ["detected", "researched", "drafted"])
      .order("created_at", { ascending: true })
      .limit(10);
    if (error) throw error;
    for (const campaign of campaigns ?? []) await prepareCampaign(campaign, settings);
  }

  if (!prepareOnly) {
    const { data: due, error } = await supabase
      .from("social_publications")
      .select(`
        *,
        social_accounts!inner(
          id, platform, handle, external_account_id, connection_status, publishing_mode
        )
      `)
      .eq("status", "scheduled")
      .lte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(25);
    if (error) throw error;

    for (const publication of due ?? []) {
      try {
        if (!dryRun) {
          const { data: claimed, error: claimError } = await supabase
            .from("social_publications")
            .update({
              status: "publishing",
              attempt_count: publication.attempt_count + 1,
            })
            .eq("id", publication.id)
            .eq("status", publication.status)
            .select("id")
            .maybeSingle();
          if (claimError) throw claimError;
          if (!claimed) continue;
        }
        await publishPublication(publication, settings);
      } catch (error) {
        const exhausted = publication.attempt_count + 1 >= settings.max_publish_attempts;
        if (!dryRun) {
          await supabase
            .from("social_publications")
            .update({
              status: exhausted ? "failed" : "scheduled",
              last_error: error.message,
            })
            .eq("id", publication.id);
        }
        await addAlert({
          campaignId: publication.campaign_id,
          publicationId: publication.id,
          severity: exhausted ? "error" : "warning",
          type: "publish_failed",
          message: `${publication.social_accounts.platform} publish failed: ${error.message}`,
        });
        await refreshCampaignState(publication.campaign_id);
      }
    }
  }

  console.log(`Social automation run complete${dryRun ? " (dry run)" : ""}.`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
