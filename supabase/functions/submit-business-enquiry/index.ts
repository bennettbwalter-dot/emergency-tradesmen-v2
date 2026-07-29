// Receives claim-listing / website / general enquiries from BusinessEnquiryForm.
//
// This endpoint did not exist. The form POSTed here, got a 404, and its own
// error handling treats 404 as success (`response.status !== 404`), so every
// enquiry since launch showed the customer a confirmation screen and was then
// discarded. `claim_status = 'claimed'` was 0 across 238,750 listings for that
// reason - not low intent, no endpoint.
//
// It stores the enquiry first and emails second, so a mail outage degrades to a
// stored lead rather than a lost one.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const p = await req.json();

    // Honeypot: the form ships an always-empty `website_url_confirm`. A bot
    // filling every field trips it. Return 200 so the bot sees success.
    if (typeof p.website_url_confirm === "string" && p.website_url_confirm.trim() !== "") {
      return json({ ok: true });
    }

    const businessName = String(p.business_name ?? "").trim();
    const email = String(p.email ?? "").trim();
    if (!businessName || !email) {
      return json({ error: "business_name and email are required" }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "invalid email" }, 400);
    }

    const region = p.region === "US" ? "US" : "UK";
    const enquiryType = String(p.enquiry_type ?? "General enquiry").trim();

    const record = {
      region,
      business_name: businessName,
      owner_name: String(p.owner_name ?? "").trim() || null,
      email,
      phone: String(p.phone ?? "").trim() || null,
      website: String(p.website ?? "").trim() || null,
      listing_url: String(p.listing_url ?? "").trim() || null,
      enquiry_type: enquiryType,
      interested_package: p.interested_package ?? null,
      selected_trade_style: p.selected_trade_style ?? null,
      message: String(p.message ?? "").trim() || null,
      website_build_details: p.website_build_details ?? null,
      consent_given: p.consent_given === true,
      authorized_representative_confirmed: p.authorized_representative_confirmed === true,
      status: "new",
    };

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Store first. A lead that is saved but unmailed is recoverable; a lead that
    // is mailed but unsaved is not.
    const { data: saved, error: insertError } = await supabase
      .from("business_enquiries")
      .insert(record)
      .select("id")
      .single();

    if (insertError) {
      console.error("submit-business-enquiry insert failed", insertError);
      return json({ error: "Could not save enquiry" }, 500);
    }

    // Notify. Never fail the request on a mail error - the lead is already safe.
    const supportEmail = region === "US"
      ? Deno.env.get("SUPPORT_EMAIL_US") ?? Deno.env.get("SUPPORT_EMAIL") ?? ""
      : Deno.env.get("SUPPORT_EMAIL_UK") ?? Deno.env.get("SUPPORT_EMAIL") ?? "";

    if (supportEmail) {
      const lines = [
        `Type: ${enquiryType}`,
        `Region: ${region}`,
        `Business: ${businessName}`,
        `Contact: ${record.owner_name ?? "-"}`,
        `Email: ${email}`,
        `Phone: ${record.phone ?? "-"}`,
        `Website: ${record.website ?? "-"}`,
        `Listing: ${record.listing_url ?? "-"}`,
        record.interested_package ? `Package: ${record.interested_package}` : "",
        record.authorized_representative_confirmed ? "Confirmed authorised representative: yes" : "",
        "",
        record.message ?? "",
      ].filter(Boolean).join("\n");

      try {
        await supabase.functions.invoke("send-email", {
          body: {
            to: supportEmail,
            subject: `New ${enquiryType} - ${businessName} (${region})`,
            text: lines,
          },
        });
      } catch (mailError) {
        console.error("submit-business-enquiry notify failed", mailError);
      }
    }

    return json({ ok: true, id: saved?.id });
  } catch (e) {
    console.error("submit-business-enquiry error", e);
    return json({ error: "Bad request" }, 400);
  }
});
