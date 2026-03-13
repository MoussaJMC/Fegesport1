/*
  # Correction des problèmes critiques de performance et sécurité - Partie 1

  ## Problèmes corrigés

  ### 1. Index manquant sur clé étrangère
     - Ajout d'index sur email_logs.email_queue_id

  ### 2. Suppression des index dupliqués
     - Suppression de idx_event_registrations_member (doublon avec idx_event_registrations_member_id)

  ### 3. Suppression des index inutilisés
     - Conservation des index critiques pour les foreign keys
     - Suppression des index jamais utilisés

  ### 4. Optimisation RLS - Remplacement auth.uid() par (select auth.uid())
     - events: 3 politiques (insert, update, delete)
     - news: 4 politiques (insert, update, delete, select)
     - profiles: 2 politiques (select, update)
     - members: 1 politique (select)
     - event_registrations: 2 politiques (select, insert) - utilise member_id
     - static_files: 1 politique (insert)

  ## Sécurité
     - Performance améliorée pour RLS
     - Index optimisés pour les requêtes fréquentes
*/

-- 1. Ajouter l'index manquant sur email_logs.email_queue_id
CREATE INDEX IF NOT EXISTS idx_email_logs_email_queue_id 
  ON email_logs(email_queue_id);

-- 2. Supprimer l'index dupliqué sur event_registrations
DROP INDEX IF EXISTS idx_event_registrations_member;

-- 3. Supprimer les index inutilisés (garder ceux pour foreign keys et requêtes critiques)
DROP INDEX IF EXISTS idx_news_published;
DROP INDEX IF EXISTS idx_news_author;
DROP INDEX IF EXISTS idx_events_status;
DROP INDEX IF EXISTS idx_members_user_id;
DROP INDEX IF EXISTS idx_members_status;
DROP INDEX IF EXISTS idx_static_files_uploaded_by;
DROP INDEX IF EXISTS idx_static_files_is_public;
DROP INDEX IF EXISTS idx_pages_status;
DROP INDEX IF EXISTS idx_page_sections_active;
DROP INDEX IF EXISTS idx_contact_messages_status;
DROP INDEX IF EXISTS idx_audit_log_user;
DROP INDEX IF EXISTS idx_leg_tournaments_active;
DROP INDEX IF EXISTS idx_history_timeline_active;
DROP INDEX IF EXISTS idx_file_usage_file_id;

-- 4. Optimiser les politiques RLS - events
DROP POLICY IF EXISTS "Admin can insert events" ON events;
CREATE POLICY "Admin can insert events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK ((select is_admin()));

DROP POLICY IF EXISTS "Admin can update events" ON events;
CREATE POLICY "Admin can update events"
  ON events
  FOR UPDATE
  TO authenticated
  USING ((select is_admin()))
  WITH CHECK ((select is_admin()));

DROP POLICY IF EXISTS "Admin can delete events" ON events;
CREATE POLICY "Admin can delete events"
  ON events
  FOR DELETE
  TO authenticated
  USING ((select is_admin()));

-- 5. Optimiser les politiques RLS - news
DROP POLICY IF EXISTS "Admin can insert news" ON news;
CREATE POLICY "Admin can insert news"
  ON news
  FOR INSERT
  TO authenticated
  WITH CHECK ((select is_admin()));

DROP POLICY IF EXISTS "Admin can update news" ON news;
CREATE POLICY "Admin can update news"
  ON news
  FOR UPDATE
  TO authenticated
  USING ((select is_admin()))
  WITH CHECK ((select is_admin()));

DROP POLICY IF EXISTS "Admin can delete news" ON news;
CREATE POLICY "Admin can delete news"
  ON news
  FOR DELETE
  TO authenticated
  USING ((select is_admin()));

DROP POLICY IF EXISTS "Admin can view all news" ON news;
CREATE POLICY "Admin can view all news"
  ON news
  FOR SELECT
  TO authenticated
  USING ((select is_admin()));

-- 6. Optimiser les politiques RLS - profiles
DROP POLICY IF EXISTS "profiles_own_select" ON profiles;
CREATE POLICY "profiles_own_select"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "profiles_own_update" ON profiles;
CREATE POLICY "profiles_own_update"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- 7. Optimiser les politiques RLS - members
DROP POLICY IF EXISTS "members_own_select" ON members;
CREATE POLICY "members_own_select"
  ON members
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- 8. Optimiser les politiques RLS - event_registrations
DROP POLICY IF EXISTS "event_registrations_own_select" ON event_registrations;
CREATE POLICY "event_registrations_own_select"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = (select auth.uid())
    ) 
    OR (select is_admin())
  );

DROP POLICY IF EXISTS "event_registrations_own_insert" ON event_registrations;
CREATE POLICY "event_registrations_own_insert"
  ON event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    member_id IN (
      SELECT id FROM members WHERE user_id = (select auth.uid())
    )
    OR (select is_admin())
  );

-- 9. Optimiser les politiques RLS - static_files
DROP POLICY IF EXISTS "static_files_auth_insert" ON static_files;
CREATE POLICY "static_files_auth_insert"
  ON static_files
  FOR INSERT
  TO authenticated
  WITH CHECK ((select is_admin()));
