-- 027_multi_tenant_architecture.sql
-- 1. Create Tenant Model

CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'deleted');

CREATE TABLE IF NOT EXISTS tenants (
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    status tenant_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Users can only read their own tenant
CREATE POLICY "Users can view own tenant" ON tenants
    FOR SELECT USING (auth.uid() = owner_user_id);

-- Admins can view all tenants
CREATE POLICY "Admins can view all tenants" ON tenants
    FOR SELECT USING (auth.email() LIKE '%bennett%' OR auth.email() LIKE '%admin%');

-- 2. Backfill existing users into the tenants table
INSERT INTO tenants (owner_user_id)
SELECT id FROM auth.users
ON CONFLICT (owner_user_id) DO NOTHING;

-- 3. Create a trigger to automatically create a tenant for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_tenant()
RETURNS TRIGGER AS $$
DECLARE
    new_tenant_id UUID;
BEGIN
    INSERT INTO public.tenants (owner_user_id)
    VALUES (NEW.id)
    RETURNING tenant_id INTO new_tenant_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow re-running
DROP TRIGGER IF EXISTS on_auth_user_created_create_tenant ON auth.users;

CREATE TRIGGER on_auth_user_created_create_tenant
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_tenant();

-- 4. Function to get current tenant_id for RLS policies
CREATE OR REPLACE FUNCTION public.tenant_id() RETURNS uuid AS $$
  SELECT tenant_id FROM public.tenants WHERE owner_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

-- 5. Add tenant_id to all user-data tables
-- Bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE;
UPDATE public.bookings b SET tenant_id = (SELECT tenant_id FROM tenants t WHERE b.user_id = t.owner_user_id) WHERE b.tenant_id IS NULL;
-- Cleanup strictly isolated table orphaned rows before setting NOT NULL
DELETE FROM public.bookings WHERE tenant_id IS NULL;
ALTER TABLE public.bookings ALTER COLUMN tenant_id SET NOT NULL;

-- Favorites
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE;
UPDATE public.favorites f SET tenant_id = (SELECT tenant_id FROM tenants t WHERE f.user_id = t.owner_user_id) WHERE f.tenant_id IS NULL;
DELETE FROM public.favorites WHERE tenant_id IS NULL;
ALTER TABLE public.favorites ALTER COLUMN tenant_id SET NOT NULL;

-- Reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE;
UPDATE public.reviews r SET tenant_id = (SELECT tenant_id FROM tenants t WHERE r.user_id = t.owner_user_id) WHERE r.tenant_id IS NULL;
DELETE FROM public.reviews WHERE tenant_id IS NULL;
ALTER TABLE public.reviews ALTER COLUMN tenant_id SET NOT NULL;

-- Quote Requests
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE;
UPDATE public.quote_requests q SET tenant_id = (SELECT tenant_id FROM tenants t WHERE q.user_id = t.owner_user_id) WHERE q.tenant_id IS NULL;
DELETE FROM public.quote_requests WHERE tenant_id IS NULL;
ALTER TABLE public.quote_requests ALTER COLUMN tenant_id SET NOT NULL;

-- Quotes
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'quotes') THEN
    ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE;
    UPDATE public.quotes q SET tenant_id = (SELECT tenant_id FROM tenants t WHERE q.user_id = t.owner_user_id) WHERE q.tenant_id IS NULL;
    DELETE FROM public.quotes WHERE tenant_id IS NULL;
    ALTER TABLE public.quotes ALTER COLUMN tenant_id SET NOT NULL;
  END IF;
END $$;

-- Subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE;
UPDATE public.subscriptions s SET tenant_id = (SELECT tenant_id FROM tenants t WHERE s.user_id = t.owner_user_id) WHERE s.tenant_id IS NULL;
DELETE FROM public.subscriptions WHERE tenant_id IS NULL;
ALTER TABLE public.subscriptions ALTER COLUMN tenant_id SET NOT NULL;

-- Businesses (owner_id maps to tenant)
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE;
UPDATE public.businesses b SET tenant_id = (SELECT tenant_id FROM tenants t WHERE b.owner_id = t.owner_user_id) WHERE b.tenant_id IS NULL AND b.owner_id IS NOT NULL;
-- Businesses might NOT have an owner initially (unclaimed directory listings). 
-- We will NOT enforce NOT NULL on businesses.tenant_id for unclaimed listings.

-- Business Photos
ALTER TABLE public.business_photos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE;
-- Complex join via business to get the owner. Photos might belong to unclaimed businesses.
UPDATE public.business_photos p 
SET tenant_id = b.tenant_id 
FROM public.businesses b 
WHERE p.business_id = b.id AND b.tenant_id IS NOT NULL AND p.tenant_id IS NULL;

-- Certifications
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE;
UPDATE public.certifications c 
SET tenant_id = b.tenant_id 
FROM public.businesses b 
WHERE c.business_id = b.id AND b.tenant_id IS NOT NULL AND c.tenant_id IS NULL;

-- Service Areas
ALTER TABLE public.service_areas ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE;
UPDATE public.service_areas s 
SET tenant_id = b.tenant_id 
FROM public.businesses b 
WHERE s.business_id = b.id AND b.tenant_id IS NOT NULL AND s.tenant_id IS NULL;

-- Pricing
ALTER TABLE public.pricing ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE;
UPDATE public.pricing p 
SET tenant_id = b.tenant_id 
FROM public.businesses b 
WHERE p.business_id = b.id AND b.tenant_id IS NOT NULL AND p.tenant_id IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_id ON public.bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_favorites_tenant_id ON public.favorites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_tenant_id ON public.reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_tenant_id ON public.quote_requests(tenant_id);
-- Create index for quotes if the table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'quotes') THEN
    CREATE INDEX IF NOT EXISTS idx_quotes_tenant_id ON public.quotes(tenant_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON public.subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_businesses_tenant_id ON public.businesses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_business_photos_tenant_id ON public.business_photos(tenant_id);


-- 6. Apply RLS overrides using Tenant Scoping
-- Note: 'Public Directory + Private Tenant Management' Model applied.

-- Bookings (Strictly Private)
DROP POLICY IF EXISTS "Users can translate their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
CREATE POLICY "Tenant read bookings" ON public.bookings FOR SELECT USING (tenant_id = public.tenant_id());
CREATE POLICY "Tenant insert bookings" ON public.bookings FOR INSERT WITH CHECK (tenant_id = public.tenant_id());
CREATE POLICY "Tenant update bookings" ON public.bookings FOR UPDATE USING (tenant_id = public.tenant_id());
CREATE POLICY "Tenant delete bookings" ON public.bookings FOR DELETE USING (tenant_id = public.tenant_id());

-- Favorites (Strictly Private)
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.favorites;
CREATE POLICY "Tenant manage favorites" ON public.favorites FOR ALL USING (tenant_id = public.tenant_id());

-- Reviews (Public Read, Tenant Manage)
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
-- The "Reviews are publicly visible" policy remains untouched.
CREATE POLICY "Tenant insert reviews" ON public.reviews FOR INSERT WITH CHECK (tenant_id = public.tenant_id());
CREATE POLICY "Tenant update reviews" ON public.reviews FOR UPDATE USING (tenant_id = public.tenant_id());
CREATE POLICY "Tenant delete reviews" ON public.reviews FOR DELETE USING (tenant_id = public.tenant_id());

-- Quote Requests (Strictly Private)
DROP POLICY IF EXISTS "Users can view their own quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Users can insert their own quote requests" ON public.quote_requests;
CREATE POLICY "Tenant manage quote requests" ON public.quote_requests FOR ALL USING (tenant_id = public.tenant_id());

-- Quotes (Strictly Private)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'quotes') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own quotes" ON public.quotes';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own quotes" ON public.quotes';
    EXECUTE 'CREATE POLICY "Tenant manage quotes" ON public.quotes FOR ALL USING (tenant_id = public.tenant_id())';
  END IF;
END $$;

-- Subscriptions (Strictly Private)
-- Assuming existing RLS or lack thereof. Subscriptions is usually service_role only in some paradigms, but let's give select
CREATE POLICY "Tenant read subscriptions" ON public.subscriptions FOR SELECT USING (tenant_id = public.tenant_id());

-- Businesses (Public Read Verified, Tenant Manage Own)
-- The "Public can read verified businesses" and similar policies likely persist.
-- Let's ensure updates are scoped to tenant_id
DROP POLICY IF EXISTS "Users can update their own business" ON public.businesses;
CREATE POLICY "Tenant update businesses" ON public.businesses FOR UPDATE USING (tenant_id = public.tenant_id());
-- Admins and owners might have other policies, but tenant overrides provide strong defaults.

-- Step 5. Storage Isolation Overrides
DROP POLICY IF EXISTS "Users can upload business assets" ON storage.objects;
CREATE POLICY "Tenant upload business assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'business-assets' AND (storage.foldername(name))[1] = public.tenant_id()::text);

DROP POLICY IF EXISTS "Users can update own assets" ON storage.objects;
CREATE POLICY "Tenant update business assets" ON storage.objects FOR UPDATE USING (bucket_id = 'business-assets' AND (storage.foldername(name))[1] = public.tenant_id()::text);

DROP POLICY IF EXISTS "Users can delete own assets" ON storage.objects;
CREATE POLICY "Tenant delete business assets" ON storage.objects FOR DELETE USING (bucket_id = 'business-assets' AND (storage.foldername(name))[1] = public.tenant_id()::text);