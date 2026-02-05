/*
  # Correction des politiques RLS pour leg_disciplines

  1. Modifications
    - Mise à jour de toutes les politiques RLS pour utiliser l'email admin correct
    - Changement de 'contact@fegesport.org' vers 'contact@fegesport224.org'
    - Suppression de 'admin@fegesport.org' et 'test@example.com'
    
  2. Sécurité
    - Maintien de la lecture publique
    - Seul l'admin contact@fegesport224.org peut modifier les disciplines
*/

-- Supprimer les anciennes politiques pour leg_disciplines
DROP POLICY IF EXISTS "Admins peuvent insérer des disciplines" ON leg_disciplines;
DROP POLICY IF EXISTS "Admins peuvent modifier des disciplines" ON leg_disciplines;
DROP POLICY IF EXISTS "Admins peuvent supprimer des disciplines" ON leg_disciplines;

-- Créer les nouvelles politiques avec le bon email admin
CREATE POLICY "Admins peuvent insérer des disciplines"
  ON leg_disciplines FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'contact@fegesport224.org'
    )
  );

CREATE POLICY "Admins peuvent modifier des disciplines"
  ON leg_disciplines FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'contact@fegesport224.org'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'contact@fegesport224.org'
    )
  );

CREATE POLICY "Admins peuvent supprimer des disciplines"
  ON leg_disciplines FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'contact@fegesport224.org'
    )
  );

-- Supprimer les anciennes politiques pour leg_clubs
DROP POLICY IF EXISTS "Admins peuvent insérer des clubs" ON leg_clubs;
DROP POLICY IF EXISTS "Admins peuvent modifier des clubs" ON leg_clubs;
DROP POLICY IF EXISTS "Admins peuvent supprimer des clubs" ON leg_clubs;

-- Créer les nouvelles politiques pour leg_clubs
CREATE POLICY "Admins peuvent insérer des clubs"
  ON leg_clubs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'contact@fegesport224.org'
    )
  );

CREATE POLICY "Admins peuvent modifier des clubs"
  ON leg_clubs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'contact@fegesport224.org'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'contact@fegesport224.org'
    )
  );

CREATE POLICY "Admins peuvent supprimer des clubs"
  ON leg_clubs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'contact@fegesport224.org'
    )
  );

-- Supprimer les anciennes politiques pour leg_club_disciplines
DROP POLICY IF EXISTS "Admins peuvent insérer des disciplines de club" ON leg_club_disciplines;
DROP POLICY IF EXISTS "Admins peuvent modifier des disciplines de club" ON leg_club_disciplines;
DROP POLICY IF EXISTS "Admins peuvent supprimer des disciplines de club" ON leg_club_disciplines;

-- Créer les nouvelles politiques pour leg_club_disciplines
CREATE POLICY "Admins peuvent insérer des disciplines de club"
  ON leg_club_disciplines FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'contact@fegesport224.org'
    )
  );

CREATE POLICY "Admins peuvent modifier des disciplines de club"
  ON leg_club_disciplines FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'contact@fegesport224.org'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'contact@fegesport224.org'
    )
  );

CREATE POLICY "Admins peuvent supprimer des disciplines de club"
  ON leg_club_disciplines FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'contact@fegesport224.org'
    )
  );