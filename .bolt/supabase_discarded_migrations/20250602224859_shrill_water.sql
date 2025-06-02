/*
  # Update Admin User Role and Metadata

  1. Changes
    - Updates the admin user's app metadata and role
    - Ensures proper role assignment
    - Sets correct metadata fields
*/

-- Update admin user role and metadata
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the admin user
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'jmc.esgc2013@gmail.com';

  IF admin_user_id IS NOT NULL THEN
    -- Update user metadata and role
    UPDATE auth.users
    SET 
      raw_app_meta_data = '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
      raw_user_meta_data = '{"name": "Admin FEGESPORT"}'::jsonb,
      role = 'admin'
    WHERE id = admin_user_id;
  END IF;
END
$$;