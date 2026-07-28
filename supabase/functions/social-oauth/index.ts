import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Platform =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "pinterest"
  | "linkedin"
  | "x";
type Market = "GB" | "US";

type ProviderConfig = {
  authorizeUrl: string;
  tokenUrl: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  scopes: string[];
  scopeSeparator: " " | ",";
  usePkce: boolean;
};

type Identity = {
  externalAccountId: string;
  handle: string | null;
  profileUrl: string;
  displayName: string | null;
  accountType: string | null;
  accessToken?: string;
  metadata?: Record<string, unknown>;
};

const SUPPORTED_PLATFORMS: Platform[] = [
  "facebook",
  "instagram",
  "tiktok",
  "pinterest",
  "linkedin",
  "x",
];
const DEFAULT_RETURN_URL =
  "https://emergencytradesmen.net/admin/social-automation";
const ALLOWED_ORIGINS = new Set([
  "https://emergencytradesmen.net",
  "https://emergencycontractors.net",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  ...(Deno.env.get("SOCIAL_OAUTH_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

function providerConfig(platform: Platform): ProviderConfig {
  const graphVersion = Deno.env.get("META_GRAPH_VERSION") ?? "v23.0";
  const configs: Record<Platform, ProviderConfig> = {
    facebook: {
      authorizeUrl: `https://www.facebook.com/${graphVersion}/dialog/oauth`,
      tokenUrl: `https://graph.facebook.com/${graphVersion}/oauth/access_token`,
      clientIdEnv: "META_APP_ID",
      clientSecretEnv: "META_APP_SECRET",
      scopes: ["pages_show_list", "pages_read_engagement", "pages_manage_posts"],
      scopeSeparator: ",",
      usePkce: false,
    },
    instagram: {
      authorizeUrl: `https://www.facebook.com/${graphVersion}/dialog/oauth`,
      tokenUrl: `https://graph.facebook.com/${graphVersion}/oauth/access_token`,
      clientIdEnv: "META_APP_ID",
      clientSecretEnv: "META_APP_SECRET",
      scopes: [
        "pages_show_list",
        "pages_read_engagement",
        "instagram_basic",
        "instagram_content_publish",
      ],
      scopeSeparator: ",",
      usePkce: false,
    },
    tiktok: {
      authorizeUrl: "https://www.tiktok.com/v2/auth/authorize/",
      tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
      clientIdEnv: "TIKTOK_CLIENT_KEY",
      clientSecretEnv: "TIKTOK_CLIENT_SECRET",
      scopes: ["user.info.basic", "video.publish"],
      scopeSeparator: ",",
      usePkce: true,
    },
    pinterest: {
      authorizeUrl: "https://www.pinterest.com/oauth/",
      tokenUrl: "https://api.pinterest.com/v5/oauth/token",
      clientIdEnv: "PINTEREST_APP_ID",
      clientSecretEnv: "PINTEREST_APP_SECRET",
      scopes: ["user_accounts:read", "boards:read", "pins:read", "pins:write"],
      scopeSeparator: ",",
      usePkce: false,
    },
    linkedin: {
      authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
      tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
      clientIdEnv: "LINKEDIN_CLIENT_ID",
      clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
      scopes: ["openid", "profile", "w_member_social"],
      scopeSeparator: " ",
      usePkce: false,
    },
    x: {
      authorizeUrl: "https://x.com/i/oauth2/authorize",
      tokenUrl: "https://api.x.com/2/oauth2/token",
      clientIdEnv: "X_CLIENT_ID",
      clientSecretEnv: "X_CLIENT_SECRET",
      scopes: [
        "tweet.read",
        "tweet.write",
        "users.read",
        "media.write",
        "offline.access",
      ],
      scopeSeparator: " ",
      usePkce: true,
    },
  };
  return configs[platform];
}

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin)
      ? origin
      : "https://emergencytradesmen.net",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(req: Request, value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/g, "");
}

function randomToken(size = 48) {
  return base64Url(crypto.getRandomValues(new Uint8Array(size)));
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return base64Url(new Uint8Array(digest));
}

async function encryptionKey() {
  const secret = Deno.env.get("SOCIAL_TOKEN_ENCRYPTION_KEY");
  if (!secret || secret.length < 32) {
    throw new Error(
      "SOCIAL_TOKEN_ENCRYPTION_KEY must contain at least 32 characters.",
    );
  }
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret),
  );
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

async function encryptToken(value: string | null | undefined) {
  if (!value) return null;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await encryptionKey(),
    new TextEncoder().encode(value),
  );
  return `v1.${base64Url(iv)}.${base64Url(new Uint8Array(encrypted))}`;
}

function decodeBase64Url(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function decryptToken(value: string) {
  const [version, ivValue, encryptedValue] = value.split(".");
  if (version !== "v1" || !ivValue || !encryptedValue) {
    throw new Error("Unsupported encrypted token envelope.");
  }
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: decodeBase64Url(ivValue) },
    await encryptionKey(),
    decodeBase64Url(encryptedValue),
  );
  return new TextDecoder().decode(decrypted);
}

function safeReturnUrl(value: unknown) {
  try {
    const url = new URL(
      typeof value === "string" ? value : DEFAULT_RETURN_URL,
    );
    if (!ALLOWED_ORIGINS.has(url.origin)) return DEFAULT_RETURN_URL;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return DEFAULT_RETURN_URL;
  }
}

function callbackUrl() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!supabaseUrl) throw new Error("SUPABASE_URL is unavailable.");
  return `${supabaseUrl}/functions/v1/social-oauth/callback`;
}

function asPlatform(value: unknown): Platform {
  if (
    typeof value !== "string" ||
    !SUPPORTED_PLATFORMS.includes(value as Platform)
  ) {
    throw new Error("Unsupported social platform.");
  }
  return value as Platform;
}

function asMarket(value: unknown): Market {
  return value === "US" ? "US" : "GB";
}

function providerCredentials(platform: Platform) {
  const config = providerConfig(platform);
  const clientId = Deno.env.get(config.clientIdEnv);
  const clientSecret = Deno.env.get(config.clientSecretEnv);
  if (!clientId || !clientSecret) {
    const error = new Error(
      `${platform} developer credentials are not configured.`,
    );
    Object.assign(error, {
      status: 409,
      code: "provider_not_configured",
      requiredSecrets: [config.clientIdEnv, config.clientSecretEnv],
    });
    throw error;
  }
  return { config, clientId, clientSecret };
}

function publishingMode(platform: Platform) {
  return platform === "instagram" ? "api_after_meta_link" : "api_after_oauth";
}

async function requireAdmin(req: Request) {
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw Object.assign(new Error("Authentication is required."), {
      status: 401,
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const token = authorization.slice("Bearer ".length);
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser(token);
  if (userError || !user) {
    throw Object.assign(new Error("Authentication is invalid."), {
      status: 401,
    });
  }
  const { data: isAdmin, error: adminError } = await client.rpc("is_admin");
  if (adminError || isAdmin !== true) {
    throw Object.assign(new Error("Admin access is required."), {
      status: 403,
    });
  }
  return user;
}

function serviceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function startConnection(req: Request, body: Record<string, unknown>) {
  const user = await requireAdmin(req);
  const platform = asPlatform(body.platform);
  const market = asMarket(body.market);
  const accountId =
    typeof body.account_id === "string" ? body.account_id : null;
  const returnUrl = safeReturnUrl(body.return_url);
  const { config, clientId } = providerCredentials(platform);
  await encryptionKey();

  const state = randomToken();
  const verifier = config.usePkce ? randomToken(64) : null;
  const challenge = verifier ? await sha256(verifier) : null;
  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
  const supabase = serviceClient();

  const { error } = await supabase.from("social_oauth_sessions").insert({
    platform,
    market,
    account_id: accountId,
    initiated_by: user.id,
    state_hash: await sha256(state),
    code_verifier: verifier,
    requested_scopes: config.scopes,
    return_url: returnUrl,
    expires_at: expiresAt,
  });
  if (error) throw error;

  const authorizeUrl = new URL(config.authorizeUrl);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set(
    platform === "tiktok" ? "client_key" : "client_id",
    clientId,
  );
  authorizeUrl.searchParams.set("redirect_uri", callbackUrl());
  authorizeUrl.searchParams.set(
    "scope",
    config.scopes.join(config.scopeSeparator),
  );
  authorizeUrl.searchParams.set("state", state);
  if (challenge) {
    authorizeUrl.searchParams.set("code_challenge", challenge);
    authorizeUrl.searchParams.set("code_challenge_method", "S256");
  }

  return json(req, {
    authorize_url: authorizeUrl.toString(),
    platform,
    expires_at: expiresAt,
  });
}

async function exchangeCode(
  platform: Platform,
  code: string,
  verifier: string | null,
) {
  const { config, clientId, clientSecret } = providerCredentials(platform);
  const redirectUri = callbackUrl();

  if (platform === "facebook" || platform === "instagram") {
    const url = new URL(config.tokenUrl);
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("client_secret", clientSecret);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("code", code);
    const response = await fetch(url);
    const payload = await response.json();
    if (!response.ok || !payload.access_token) {
      throw new Error(payload.error?.message ?? "Meta token exchange failed.");
    }
    const longLivedUrl = new URL(config.tokenUrl);
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", clientId);
    longLivedUrl.searchParams.set("client_secret", clientSecret);
    longLivedUrl.searchParams.set("fb_exchange_token", payload.access_token);
    const longLivedResponse = await fetch(longLivedUrl);
    const longLivedPayload = await longLivedResponse.json();
    if (!longLivedResponse.ok || !longLivedPayload.access_token) {
      throw new Error(
        longLivedPayload.error?.message ??
          "Meta long-lived token exchange failed.",
      );
    }
    return longLivedPayload;
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
  if (platform === "tiktok") {
    body.set("client_key", clientId);
    body.set("client_secret", clientSecret);
  } else {
    body.set("client_id", clientId);
    if (platform !== "pinterest") body.set("client_secret", clientSecret);
  }
  if (verifier) body.set("code_verifier", verifier);

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (platform === "pinterest" || platform === "x") {
    headers.Authorization = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
  }
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers,
    body,
  });
  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    throw new Error(
      payload.error_description ??
        payload.message ??
        payload.error?.message ??
        `${platform} token exchange failed.`,
    );
  }
  return payload;
}

async function fetchJson(url: string, accessToken: string) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = await response.json();
  if (!response.ok || payload.error) {
    throw new Error(
      payload.error?.message ?? payload.message ?? `Provider returned ${response.status}.`,
    );
  }
  return payload;
}

async function metaCandidates(platform: "facebook" | "instagram", token: string) {
  const graphVersion = Deno.env.get("META_GRAPH_VERSION") ?? "v23.0";
  const payload = await fetchJson(
    `https://graph.facebook.com/${graphVersion}/me/accounts?fields=id,name,link,access_token,instagram_business_account{id,username,name,profile_picture_url}`,
    token,
  );
  if (platform === "facebook") {
    return (payload.data ?? []).map((page: Record<string, unknown>) => ({
      externalAccountId: String(page.id),
      handle: null,
      profileUrl:
        typeof page.link === "string"
          ? page.link
          : `https://www.facebook.com/${page.id}`,
      displayName: typeof page.name === "string" ? page.name : null,
      accountType: "page",
      accessToken:
        typeof page.access_token === "string" ? page.access_token : token,
    })) as Identity[];
  }
  return (payload.data ?? [])
    .filter(
      (page: Record<string, unknown>) =>
        page.instagram_business_account &&
        typeof page.instagram_business_account === "object",
    )
    .map((page: Record<string, unknown>) => {
      const instagram = page.instagram_business_account as Record<
        string,
        unknown
      >;
      const username =
        typeof instagram.username === "string" ? instagram.username : null;
      return {
        externalAccountId: String(instagram.id),
        handle: username,
        profileUrl: username
          ? `https://www.instagram.com/${username}/`
          : `https://www.instagram.com/`,
        displayName:
          typeof instagram.name === "string" ? instagram.name : username,
        accountType: "professional",
        accessToken:
          typeof page.access_token === "string" ? page.access_token : token,
        metadata: { facebook_page_id: page.id },
      };
    }) as Identity[];
}

async function discoverIdentity(
  platform: Platform,
  accessToken: string,
): Promise<Identity[]> {
  if (platform === "facebook" || platform === "instagram") {
    return metaCandidates(platform, accessToken);
  }
  if (platform === "tiktok") {
    const payload = await fetchJson(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,display_name,avatar_url",
      accessToken,
    );
    const user = payload.data?.user ?? {};
    return [
      {
        externalAccountId: String(user.open_id),
        handle: null,
        profileUrl: "https://www.tiktok.com/",
        displayName: user.display_name ?? null,
        accountType: "creator",
        metadata: { union_id: user.union_id ?? null },
      },
    ];
  }
  if (platform === "linkedin") {
    const user = await fetchJson("https://api.linkedin.com/v2/userinfo", accessToken);
    return [
      {
        externalAccountId: String(user.sub),
        handle: null,
        profileUrl: "https://www.linkedin.com/feed/",
        displayName: user.name ?? null,
        accountType: "member",
      },
    ];
  }
  if (platform === "pinterest") {
    const user = await fetchJson(
      "https://api.pinterest.com/v5/user_account",
      accessToken,
    );
    return [
      {
        externalAccountId: String(user.id ?? user.username),
        handle: user.username ?? null,
        profileUrl: user.username
          ? `https://www.pinterest.com/${user.username}/`
          : "https://www.pinterest.com/",
        displayName: user.business_name ?? user.username ?? null,
        accountType: user.account_type ?? "user",
      },
    ];
  }
  const payload = await fetchJson(
    "https://api.x.com/2/users/me?user.fields=username,name,profile_image_url",
    accessToken,
  );
  const user = payload.data;
  return [
    {
      externalAccountId: String(user.id),
      handle: user.username ?? null,
      profileUrl: user.username
        ? `https://x.com/${user.username}`
        : "https://x.com/",
      displayName: user.name ?? null,
      accountType: "user",
    },
  ];
}

function publicCandidates(candidates: Identity[]) {
  return candidates.map((candidate) => ({
    external_account_id: candidate.externalAccountId,
    handle: candidate.handle,
    profile_url: candidate.profileUrl,
    display_name: candidate.displayName,
    account_type: candidate.accountType,
  }));
}

async function saveCredential(
  accountId: string,
  tokenPayload: Record<string, unknown>,
  accessToken: string,
  scopes: string[],
) {
  const expiresIn = Number(tokenPayload.expires_in ?? 0);
  const refreshExpiresIn = Number(tokenPayload.refresh_expires_in ?? 0);
  const expiresAt = expiresIn
    ? new Date(Date.now() + expiresIn * 1000).toISOString()
    : null;
  const refreshExpiresAt = refreshExpiresIn
    ? new Date(Date.now() + refreshExpiresIn * 1000).toISOString()
    : null;
  const supabase = serviceClient();
  const { error } = await supabase.from("social_account_credentials").upsert({
    account_id: accountId,
    access_token_encrypted: await encryptToken(accessToken),
    refresh_token_encrypted: await encryptToken(
      typeof tokenPayload.refresh_token === "string"
        ? tokenPayload.refresh_token
        : null,
    ),
    token_type:
      typeof tokenPayload.token_type === "string" ? tokenPayload.token_type : null,
    scopes,
    expires_at: expiresAt,
    refresh_expires_at: refreshExpiresAt,
    provider_metadata: {
      open_id: tokenPayload.open_id ?? null,
      scope: tokenPayload.scope ?? null,
    },
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return expiresAt;
}

async function callback(req: Request) {
  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const providerError = url.searchParams.get("error");
  if (!state) return json(req, { error: "Missing OAuth state." }, 400);

  const supabase = serviceClient();
  const { data: session, error: sessionError } = await supabase
    .from("social_oauth_sessions")
    .select("*")
    .eq("state_hash", await sha256(state))
    .is("consumed_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (sessionError || !session) {
    return json(req, { error: "OAuth session is invalid or expired." }, 401);
  }

  const returnUrl = new URL(safeReturnUrl(session.return_url));
  const finishRedirect = (
    outcome: "success" | "failed" | "selection_required",
    reason?: string,
  ) => {
    returnUrl.searchParams.set("social_connection", outcome);
    returnUrl.searchParams.set("platform", session.platform);
    if (reason) returnUrl.searchParams.set("reason", reason);
    return Response.redirect(returnUrl.toString(), 302);
  };

  if (providerError || !code) {
    await supabase
      .from("social_oauth_sessions")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", session.id);
    return finishRedirect("failed", "authorization_declined");
  }

  try {
    const platform = asPlatform(session.platform);
    const tokenPayload = await exchangeCode(
      platform,
      code,
      session.code_verifier,
    );
    const accessToken = String(tokenPayload.access_token);
    const candidates = await discoverIdentity(platform, accessToken);
    if (candidates.length === 0) {
      throw new Error(`No eligible ${platform} publishing account was found.`);
    }

    let existing = null;
    if (session.account_id) {
      const { data } = await supabase
        .from("social_accounts")
        .select("id, external_account_id, handle")
        .eq("id", session.account_id)
        .maybeSingle();
      existing = data;
    }
    const normalizedHandle = existing?.handle?.replace(/^@/, "").toLowerCase();
    const selected =
      candidates.find(
        (candidate) =>
          candidate.externalAccountId === existing?.external_account_id,
      ) ??
      candidates.find(
        (candidate) =>
          normalizedHandle &&
          candidate.handle?.toLowerCase() === normalizedHandle,
      ) ??
      (candidates.length === 1 ? candidates[0] : null);

    const accountId =
      existing?.id ??
      crypto.randomUUID();
    if (!selected) {
      const placeholder = candidates[0];
      const { error: accountError } = await supabase
        .from("social_accounts")
        .upsert({
          id: accountId,
          platform,
          market: session.market,
          profile_url: placeholder.profileUrl,
          external_account_id: placeholder.externalAccountId,
          handle: placeholder.handle,
          connection_status: "action_required",
          publishing_mode: publishingMode(platform),
          enabled: false,
          connected_by: session.initiated_by,
          connection_error: "Choose the account to connect.",
          connection_metadata: {
            available_accounts: publicCandidates(candidates),
          },
          updated_at: new Date().toISOString(),
        });
      if (accountError) throw accountError;
      await saveCredential(
        accountId,
        tokenPayload,
        accessToken,
        session.requested_scopes,
      );
      await supabase
        .from("social_oauth_sessions")
        .update({ consumed_at: new Date().toISOString(), account_id: accountId })
        .eq("id", session.id);
      return finishRedirect("selection_required");
    }

    const { error: accountError } = await supabase
      .from("social_accounts")
      .upsert({
        id: accountId,
        platform,
        market: session.market,
        profile_url: selected.profileUrl,
        external_account_id: selected.externalAccountId,
        handle: selected.handle,
        connection_status: "connected",
        publishing_mode: publishingMode(platform),
        enabled: true,
        provider_account_type: selected.accountType,
        connected_by: session.initiated_by,
        token_expires_at: null,
        connection_error: null,
        connection_metadata: {
          display_name: selected.displayName,
          ...(selected.metadata ?? {}),
        },
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    if (accountError) throw accountError;
    const expiresAt = await saveCredential(
      accountId,
      tokenPayload,
      selected.accessToken ?? accessToken,
      session.requested_scopes,
    );
    const { error: expiryError } = await supabase
      .from("social_accounts")
      .update({ token_expires_at: expiresAt })
      .eq("id", accountId);
    if (expiryError) throw expiryError;

    await supabase
      .from("social_oauth_sessions")
      .update({ consumed_at: new Date().toISOString(), account_id: accountId })
      .eq("id", session.id);
    await supabase.from("social_automation_events").insert({
      event_type: "account_connected",
      event_data: {
        account_id: accountId,
        platform,
        market: session.market,
      },
    });
    return finishRedirect("success");
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth callback failed.";
    await supabase
      .from("social_oauth_sessions")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", session.id);
    if (session.account_id) {
      await supabase
        .from("social_accounts")
        .update({
          connection_status: "action_required",
          connection_error: message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.account_id);
    }
    await supabase.from("social_automation_alerts").upsert(
      {
        campaign_id: null,
        publication_id: null,
        severity: "error",
        alert_type: "social_connection_failed",
        message: `${session.platform} connection failed. ${message}`,
        status: "open",
        dedupe_key: `account:${session.account_id ?? session.platform}:oauth_failed`,
      },
      { onConflict: "dedupe_key" },
    );
    return finishRedirect("failed", "connection_failed");
  }
}

async function disconnect(req: Request, body: Record<string, unknown>) {
  await requireAdmin(req);
  if (typeof body.account_id !== "string") {
    return json(req, { error: "account_id is required." }, 400);
  }
  const supabase = serviceClient();
  const { error: credentialError } = await supabase
    .from("social_account_credentials")
    .delete()
    .eq("account_id", body.account_id);
  if (credentialError) throw credentialError;
  const { error } = await supabase
    .from("social_accounts")
    .update({
      connection_status: "revoked",
      enabled: false,
      token_expires_at: null,
      connection_error: "Connection removed by an administrator.",
      connection_metadata: {},
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.account_id);
  if (error) throw error;
  return json(req, { disconnected: true });
}

async function selectTarget(req: Request, body: Record<string, unknown>) {
  const user = await requireAdmin(req);
  if (
    typeof body.account_id !== "string" ||
    typeof body.external_account_id !== "string"
  ) {
    return json(
      req,
      { error: "account_id and external_account_id are required." },
      400,
    );
  }
  const supabase = serviceClient();
  const { data: account, error: accountError } = await supabase
    .from("social_accounts")
    .select("id, platform, connection_metadata")
    .eq("id", body.account_id)
    .maybeSingle();
  if (accountError || !account) {
    return json(req, { error: "Social account was not found." }, 404);
  }
  const platform = asPlatform(account.platform);
  if (platform !== "facebook" && platform !== "instagram") {
    return json(req, { error: "Account selection is only used for Meta." }, 400);
  }
  const { data: credential, error: credentialError } = await supabase
    .from("social_account_credentials")
    .select("*")
    .eq("account_id", account.id)
    .maybeSingle();
  if (credentialError || !credential) {
    return json(req, { error: "Connection credential was not found." }, 404);
  }
  const userToken = await decryptToken(credential.access_token_encrypted);
  const candidates = await metaCandidates(platform, userToken);
  const selected = candidates.find(
    (candidate) => candidate.externalAccountId === body.external_account_id,
  );
  if (!selected) {
    return json(req, { error: "Selected account is no longer available." }, 409);
  }
  const { error: saveError } = await supabase
    .from("social_account_credentials")
    .update({
      access_token_encrypted: await encryptToken(
        selected.accessToken ?? userToken,
      ),
      updated_at: new Date().toISOString(),
    })
    .eq("account_id", account.id);
  if (saveError) throw saveError;
  const { error: updateError } = await supabase
    .from("social_accounts")
    .update({
      profile_url: selected.profileUrl,
      external_account_id: selected.externalAccountId,
      handle: selected.handle,
      connection_status: "connected",
      enabled: true,
      provider_account_type: selected.accountType,
      connected_by: user.id,
      connection_error: null,
      connection_metadata: {
        display_name: selected.displayName,
        ...(selected.metadata ?? {}),
      },
      last_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", account.id);
  if (updateError) throw updateError;
  return json(req, { connected: true, platform });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }
  try {
    if (req.method === "GET" && new URL(req.url).pathname.endsWith("/callback")) {
      return await callback(req);
    }
    if (req.method !== "POST") {
      return json(req, { error: "Method not allowed." }, 405);
    }
    const body = (await req.json()) as Record<string, unknown>;
    if (body.action === "start") return await startConnection(req, body);
    if (body.action === "disconnect") return await disconnect(req, body);
    if (body.action === "select_target") return await selectTarget(req, body);
    return json(req, { error: "Unsupported action." }, 400);
  } catch (error) {
    console.error("social-oauth error", error);
    const details = error as Error & {
      status?: number;
      code?: string;
      requiredSecrets?: string[];
    };
    return json(
      req,
      {
        error: details.message ?? "Social connection failed.",
        code: details.code ?? "social_oauth_error",
        required_secrets: details.requiredSecrets ?? [],
      },
      details.status ?? 500,
    );
  }
});
