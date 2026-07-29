import { supabase } from "@/lib/supabase";
import { devLog } from "@/lib/devLog";

export type BusinessLeadEventType = "call_click" | "website_click" | "whatsapp_click" | "quote_started" | "quote_submitted";

type BusinessLeadEvent = {
  businessId: string;
  eventType: BusinessLeadEventType;
  sourceSurface: string;
};

export type LeadMetrics = Record<BusinessLeadEventType, number>;

const emptyMetrics: LeadMetrics = {
  call_click: 0,
  website_click: 0,
  whatsapp_click: 0,
  quote_started: 0,
  quote_submitted: 0,
};

function getSessionId() {
  const storageKey = "business_lead_session_id";
  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;

  const sessionId = crypto.randomUUID();
  sessionStorage.setItem(storageKey, sessionId);
  return sessionId;
}

export async function recordBusinessLeadEvent({ businessId, eventType, sourceSurface }: BusinessLeadEvent): Promise<void> {
  const { error } = await supabase.from("business_lead_events").insert({
    business_id: businessId,
    event_type: eventType,
    source_surface: sourceSurface,
    session_id: getSessionId(),
  });

  if (error) {
    // Lead capture must never block a customer's call, website visit, or quote request.
    devLog("Business lead event was not recorded", error.message);
  }
}

export async function getLeadMetrics(businessId: string): Promise<LeadMetrics> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("business_lead_events")
    .select("event_type")
    .eq("business_id", businessId)
    .gte("created_at", thirtyDaysAgo);

  if (error) {
    devLog("Business lead metrics were not loaded", error.message);
    return emptyMetrics;
  }

  return (data || []).reduce<LeadMetrics>((metrics, event) => {
    const eventType = event.event_type as BusinessLeadEventType;
    if (eventType in metrics) metrics[eventType] += 1;
    return metrics;
  }, { ...emptyMetrics });
}
