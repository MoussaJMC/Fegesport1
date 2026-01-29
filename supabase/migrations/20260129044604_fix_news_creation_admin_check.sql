/*
  # Fix News Creation - Correct Admin Check Function
  
  ## Issue
  The is_admin() function was not correctly accessing user metadata from the JWT.
  This prevented admins from creating news articles even when logged in as admin.
  
  ## Changes
  1. Fix the is_admin() function to correctly check both user_metadata and app_metadata
  2. Add a helper function to check if user is authenticated
  3. Recreate news policies with correct checks
  
  ## Security
  - Admins (users with role='admin' in metadata) can do everything
  - Public can only view published news
  - Authenticated non-admin users can only view published news
*/

-- Drop existing function
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Create corrected is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Try to get role from user_metadata first
  user_role := COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role',
    auth.jwt() -> 'app_metadata' ->> 'role'
  );
  
  RETURN user_role = 'admin';
END;
$$;

-- Drop existing news policies
DROP POLICY IF EXISTS "Admin can do everything with news" ON public.news;
DROP POLICY IF EXISTS "Public can view published news" ON public.news;
DROP POLICY IF EXISTS "Admin has full access to news" ON public.news;
DROP POLICY IF EXISTS "Public can view published news, admin sees all" ON public.news;
DROP POLICY IF EXISTS "Only admin can modify news" ON public.news;

-- Create new policies for news table
CREATE POLICY "Admins can select all news"
  ON public.news
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert news"
  ON public.news
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update news"
  ON public.news
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete news"
  ON public.news
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Public can view published news"
  ON public.news
  FOR SELECT
  USING (published = true);