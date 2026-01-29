/*
  # Fix News RLS - Solution Finale
  
  ## Problème
  Les politiques RLS bloquent l'insertion même pour l'admin
  
  ## Solution
  1. Supprimer toutes les anciennes politiques
  2. Créer de nouvelles politiques ultra-simples qui fonctionnent
  3. Vérifier uniquement l'email pour l'admin
  
  ## Changements
  - DROP toutes les politiques existantes
  - CREATE nouvelles politiques simplifiées
*/

-- Supprimer TOUTES les politiques existantes sur news
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
    auth.jwt() ->> 'email' = 'admin@fegesport.org'
  );

-- INSERT: Seulement l'admin
CREATE POLICY "news_insert_policy" ON news
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@fegesport.org'
  );

-- UPDATE: Seulement l'admin
CREATE POLICY "news_update_policy" ON news
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@fegesport.org')
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@fegesport.org');

-- DELETE: Seulement l'admin
CREATE POLICY "news_delete_policy" ON news
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@fegesport.org');