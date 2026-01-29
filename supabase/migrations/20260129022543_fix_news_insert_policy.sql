/*
  # Fix News Table RLS Policies for Admin INSERT
  
  ## Issue
  The "Admin has full access to news" policy is missing the WITH CHECK clause,
  preventing admins from inserting new articles.
  
  ## Changes
  1. Drop existing news policies
  2. Create new policies with proper WITH CHECK clauses
  
  ## Security
  - Admins can do everything (SELECT, INSERT, UPDATE, DELETE)
  - Public can only view published news
*/

-- Drop existing news policies
DROP POLICY IF EXISTS "Admin has full access to news" ON public.news;
DROP POLICY IF EXISTS "Public can view published news" ON public.news;
DROP POLICY IF EXISTS "Public can view published news, admin sees all" ON public.news;
DROP POLICY IF EXISTS "Only admin can modify news" ON public.news;

-- Create new comprehensive policies
CREATE POLICY "Admin can do everything with news"
  ON public.news
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Public can view published news"
  ON public.news
  FOR SELECT
  USING (published = true OR public.is_admin());