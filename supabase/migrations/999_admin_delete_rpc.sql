-- Secure Admin Delete Function
-- Bypasses RLS but checks for Owner or Admin status explicitly.

CREATE OR REPLACE FUNCTION admin_delete_business(target_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  record_owner_id UUID;
  current_user_id UUID;
  user_email TEXT;
  is_admin_user BOOLEAN;
  deleted_record businesses;
BEGIN
  -- Get current user info
  current_user_id := auth.uid();
  SELECT email INTO user_email FROM auth.users WHERE id = current_user_id;

  -- Determine if user is admin
  -- Checks against default 'admin@example.com' OR the app.admin_email setting
  is_admin_user := (
    user_email = 'admin@example.com' OR 
    user_email = current_setting('app.admin_email', true)
  );

  -- Get business owner
  SELECT owner_user_id INTO record_owner_id FROM businesses WHERE id = target_id;
  
  -- Check existence
  IF NOT FOUND THEN
     RETURN jsonb_build_object('success', false, 'message', 'Business not found');
  END IF;

  -- Permission Check: Owner or Admin
  IF (current_user_id = record_owner_id) OR (is_admin_user IS TRUE) THEN
      DELETE FROM businesses WHERE id = target_id RETURNING * INTO deleted_record;
      RETURN jsonb_build_object('success', true, 'id', target_id);
  ELSE
      RETURN jsonb_build_object('success', false, 'message', 'Permission denied');
  END IF;
END;
$$;

-- Grant access to authenticated users (logic inside handles restrictions)
GRANT EXECUTE ON FUNCTION admin_delete_business(TEXT) TO authenticated;
