-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS auth.user_has_claim CASCADE;
DROP FUNCTION IF EXISTS public.is_admin CASCADE;

-- Create custom claims function
CREATE OR REPLACE FUNCTION auth.user_has_claim(uid uuid, claim text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = uid
    AND raw_user_meta_data->>'role' = claim
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN auth.user_has_claim(auth.uid(), 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure admin user exists with correct metadata
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Delete existing admin if exists
  DELETE FROM auth.users WHERE email = 'admin@fegesport.org';
  
  -- Create new admin user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    user_metadata,
    created_at,
    updated_at,
    last_sign_in_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@fegesport.org',
    crypt('Admin@2025!', gen_salt('bf')),
    now(),
    jsonb_build_object(
      'role', 'admin',
      'is_admin', true
    ),
    jsonb_build_object(
      'role', 'admin',
      'is_admin', true
    ),
    now(),
    now(),
    now()
  )
  RETURNING id INTO admin_user_id;

  -- Set up identities for the admin user
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    created_at,
    updated_at,
    last_sign_in_at
  )
  VALUES (
    gen_random_uuid(),
    admin_user_id,
    jsonb_build_object(
      'sub', admin_user_id,
      'email', 'admin@fegesport.org',
      'email_verified', true
    ),
    'email',
    now(),
    now(),
    now()
  );
END $$;