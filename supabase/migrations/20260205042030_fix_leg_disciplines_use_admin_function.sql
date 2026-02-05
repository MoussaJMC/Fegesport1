/*
  # Correction des politiques RLS pour LEG avec fonction is_admin()

  1. Problème
    - Les politiques actuelles vérifient l'email dans auth.users
    - Cette méthode n'est pas fiable dans tous les contextes
    - La fonction is_admin() existe déjà et est plus robuste
    
  2. Solution
    - Remplacer toutes les vérifications d'email par is_admin()
    - Utiliser la fonction SECURITY DEFINER existante
    
  3. Sécurité
    - Lecture publique maintenue
    - Modifications réservées aux admins authentifiés
    - Utilisation de la fonction is_admin() qui vérifie le rôle dans raw_user_meta_data
*/

-- Supprimer les anciennes politiques pour leg_disciplines
DROP POLICY IF EXISTS "Admins peuvent insérer des disciplines" ON leg_disciplines;
DROP POLICY IF EXISTS "Admins peuvent modifier des disciplines" ON leg_disciplines;
DROP POLICY IF EXISTS "Admins peuvent supprimer des disciplines" ON leg_disciplines;

-- Créer les nouvelles politiques avec is_admin()
CREATE POLICY "Admins peuvent insérer des disciplines"
  ON leg_disciplines FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins peuvent modifier des disciplines"
  ON leg_disciplines FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins peuvent supprimer des disciplines"
  ON leg_disciplines FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Supprimer les anciennes politiques pour leg_clubs
DROP POLICY IF EXISTS "Admins peuvent insérer des clubs" ON leg_clubs;
DROP POLICY IF EXISTS "Admins peuvent modifier des clubs" ON leg_clubs;
DROP POLICY IF EXISTS "Admins peuvent supprimer des clubs" ON leg_clubs;

-- Créer les nouvelles politiques pour leg_clubs avec is_admin()
CREATE POLICY "Admins peuvent insérer des clubs"
  ON leg_clubs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins peuvent modifier des clubs"
  ON leg_clubs FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins peuvent supprimer des clubs"
  ON leg_clubs FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Supprimer les anciennes politiques pour leg_club_disciplines
DROP POLICY IF EXISTS "Admins peuvent insérer des disciplines de club" ON leg_club_disciplines;
DROP POLICY IF EXISTS "Admins peuvent modifier des disciplines de club" ON leg_club_disciplines;
DROP POLICY IF EXISTS "Admins peuvent supprimer des disciplines de club" ON leg_club_disciplines;

-- Créer les nouvelles politiques pour leg_club_disciplines avec is_admin()
CREATE POLICY "Admins peuvent insérer des disciplines de club"
  ON leg_club_disciplines FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins peuvent modifier des disciplines de club"
  ON leg_club_disciplines FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins peuvent supprimer des disciplines de club"
  ON leg_club_disciplines FOR DELETE
  TO authenticated
  USING (public.is_admin());