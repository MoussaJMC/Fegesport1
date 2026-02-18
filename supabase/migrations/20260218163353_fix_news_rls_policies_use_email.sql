/*
  # Fix News RLS Policies - Use Email-Based Authentication

  ## Problem
  Current news policies use `is_admin()` function which fails with:
  "permission denied for schema auth"
  
  ## Changes
  1. Drop all existing admin policies that use is_admin()
  2. Create new policies using email check: auth.jwt() ->> 'email' = 'admin@fegesport.org'
  3. Ensure separate policies for INSERT, SELECT, UPDATE, DELETE
  
  ## Security
  - Only admin@fegesport.org can insert, update, or delete news
  - Admin can see all news (published and unpublished)
  - Public users can only see published news
*/

-- Drop all existing admin policies
DROP POLICY IF EXISTS "news_admin_insert" ON news;
DROP POLICY IF EXISTS "news_admin_select" ON news;
DROP POLICY IF EXISTS "news_admin_update" ON news;
DROP POLICY IF EXISTS "news_admin_delete" ON news;

-- Create INSERT policy for admin
CREATE POLICY "Admin can insert news"
  ON news
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@fegesport.org'
  );

-- Create SELECT policy for admin (can see all news)
CREATE POLICY "Admin can view all news"
  ON news
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@fegesport.org'
  );

-- Create UPDATE policy for admin
CREATE POLICY "Admin can update news"
  ON news
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@fegesport.org'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@fegesport.org'
  );

-- Create DELETE policy for admin
CREATE POLICY "Admin can delete news"
  ON news
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@fegesport.org'
  );

-- Keep public read policy (already exists)
-- news_public_select: public can only see published news
