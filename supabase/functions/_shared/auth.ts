import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

function getAdminEmails(): string[] {
  const configured = [
    Deno.env.get("ADMIN_EMAILS"),
    Deno.env.get("ADMIN_EMAIL"),
    Deno.env.get("VITE_ADMIN_EMAIL"),
  ]
    .filter(Boolean)
    .join(",");

  return [
    ...configured.split(","),
    "nicholas.bennett247@gmail.com",
  ]
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdminOrServiceRole(req: Request) {
  const token = getBearerToken(req);
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!token) {
    throw new HttpError(401, "Missing authorization token");
  }

  if (serviceRoleKey && token === serviceRoleKey) {
    return { role: "service_role", email: "service_role" };
  }

  if (!supabaseUrl || !serviceRoleKey) {
    throw new HttpError(500, "Server auth configuration is missing");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user?.email) {
    throw new HttpError(401, "Invalid authorization token");
  }

  const email = data.user.email.toLowerCase();
  if (!getAdminEmails().includes(email)) {
    throw new HttpError(403, "Admin access required");
  }

  return { role: "admin", email };
}

export function errorResponse(error: unknown, headers: HeadersInit = {}) {
  if (error instanceof HttpError) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.status,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  const message = error instanceof Error ? error.message : "Internal Server Error";
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
