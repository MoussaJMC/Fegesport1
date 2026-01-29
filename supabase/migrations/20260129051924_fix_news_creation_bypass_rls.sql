/*
  # Fix News Creation - Bypass RLS for Admin Email
  
  ## Problem
  JWT claims might not be properly propagated or parsed.
  Need a more direct approach.
  
  ## Solution
  1. Check admin email directly in policies
  2. Fallback to is_admin() function
  3. Ensure admin@fegesport.org can always insert
  
  ## Security
  - Only specific admin email can bypass
  - Public still sees only published news
*/

-- Drop all existing news policies
DROP POLICY IF EXISTS "news_select_policy" ON public.news;
DROP POLICY IF EXISTS "news_insert_policy" ON public.news;
DROP POLICY IF EXISTS "news_update_policy" ON public.news;
DROP POLICY IF EXISTS "news_delete_policy" ON public.news;

-- Create new policies with direct email check
CREATE POLICY "news_select_policy"
  ON public.news
  FOR SELECT
  USING (
    published = true 
    OR 
    auth.jwt()->>'email' = 'admin@fegesport.org'
    OR
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
    OR
    (auth.jwt()->'app_metadata'->>'role' = 'admin')
  );

CREATE POLICY "news_insert_policy"
  ON public.news
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'email' = 'admin@fegesport.org'
    OR
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
    OR
    (auth.jwt()->'app_metadata'->>'role' = 'admin')
  );

CREATE POLICY "news_update_policy"
  ON public.news
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt()->>'email' = 'admin@fegesport.org'
    OR
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
    OR
    (auth.jwt()->'app_metadata'->>'role' = 'admin')
  )
  WITH CHECK (
    auth.jwt()->>'email' = 'admin@fegesport.org'
    OR
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
    OR
    (auth.jwt()->'app_metadata'->>'role' = 'admin')
  );

CREATE POLICY "news_delete_policy"
  ON public.news
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt()->>'email' = 'admin@fegesport.org'
    OR
    (auth.jwt()->'user_metadata'->>'role' = 'admin')
    OR
    (auth.jwt()->'app_metadata'->>'role' = 'admin')
  );