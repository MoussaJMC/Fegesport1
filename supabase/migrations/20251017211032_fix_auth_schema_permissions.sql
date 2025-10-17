/*
  # Fix Auth Schema Permission Issues

  1. Problem
    - Previous migrations attempted to directly manipulate auth.users and auth.identities tables
    - These operations require superuser privileges not available in standard Supabase
    - Causing "permission denied for schema auth" errors

  2. Solution
    - Remove direct auth table manipulation
    - Document that admin users should be created via Supabase Dashboard or Auth API
    - Ensure all helper functions use proper Supabase auth functions

  3. Notes
    - Admin users should be created through:
      * Supabase Dashboard > Authentication > Users
      * Or via supabase.auth.admin.createUser() in Edge Functions
    - Set user metadata with role: 'admin' for admin access
*/

-- Drop any problematic functions that directly access auth schema tables
DROP FUNCTION IF EXISTS create_or_update_admin_user();
DROP FUNCTION IF EXISTS create_admin_user();

-- Ensure auth helper functions exist and use proper permissions
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'anon'
  )::text;
$$;

CREATE OR REPLACE FUNCTION public.auth_uid()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    NULL
  )::uuid;
$$;

CREATE OR REPLACE FUNCTION public.auth_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    NULL
  )::text;
$$;

-- Grant execute permissions to all roles
GRANT EXECUTE ON FUNCTION public.auth_role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_uid() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_email() TO anon, authenticated, service_role;

-- Create a function to check if user is admin (using proper auth functions)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role' = 'admin'),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- Add helpful comment for future reference
COMMENT ON FUNCTION public.is_admin() IS 
'Checks if the current user has admin role set in their user_metadata. 
To create admin users:
1. Via Dashboard: Authentication > Users > Create User, then manually edit user metadata
2. Via API: Use supabase.auth.admin.createUser() with user_metadata: { role: "admin" }';
