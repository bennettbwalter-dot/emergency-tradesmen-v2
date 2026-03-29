-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'active'
);

-- Enable RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow public insertion (for the signup form)
CREATE POLICY "Allow public subscriptions" 
ON public.newsletter_subscriptions 
FOR INSERT 
WITH CHECK (true);

-- Allow admins to view (assuming service_role or admin check)
CREATE POLICY "Allow authenticated users to view" 
ON public.newsletter_subscriptions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);
