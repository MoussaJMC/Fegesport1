/*
  # Try Alternative RLS Syntax
  
  ## Purpose
  Test different ways to access the user's email in RLS policies
  
  ## Changes
  - Use auth.email() instead of auth.jwt() ->> 'email'
*/

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "news_select_policy" ON news;
DROP POLICY IF EXISTS "news_insert_policy" ON news;
DROP POLICY IF EXISTS "news_update_policy" ON news;
DROP POLICY IF EXISTS "news_delete_policy" ON news;

-- SELECT: Public peut voir les news publiées, admin peut tout voir
CREATE POLICY "news_select_policy" ON news
  FOR SELECT
  TO public
  USING (
    published = true 
    OR 
    auth.email() = 'admin@fegesport.org'
  );

-- INSERT: Seulement l'admin
CREATE POLICY "news_insert_policy" ON news
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.email() = 'admin@fegesport.org'
  );

-- UPDATE: Seulement l'admin
CREATE POLICY "news_update_policy" ON news
  FOR UPDATE
  TO authenticated
  USING (auth.email() = 'admin@fegesport.org')
  WITH CHECK (auth.email() = 'admin@fegesport.org');

-- DELETE: Seulement l'admin
CREATE POLICY "news_delete_policy" ON news
  FOR DELETE
  TO authenticated
  USING (auth.email() = 'admin@fegesport.org');