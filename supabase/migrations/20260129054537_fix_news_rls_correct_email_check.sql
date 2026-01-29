/*
  # Fix News RLS - Correct Email Check
  
  ## Problem
  auth.email() doesn't work correctly in RLS policies
  
  ## Solution
  Use the correct method to get the user's email from the JWT token
  
  ## Changes
  - Use (auth.jwt() ->> 'email') for email comparison
  - Simplified policies that actually work
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "news_select_policy" ON news;
DROP POLICY IF EXISTS "news_insert_policy" ON news;
DROP POLICY IF EXISTS "news_update_policy" ON news;
DROP POLICY IF EXISTS "news_delete_policy" ON news;

-- SELECT: Public can view published news, admin can view all
CREATE POLICY "news_select_policy" ON news
  FOR SELECT
  TO public
  USING (
    published = true 
    OR 
    (auth.jwt() ->> 'email') = 'admin@fegesport.org'
  );

-- INSERT: Only admin can insert
CREATE POLICY "news_insert_policy" ON news
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'admin@fegesport.org'
  );

-- UPDATE: Only admin can update
CREATE POLICY "news_update_policy" ON news
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'admin@fegesport.org')
  WITH CHECK ((auth.jwt() ->> 'email') = 'admin@fegesport.org');

-- DELETE: Only admin can delete
CREATE POLICY "news_delete_policy" ON news
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'admin@fegesport.org');