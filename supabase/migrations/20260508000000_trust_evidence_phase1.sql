-- Phase 1 trust evidence layer.
-- Existing businesses.id is TEXT in this project, so new foreign keys match it.

CREATE TABLE IF NOT EXISTS public.business_field_evidence (
  id bigserial PRIMARY KEY,
  region text NOT NULL CHECK (region IN ('UK', 'US')),
  business_id text NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  value text,
  source text NOT NULL,
  confidence numeric(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'rejected', 'expired')
  ),
  verified_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  reviewed_by uuid,
  reviewed_at timestamptz,
  raw jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_field_evidence_region ON public.business_field_evidence(region);
CREATE INDEX IF NOT EXISTS idx_business_field_evidence_business_id ON public.business_field_evidence(business_id);
CREATE INDEX IF NOT EXISTS idx_business_field_evidence_business_field_verified ON public.business_field_evidence(business_id, field_name, verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_field_evidence_status ON public.business_field_evidence(status);
CREATE INDEX IF NOT EXISTS idx_business_field_evidence_source ON public.business_field_evidence(source);

CREATE TABLE IF NOT EXISTS public.registry_verifications (
  id bigserial PRIMARY KEY,
  region text NOT NULL CHECK (region IN ('UK', 'US')),
  business_id text NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  registry text NOT NULL,
  registry_id text,
  status text NOT NULL CHECK (
    status IN ('active', 'inactive', 'dissolved', 'expired', 'not_found', 'pending_review')
  ),
  confidence numeric(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  verified_at timestamptz DEFAULT now(),
  next_check_at timestamptz,
  raw jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_registry_verifications_region ON public.registry_verifications(region);
CREATE INDEX IF NOT EXISTS idx_registry_verifications_business_id ON public.registry_verifications(business_id);
CREATE INDEX IF NOT EXISTS idx_registry_verifications_registry ON public.registry_verifications(registry);
CREATE INDEX IF NOT EXISTS idx_registry_verifications_status ON public.registry_verifications(status);
CREATE INDEX IF NOT EXISTS idx_registry_verifications_verified_at ON public.registry_verifications(verified_at DESC);

CREATE TABLE IF NOT EXISTS public.business_claims (
  id bigserial PRIMARY KEY,
  region text NOT NULL CHECK (region IN ('UK', 'US')),
  business_id text NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  claimer_name text,
  claimer_email text NOT NULL,
  claimer_phone text,
  email_verified_at timestamptz,
  phone_verified_at timestamptz,
  registry_verified_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'email_verified', 'phone_verified', 'verified', 'rejected')
  ),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_claims_region ON public.business_claims(region);
CREATE INDEX IF NOT EXISTS idx_business_claims_business_id ON public.business_claims(business_id);
CREATE INDEX IF NOT EXISTS idx_business_claims_status ON public.business_claims(status);
CREATE INDEX IF NOT EXISTS idx_business_claims_claimer_email ON public.business_claims(claimer_email);

DROP TRIGGER IF EXISTS update_business_claims_updated_at ON public.business_claims;
CREATE TRIGGER update_business_claims_updated_at
BEFORE UPDATE ON public.business_claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.enrichment_runs (
  id bigserial PRIMARY KEY,
  region text NOT NULL CHECK (region IN ('UK', 'US')),
  business_id text REFERENCES public.businesses(id) ON DELETE CASCADE,
  run_type text NOT NULL,
  status text NOT NULL CHECK (
    status IN ('queued', 'running', 'succeeded', 'failed', 'skipped')
  ),
  cost_usd numeric(8,4),
  tokens_input int,
  tokens_output int,
  message text,
  result jsonb,
  ran_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enrichment_runs_region ON public.enrichment_runs(region);
CREATE INDEX IF NOT EXISTS idx_enrichment_runs_business_id ON public.enrichment_runs(business_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_runs_run_type ON public.enrichment_runs(run_type);
CREATE INDEX IF NOT EXISTS idx_enrichment_runs_status ON public.enrichment_runs(status);
CREATE INDEX IF NOT EXISTS idx_enrichment_runs_ran_at ON public.enrichment_runs(ran_at DESC);

ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS trust_score numeric(3,2);

ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS trust_badges text[] DEFAULT '{}';

ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS claim_status text DEFAULT 'unclaimed';

ALTER TABLE public.business_field_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registry_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage business field evidence" ON public.business_field_evidence;
CREATE POLICY "Admins manage business field evidence"
ON public.business_field_evidence
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage registry verifications" ON public.registry_verifications;
CREATE POLICY "Admins manage registry verifications"
ON public.registry_verifications
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can submit pending business claims" ON public.business_claims;
CREATE POLICY "Anyone can submit pending business claims"
ON public.business_claims
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND region IN ('UK', 'US')
  AND admin_notes IS NULL
  AND email_verified_at IS NULL
  AND phone_verified_at IS NULL
  AND registry_verified_at IS NULL
);

DROP POLICY IF EXISTS "Admins manage business claims" ON public.business_claims;
CREATE POLICY "Admins manage business claims"
ON public.business_claims
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage enrichment runs" ON public.enrichment_runs;
CREATE POLICY "Admins manage enrichment runs"
ON public.enrichment_runs
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE OR REPLACE VIEW public.public_business_field_evidence AS
SELECT
  id,
  region,
  business_id,
  field_name,
  value,
  source,
  confidence,
  status,
  verified_at,
  expires_at,
  created_at
FROM public.business_field_evidence
WHERE status = 'accepted'
  AND (expires_at IS NULL OR expires_at > now());

CREATE OR REPLACE VIEW public.public_registry_verifications AS
SELECT
  id,
  region,
  business_id,
  registry,
  registry_id,
  status,
  confidence,
  verified_at,
  next_check_at,
  created_at
FROM public.registry_verifications
WHERE status IN ('active', 'inactive', 'dissolved', 'expired', 'not_found')
  AND confidence >= 0.50;

GRANT SELECT ON public.public_business_field_evidence TO anon, authenticated;
GRANT SELECT ON public.public_registry_verifications TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_field_evidence TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registry_verifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_claims TO authenticated;
GRANT INSERT ON public.business_claims TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrichment_runs TO authenticated;

GRANT USAGE, SELECT ON SEQUENCE public.business_field_evidence_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.registry_verifications_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.business_claims_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.enrichment_runs_id_seq TO authenticated;
