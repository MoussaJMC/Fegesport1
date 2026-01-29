/*
  # Fix News Creation - Final Solution
  
  ## Problem
  Admins cannot create news articles due to RLS policy issues with the is_admin() function.
  The function needs to check directly against the auth.users table instead of relying on JWT metadata.
  
  ## Solution
  1. Create a more robust is_admin() function that checks auth.users table directly
  2. Grant proper permissions to the function
  3. Recreate RLS policies with proper security
  
  ## Security
  - Only users with role='admin' in user_metadata can perform admin actions
  - Public can only view published news
  - Function is SECURITY DEFINER with proper search_path
*/

-- Drop existing function
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Create new robust is_admin function that checks auth.users table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
  SELECT raw_user_meta_data->>'role'
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- Drop all existing news policies
DROP POLICY IF EXISTS "Admins can select all news" ON public.news;
DROP POLICY IF EXISTS "Admins can insert news" ON public.news;
DROP POLICY IF EXISTS "Admins can update news" ON public.news;
DROP POLICY IF EXISTS "Admins can delete news" ON public.news;
DROP POLICY IF EXISTS "Public can view published news" ON public.news;
DROP POLICY IF EXISTS "Admin can do everything with news" ON public.news;
DROP POLICY IF EXISTS "Admin has full access to news" ON public.news;
DROP POLICY IF EXISTS "Public can view published news, admin sees all" ON public.news;
DROP POLICY IF EXISTS "Only admin can modify news" ON public.news;

-- Enable RLS on news table (if not already enabled)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for news table

-- SELECT policy: Admins see all, public sees only published
CREATE POLICY "Anyone can view published news, admins see all"
  ON public.news
  FOR SELECT
  USING (
    published = true OR public.is_admin()
  );

-- INSERT policy: Only admins can insert
CREATE POLICY "Only admins can create news"
  ON public.news
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- UPDATE policy: Only admins can update
CREATE POLICY "Only admins can update news"
  ON public.news
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE policy: Only admins can delete
CREATE POLICY "Only admins can delete news"
  ON public.news
  FOR DELETE
  TO authenticated
  USING (public.is_admin());