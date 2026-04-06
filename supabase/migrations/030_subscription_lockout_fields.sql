-- Add missing lockout fields to the subscriptions table for payment enforcement
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS failed_payment_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;
