-- Pro lead reporting: record customer contact actions and allow a listing owner
-- to read leads for businesses they own. Apply this before deploying the UI.

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS source_surface TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT;

CREATE TABLE IF NOT EXISTS public.business_lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'call_click',
    'website_click',
    'whatsapp_click',
    'quote_started',
    'quote_submitted'
  )),
  source_surface TEXT NOT NULL,
  session_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_lead_events_business_created
  ON public.business_lead_events (business_id, created_at DESC);

ALTER TABLE public.business_lead_events ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.business_lead_events TO anon, authenticated;
GRANT SELECT ON public.business_lead_events TO authenticated;

DROP POLICY IF EXISTS "Public can record business lead events" ON public.business_lead_events;
CREATE POLICY "Public can record business lead events"
  ON public.business_lead_events FOR INSERT TO anon, authenticated
  WITH CHECK (
    event_type IN ('call_click', 'website_click', 'whatsapp_click', 'quote_started', 'quote_submitted')
    AND char_length(source_surface) BETWEEN 1 AND 120
  );

DROP POLICY IF EXISTS "Business owners can read their lead events" ON public.business_lead_events;
CREATE POLICY "Business owners can read their lead events"
  ON public.business_lead_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = business_lead_events.business_id
        AND (businesses.owner_user_id = (select auth.uid()) OR businesses.owner_id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Business owners can read their quotes" ON public.quotes;
CREATE POLICY "Business owners can read their quotes"
  ON public.quotes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = quotes.business_id
        AND (businesses.owner_user_id = (select auth.uid()) OR businesses.owner_id = (select auth.uid()))
    )
  );
