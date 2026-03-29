-- ============================================
-- EMERGENCY TRADESMEN - PRODUCTION DATABASE INIT
-- ============================================
-- Run this entire script in the Supabase SQL Editor to set up your production database.
-- It combines all previous migrations into a single cohesive setup.

-- ============================================
-- 1. BASE TABLES
-- ============================================

-- BUSINESSES
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  trade TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  postcode TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  email TEXT,
  website TEXT,
  hours TEXT DEFAULT '24/7 Emergency Service',
  is_open_24_hours BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  featured_review TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Premium Fields
  logo_url TEXT,
  photos TEXT[] DEFAULT '{}',
  premium_description TEXT,
  services_offered TEXT[] DEFAULT '{}',
  coverage_areas TEXT[] DEFAULT '{}',
  is_premium BOOLEAN DEFAULT FALSE,
  owner_user_id UUID REFERENCES auth.users(id), -- Legacy owner field
  whatsapp_number TEXT,
  
  -- Claims & ownership
  owner_id UUID REFERENCES auth.users(id), -- Current owner field (matches auth.uid())
  claim_status TEXT DEFAULT 'unclaimed' CHECK (claim_status IN ('unclaimed', 'pending', 'verified')),
  
  -- Premium Locations & Plan
  selected_locations TEXT[] DEFAULT '{}',
  plan_type TEXT DEFAULT 'basic',
  
  -- Validation
  proof_documents JSONB DEFAULT '[]'::jsonb,
  contact_name TEXT,
  
  -- Availability
  is_available_now BOOLEAN DEFAULT true,
  
  -- Hidden Reviews
  hidden_reviews TEXT[] DEFAULT '{}'
);

-- BUSINESS PHOTOS (Relational)
CREATE TABLE IF NOT EXISTS business_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CERTIFICATIONS
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT,
  certificate_number TEXT,
  issued_date DATE,
  expiry_date DATE,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SERVICE AREAS
CREATE TABLE IF NOT EXISTS service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  postcode_prefix TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, city, postcode_prefix)
);

-- PRICING
CREATE TABLE IF NOT EXISTS pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  service_name TEXT,
  base_price DECIMAL(10,2),
  emergency_surcharge DECIMAL(10,2) DEFAULT 0,
  night_surcharge DECIMAL(10,2) DEFAULT 0,
  weekend_surcharge DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QUOTES
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  details TEXT NOT NULL,
  urgency TEXT DEFAULT 'Standard',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'professional', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'inactive')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    payment_customer_id TEXT,
    payment_subscription_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- BLOG POSTS
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT, -- Markdown content
  excerpt TEXT,
  cover_image TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. INDEXES
-- ============================================

-- Businesses
CREATE INDEX IF NOT EXISTS idx_businesses_trade ON businesses(trade);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_verified ON businesses(verified);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_is_premium ON businesses(is_premium);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_claim_status ON businesses(claim_status);
CREATE INDEX IF NOT EXISTS idx_businesses_whatsapp ON businesses(whatsapp_number) WHERE whatsapp_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_selected_locations ON businesses USING GIN(selected_locations);
CREATE INDEX IF NOT EXISTS idx_businesses_website ON businesses(website) WHERE website IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_contact_name ON businesses (contact_name) WHERE contact_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_is_available_now ON businesses(is_available_now);

-- Sub tables
CREATE INDEX IF NOT EXISTS idx_business_photos_business_id ON business_photos(business_id);
CREATE INDEX IF NOT EXISTS idx_certifications_business_id ON certifications(business_id);
CREATE INDEX IF NOT EXISTS idx_service_areas_business_id ON service_areas(business_id);

-- Quotes/Subscriptions
CREATE INDEX IF NOT EXISTS idx_quotes_business_id ON quotes(business_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON subscriptions(subscription_expires_at);

-- Blog
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);

-- ============================================
-- 3. FUNCTIONS & TRIGGERS
-- ============================================

-- Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE
  ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_updated_at BEFORE UPDATE
  ON pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE
  ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update Business Ratings
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Note: Assumes reviews table exists or handles gracefully. 
  -- Reviews are often separate. If using Google Maps data, this might be redundant or adapted.
  -- Including for compatibility with existing schema logic.
  RETURN NEW; 
END;
$$ LANGUAGE 'plpgsql';

-- Claim Business Function
CREATE OR REPLACE FUNCTION claim_business(
    business_id_param TEXT, 
    contact_email_param TEXT, 
    contact_phone_param TEXT,
    proof_docs_param JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  biz_record RECORD;
BEGIN
  -- Check if business exists and is unclaimed
  SELECT * INTO biz_record FROM businesses WHERE id = business_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Business not found';
  END IF;

  IF biz_record.claim_status != 'unclaimed' AND biz_record.claim_status IS NOT NULL THEN
    RAISE EXCEPTION 'Business is already claimed or pending verification';
  END IF;

  -- Update the business
  UPDATE businesses 
  SET 
    owner_id = auth.uid(),
    owner_user_id = auth.uid(), -- Set both for compatibility
    claim_status = 'pending',
    email = COALESCE(email, contact_email_param),
    phone = COALESCE(phone, contact_phone_param),
    proof_documents = proof_docs_param,
    updated_at = NOW()
  WHERE id = business_id_param;

  RETURN jsonb_build_object('success', true, 'message', 'Business claimed successfully');
END;
$$;

-- Expire Subscriptions
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
    UPDATE subscriptions
    SET 
        status = 'inactive',
        updated_at = NOW()
    WHERE 
        subscription_expires_at IS NOT NULL
        AND subscription_expires_at < NOW()
        AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Subscription Expiry Check Trigger
CREATE OR REPLACE FUNCTION check_subscription_expiry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subscription_expires_at IS NOT NULL 
       AND NEW.subscription_expires_at < NOW() 
       AND NEW.status = 'active' THEN
        NEW.status := 'inactive';
        NEW.updated_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_expiry_check
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION check_subscription_expiry();

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) & POLICIES
-- ============================================

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Business Policies
CREATE POLICY "Public businesses are viewable by everyone" ON businesses
  FOR SELECT TO public USING (true);

CREATE POLICY "Business owners can update own business" ON businesses 
    FOR UPDATE USING (auth.uid() = owner_user_id OR auth.uid() = owner_id);

CREATE POLICY "Users can delete own businesses" ON businesses
  FOR DELETE TO authenticated
  USING (owner_user_id = auth.uid() OR owner_id = auth.uid());

-- Quote Policies
CREATE POLICY "Users can view own quotes" ON quotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can insert quotes" ON quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all quotes" ON quotes FOR SELECT USING (auth.email() LIKE '%admin%' OR auth.email() LIKE '%bennett%');

-- Subscription Policies
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Blog Policies
CREATE POLICY "Public can read published posts" ON posts
  FOR SELECT USING (published = true);
CREATE POLICY "Authenticated users can read all posts" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage posts" ON posts
  FOR ALL USING (auth.role() = 'authenticated'); -- WARNING: Restrict to admin in future

-- Sub Tables (Public Read)
CREATE POLICY "Public can read business photos" ON business_photos FOR SELECT USING (true);
CREATE POLICY "Public can read certifications" ON certifications FOR SELECT USING (true);
CREATE POLICY "Public can read service areas" ON service_areas FOR SELECT USING (true);
CREATE POLICY "Public can read pricing" ON pricing FOR SELECT USING (true);

-- ============================================
-- 5. STORAGE BUCKET
-- ============================================
-- Handled via SQL assuming pg_net or similar, or just inserting into storage.buckets if using Supabase standard
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'business-assets',
    'business-assets',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public can view business assets" ON storage.objects 
    FOR SELECT USING (bucket_id = 'business-assets');

CREATE POLICY "Users can upload business assets" ON storage.objects 
    FOR INSERT WITH CHECK (
        bucket_id = 'business-assets' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update own assets" ON storage.objects 
    FOR UPDATE USING (
        bucket_id = 'business-assets' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete own assets" ON storage.objects 
    FOR DELETE USING (
        bucket_id = 'business-assets' 
        AND auth.role() = 'authenticated'
    );

SELECT '✅ Production Database Setup Complete!' AS status;
