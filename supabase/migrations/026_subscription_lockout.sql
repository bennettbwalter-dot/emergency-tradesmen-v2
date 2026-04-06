-- Migration: Add lockout fields to subscriptions table
-- 026_subscription_lockout.sql

-- 1. Add failure tracking and lockout timestamp
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS failed_payment_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

-- 2. Update the status check to include 'locked' and 'payment_failed'
-- First, drop the existing constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;

-- Add the new constraint with expanded status options
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'inactive', 'locked', 'payment_failed'));

-- 3. Update mapSubscription in src/lib/subscriptionService.ts (handled next)
