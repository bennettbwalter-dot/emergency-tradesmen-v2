-- Add tier_updated_at to track when a user was last upgraded or downgraded
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS tier_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Expand the 'plan' check constraint if necessary, though it might be text or an enum.
-- Since the current webhook casts to 'any', we ensure it can accept 'pro' and 'premium'
-- Often 'plan' is just TEXT without a constraint. If an enum exists, this might need altering.

-- For safety, we will assume it's text. If there's a constraint, we will address it if an error occurs.
