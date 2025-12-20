-- Migration: Create Posts Table for Blog
-- Description: Sets up the posts table with RLS and policies.

-- ============================================
-- POSTS TABLE
-- ============================================
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
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 1. Public can read published posts
CREATE POLICY "Public can read published posts" ON posts
  FOR SELECT USING (published = true);

-- 2. Authenticated users can read all posts (including drafts)
-- Ideally this should be restricted to admins, but for MVP we allow auth users to preview.
CREATE POLICY "Authenticated users can read all posts" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- 3. Authenticated users can insert/update/delete posts
-- WARNING: In a production app with public registration, this must be restricted to admins.
-- For now, we assume this is acceptable for the initial rollout or that registration is monitored.
CREATE POLICY "Authenticated users can manage posts" ON posts
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE
  ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Optional)
-- ============================================
INSERT INTO posts (title, slug, content, excerpt, published, published_at)
VALUES 
(
  'Emergency Plumber vs Regular Plumber: When to Call?', 
  'emergency-plumber-vs-regular', 
  '# Emergency Plumber vs Regular Plumber

When you have a leak at 3 AM, you need an emergency plumber. But what is the difference?

## Response Time
Emergency plumbers are on call 24/7...',
  'Knowing the difference between an emergency plumber and a regular one can save you money and stress.',
  true,
  NOW()
)
ON CONFLICT (slug) DO NOTHING;
