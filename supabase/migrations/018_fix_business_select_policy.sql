-- Allow public read access to businesses (needed for listings to work)
-- This checks if the policy already exists to avoid errors

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'businesses'
        AND policyname = 'Public businesses are viewable by everyone'
    ) THEN
        CREATE POLICY "Public businesses are viewable by everyone"
        ON businesses
        FOR SELECT
        TO public
        USING (true); -- Or verified = true if we want to restrict
    END IF;
END
$$;
