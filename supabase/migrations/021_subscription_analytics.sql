-- Migration: Subscription Analytics System
-- Creates tables and functions for tracking subscription metrics

-- 1. Create subscription_events table
CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('created', 'renewed', 'cancelled', 'expired', 'upgraded', 'downgraded')),
    plan TEXT NOT NULL CHECK (plan IN ('basic', 'pro')),
    price NUMERIC NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription_id ON subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON subscription_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON subscription_events(event_type);

-- 2. Ensure subscriptions table has required columns
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Update existing subscriptions with price based on plan
UPDATE subscriptions SET price = 29 WHERE plan = 'basic' AND price IS NULL;
UPDATE subscriptions SET price = 99 WHERE plan = 'pro' AND price IS NULL;

-- 3. Create function to log subscription events
CREATE OR REPLACE FUNCTION log_subscription_event()
RETURNS TRIGGER AS $$
BEGIN
    -- On INSERT (new subscription)
    IF TG_OP = 'INSERT' THEN
        INSERT INTO subscription_events (subscription_id, user_id, event_type, plan, price)
        VALUES (NEW.id, NEW.user_id, 'created', NEW.plan, NEW.price);
        RETURN NEW;
    END IF;

    -- On UPDATE (status change)
    IF TG_OP = 'UPDATE' THEN
        -- Cancelled
        IF OLD.status = 'active' AND NEW.status = 'cancelled' THEN
            INSERT INTO subscription_events (subscription_id, user_id, event_type, plan, price)
            VALUES (NEW.id, NEW.user_id, 'cancelled', NEW.plan, NEW.price);
        END IF;

        -- Renewed
        IF OLD.status != 'active' AND NEW.status = 'active' THEN
            INSERT INTO subscription_events (subscription_id, user_id, event_type, plan, price)
            VALUES (NEW.id, NEW.user_id, 'renewed', NEW.plan, NEW.price);
        END IF;

        -- Plan upgrade/downgrade
        IF OLD.plan != NEW.plan THEN
            IF NEW.price > OLD.price THEN
                INSERT INTO subscription_events (subscription_id, user_id, event_type, plan, price)
                VALUES (NEW.id, NEW.user_id, 'upgraded', NEW.plan, NEW.price);
            ELSE
                INSERT INTO subscription_events (subscription_id, user_id, event_type, plan, price)
                VALUES (NEW.id, NEW.user_id, 'downgraded', NEW.plan, NEW.price);
            END IF;
        END IF;

        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger for automatic event logging
DROP TRIGGER IF EXISTS subscription_event_logger ON subscriptions;
CREATE TRIGGER subscription_event_logger
    AFTER INSERT OR UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION log_subscription_event();

-- 5. Create view for analytics metrics
CREATE OR REPLACE VIEW subscription_metrics AS
SELECT
    COUNT(*) FILTER (WHERE status = 'active' AND plan = 'basic') AS active_basic_count,
    COUNT(*) FILTER (WHERE status = 'active' AND plan = 'pro') AS active_pro_count,
    COUNT(*) FILTER (WHERE status = 'active') AS total_active_count,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS total_cancelled_count,
    SUM(price) FILTER (WHERE status = 'active' AND plan = 'basic') AS basic_mrr,
    SUM(price) FILTER (WHERE status = 'active' AND plan = 'pro') / 12 AS pro_mrr,
    SUM(price) FILTER (WHERE status = 'active') AS total_revenue
FROM subscriptions;

-- 6. RLS Policies
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Admin can view all events
CREATE POLICY "Admins can view all subscription events" ON subscription_events
    FOR SELECT
    USING (auth.uid() IN (SELECT id FROM auth.users WHERE email LIKE '%@admin%'));

-- Users can view their own events
CREATE POLICY "Users can view own subscription events" ON subscription_events
    FOR SELECT
    USING (auth.uid() = user_id);

-- 7. Backfill existing subscriptions
INSERT INTO subscription_events (subscription_id, user_id, event_type, plan, price, created_at)
SELECT 
    id,
    user_id,
    'created',
    plan,
    COALESCE(price, CASE WHEN plan = 'basic' THEN 29 ELSE 99 END),
    created_at
FROM subscriptions
WHERE id NOT IN (SELECT DISTINCT subscription_id FROM subscription_events WHERE event_type = 'created')
ON CONFLICT DO NOTHING;

SELECT 'Subscription analytics system created successfully!' as result;
