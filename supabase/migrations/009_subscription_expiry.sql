-- Migration: Create subscriptions table with expiry tracking
-- Run this FIRST before the expiry migration

-- Create the subscriptions table
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

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON subscriptions(subscription_expires_at);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own subscription
CREATE POLICY "Users can update own subscription" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can insert their own subscription
CREATE POLICY "Users can insert own subscription" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can do everything (adjust as needed)
-- For now, service role can bypass RLS

-- Create function to auto-expire subscriptions
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

-- Create a trigger to check expiry on updates
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

DROP TRIGGER IF EXISTS subscription_expiry_check ON subscriptions;
CREATE TRIGGER subscription_expiry_check
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION check_subscription_expiry();

-- Function to extend subscription (for admin use)
CREATE OR REPLACE FUNCTION extend_subscription(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS void AS $$
BEGIN
    INSERT INTO subscriptions (user_id, plan, status, subscription_expires_at)
    VALUES (
        p_user_id, 
        'professional', 
        'active', 
        NOW() + (p_days || ' days')::INTERVAL
    )
    ON CONFLICT (user_id) DO UPDATE SET
        status = 'active',
        subscription_expires_at = COALESCE(
            CASE 
                WHEN subscriptions.subscription_expires_at > NOW() THEN subscriptions.subscription_expires_at 
                ELSE NOW() 
            END, 
            NOW()
        ) + (p_days || ' days')::INTERVAL,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION extend_subscription(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION expire_subscriptions() TO authenticated;

COMMENT ON TABLE subscriptions IS 'Stores user subscription data for premium plans';
COMMENT ON COLUMN subscriptions.subscription_expires_at IS 'When the subscription expires. NULL means lifetime/never expires.';
