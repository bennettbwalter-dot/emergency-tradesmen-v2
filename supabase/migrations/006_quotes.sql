-- Create quotes table for monitoring lead generation
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- Optional, if user is logged in
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  details TEXT NOT NULL,
  urgency TEXT DEFAULT 'Standard', -- 'Emergency', 'Standard', 'Flexible'
  status TEXT DEFAULT 'pending', -- 'pending', 'viewed', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can see their own quotes
CREATE POLICY "Users can view own quotes" ON quotes
  FOR SELECT USING (auth.uid() = user_id);

-- Admins/Business Owners can see quotes for their business (simplified for now to just admin check or public insert)
-- Allowing public insert for "Guest" quotes
CREATE POLICY "Public can insert quotes" ON quotes
  FOR INSERT WITH CHECK (true);

-- Admin viewing all (placeholder policy)
CREATE POLICY "Admins can view all quotes" ON quotes
  FOR SELECT USING (auth.email() LIKE '%admin%'); 
