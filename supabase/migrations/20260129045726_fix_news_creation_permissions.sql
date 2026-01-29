/*
  # Fix News Creation - Grant Auth Schema Permissions
  
  ## Problem
  The is_admin() function cannot access auth.users table due to missing permissions.
  Even though the function is SECURITY DEFINER, it needs explicit grants.
  
  ## Solution
  1. Grant SELECT permission on auth.users to the authenticator role
  2. Update the function to include auth schema in search_path
  3. Ensure the function can properly query user metadata
  
  ## Security
  - Function is SECURITY DEFINER so it runs with owner privileges
  - Only reads role information, no sensitive data exposed
  - Returns boolean only, not user data
*/

-- Grant necessary permissions on auth.users
GRANT USAGE ON SCHEMA auth TO postgres, authenticated;
GRANT SELECT ON auth.users TO postgres, authenticated;

-- Recreate the is_admin function with proper schema access
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  user_role TEXT;
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- If no user is authenticated, return false
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check role directly from auth.users table
  SELECT (raw_user_meta_data->>'role')
  INTO user_role
  FROM auth.users
  WHERE id = current_user_id;
  
  -- Return true if role is 'admin'
  RETURN COALESCE(user_role = 'admin', false);
EXCEPTION
  WHEN OTHERS THEN
    -- In case of any error, return false for security
    RETURN false;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- Ensure RLS policies are correct
DROP POLICY IF EXISTS "Anyone can view published news, admins see all" ON public.news;
DROP POLICY IF EXISTS "Only admins can create news" ON public.news;
DROP POLICY IF EXISTS "Only admins can update news" ON public.news;
DROP POLICY IF EXISTS "Only admins can delete news" ON public.news;

-- Recreate policies
CREATE POLICY "Anyone can view published news, admins see all"
  ON public.news
  FOR SELECT
  USING (published = true OR public.is_admin());

CREATE POLICY "Only admins can create news"
  ON public.news
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update news"
  ON public.news
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete news"
  ON public.news
  FOR DELETE
  TO authenticated
  USING (public.is_admin());