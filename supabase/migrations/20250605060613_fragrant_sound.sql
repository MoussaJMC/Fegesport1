-- Drop existing functions to recreate them with secure search paths
DROP FUNCTION IF EXISTS public.get_user_role CASCADE;
DROP FUNCTION IF EXISTS public.is_admin CASCADE;
DROP FUNCTION IF EXISTS public.require_admin CASCADE;

-- Create function to get user role with explicit search path
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'role' 
     FROM auth.users 
     WHERE id = auth.uid()),
    'user'
  );
END;
$$;

-- Create function to check if user is admin with explicit search path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
END;
$$;

-- Create policy helper function with explicit search path
CREATE OR REPLACE FUNCTION public.require_admin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  RETURN true;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO anon;
GRANT EXECUTE ON FUNCTION public.require_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.require_admin TO anon;

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
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
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
    now(),
    now(),
    encode(gen_random_bytes(32), 'hex'),
    encode(gen_random_bytes(32), 'hex')
  )
  RETURNING id INTO admin_user_id;

  -- Set up identities for the admin user with provider_id
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    created_at,
    updated_at,
    last_sign_in_at
  )
  VALUES (
    gen_random_uuid(),
    admin_user_id,
    admin_user_id::text,
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

-- Refresh existing policies to use the secured functions
DO $$ 
BEGIN
  -- Refresh news table policies
  DROP POLICY IF EXISTS "Admin has full access" ON public.news;
  CREATE POLICY "Admin has full access" ON public.news
    FOR ALL
    TO public
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

  -- Refresh events table policies
  DROP POLICY IF EXISTS "Admin has full access" ON public.events;
  CREATE POLICY "Admin has full access" ON public.events
    FOR ALL
    TO public
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

  -- Refresh members table policies
  DROP POLICY IF EXISTS "Admin has full access" ON public.members;
  CREATE POLICY "Admin has full access" ON public.members
    FOR ALL
    TO public
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

  -- Refresh partners table policies
  DROP POLICY IF EXISTS "Admin has full access" ON public.partners;
  CREATE POLICY "Admin has full access" ON public.partners
    FOR ALL
    TO public
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

  -- Refresh contact messages table policies
  DROP POLICY IF EXISTS "Admin has full access" ON public.contact_messages;
  CREATE POLICY "Admin has full access" ON public.contact_messages
    FOR ALL
    TO public
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
END $$;