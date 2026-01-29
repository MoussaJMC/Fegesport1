/*
  # Fix News Creation - Use JWT Claims Properly
  
  ## Problem
  The is_admin() function needs to properly read JWT claims.
  In Supabase, user metadata is available in the JWT under user_metadata.
  
  ## Solution
  1. Recreate is_admin() to properly parse JWT claims
  2. Use auth.jwt() to access the user metadata
  3. Handle both user_metadata and app_metadata
  
  ## Security
  - Function reads from JWT which is cryptographically signed
  - Only returns boolean, no sensitive data exposed
  - Falls back to false if any error occurs
*/

-- Drop existing function
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Create simplified is_admin function using JWT claims
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    nullif(current_setting('request.jwt.claims', true), '')::json->>'role' = 'admin'
    OR
    nullif(current_setting('request.jwt.claims', true), '')::json->'user_metadata'->>'role' = 'admin'
    OR
    nullif(current_setting('request.jwt.claims', true), '')::json->'app_metadata'->>'role' = 'admin',
    false
  );
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, postgres;

-- Ensure RLS is enabled on news table
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Drop all existing news policies to start fresh
DROP POLICY IF EXISTS "Anyone can view published news, admins see all" ON public.news;
DROP POLICY IF EXISTS "Only admins can create news" ON public.news;
DROP POLICY IF EXISTS "Only admins can update news" ON public.news;
DROP POLICY IF EXISTS "Only admins can delete news" ON public.news;
DROP POLICY IF EXISTS "Admins can select all news" ON public.news;
DROP POLICY IF EXISTS "Admins can insert news" ON public.news;
DROP POLICY IF EXISTS "Admins can update news" ON public.news;
DROP POLICY IF EXISTS "Admins can delete news" ON public.news;
DROP POLICY IF EXISTS "Public can view published news" ON public.news;

-- Create new simplified policies
CREATE POLICY "news_select_policy"
  ON public.news
  FOR SELECT
  USING (
    published = true 
    OR 
    public.is_admin()
  );

CREATE POLICY "news_insert_policy"
  ON public.news
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "news_update_policy"
  ON public.news
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "news_delete_policy"
  ON public.news
  FOR DELETE
  TO authenticated
  USING (public.is_admin());