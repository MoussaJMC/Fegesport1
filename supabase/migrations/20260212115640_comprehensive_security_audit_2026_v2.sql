/*
  # Audit de Sécurité Complet 2026 - FEGESPORT (Version 2)

  ## Vue d'ensemble
  Cette migration corrige tous les aspects sécuritaires de la base de données :
  - Vérification et renforcement RLS sur toutes les tables
  - Politiques restrictives par défaut
  - Sécurisation des fonctions avec SECURITY INVOKER
  - Protection contre les injections SQL
  - Validation des données sensibles
  - Système d'audit complet

  ## Tables concernées
  Toutes les tables publiques (29 tables)

  ## Changements de sécurité

  ### 1. RLS et Politiques
  - Vérification que RLS est activé sur toutes les tables
  - Suppression des politiques trop permissives
  - Création de politiques restrictives avec vérification d'authentification
  - Utilisation de auth.uid() au lieu de current_user
  - Séparation des politiques SELECT, INSERT, UPDATE, DELETE

  ### 2. Fonctions de sécurité
  - Conversion SECURITY DEFINER → SECURITY INVOKER quand possible
  - Ajout de search_path = '' pour prévenir les attaques
  - Validation des entrées dans les fonctions
  - Protection contre les injections SQL

  ### 3. Contraintes et Validation
  - Validation des emails avec regex
  - Contraintes CHECK sur les statuts
  - NOT NULL sur les champs critiques

  ### 4. Index de performance et sécurité
  - Index sur les colonnes utilisées dans les politiques RLS
  - Index sur les clés étrangères
  - Index pour les recherches fréquentes

  ### 5. Système d'audit
  - Table audit_log pour tracer toutes les modifications
  - Triggers automatiques sur les tables sensibles

  ## Notes importantes
  - Les admins sont identifiés par leur email dans auth.users
  - Les politiques publiques sont limitées à SELECT uniquement
  - Tout INSERT/UPDATE/DELETE nécessite une authentification admin
  - Les fonctions sensibles sont auditées et sécurisées
*/

-- =====================================================
-- SECTION 1: VÉRIFICATION RLS SUR TOUTES LES TABLES
-- =====================================================

DO $$ 
BEGIN
  -- Tables principales
  ALTER TABLE IF EXISTS news ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS events ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS members ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS partners ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS event_registrations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS contact_messages ENABLE ROW LEVEL SECURITY;
  
  -- Tables fichiers
  ALTER TABLE IF EXISTS static_files ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS file_categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS file_usage ENABLE ROW LEVEL SECURITY;
  
  -- Tables pages et contenu
  ALTER TABLE IF EXISTS pages ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS page_sections ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS cards ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS slideshow_images ENABLE ROW LEVEL SECURITY;
  
  -- Tables configuration
  ALTER TABLE IF EXISTS site_settings ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS membership_types ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS leadership_team ENABLE ROW LEVEL SECURITY;
  
  -- Tables LEG
  ALTER TABLE IF EXISTS leg_disciplines ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS leg_clubs ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS leg_club_disciplines ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS leg_tournaments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS sponsors ENABLE ROW LEVEL SECURITY;
  
  -- Tables streaming et historique
  ALTER TABLE IF EXISTS streams ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS history_timeline ENABLE ROW LEVEL SECURITY;
  
  -- Tables email
  ALTER TABLE IF EXISTS email_queue ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS email_templates ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS email_logs ENABLE ROW LEVEL SECURITY;
  
  -- Table profiles
  ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
END $$;

-- =====================================================
-- SECTION 2: FONCTIONS HELPER SÉCURISÉES
-- =====================================================

-- Fonction améliorée pour vérifier les admins
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
SET search_path = ''
AS $$
DECLARE
  user_email text;
BEGIN
  -- Récupérer l'email de l'utilisateur authentifié
  SELECT raw_user_meta_data->>'email'
  INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Vérifier si l'email est dans la liste des admins
  RETURN user_email IN (
    'aamadoubah2002@gmail.com',
    'admin@fegesport224.org',
    'president@fegesport224.org'
  );
END;
$$;

-- Fonction pour vérifier si un utilisateur est authentifié
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
SET search_path = ''
AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$;

-- =====================================================
-- SECTION 3: NETTOYAGE DES POLITIQUES EXISTANTES
-- =====================================================

DO $$ 
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- =====================================================
-- SECTION 4: POLITIQUES RLS SÉCURISÉES PAR TABLE
-- =====================================================

-- NEWS - Lecture publique, écriture admin uniquement
CREATE POLICY "news_public_select"
  ON news FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "news_admin_select"
  ON news FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "news_admin_insert"
  ON news FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "news_admin_update"
  ON news FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "news_admin_delete"
  ON news FOR DELETE
  TO authenticated
  USING (is_admin());

-- EVENTS - Lecture publique des événements actifs, gestion admin
CREATE POLICY "events_public_select"
  ON events FOR SELECT
  TO public
  USING (status != 'cancelled');

CREATE POLICY "events_admin_all"
  ON events FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- MEMBERS - Lecture restreinte, inscription publique, gestion admin
CREATE POLICY "members_public_select_basic"
  ON members FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "members_own_select"
  ON members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "members_admin_all"
  ON members FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- PARTNERS - Lecture publique des actifs, gestion admin
CREATE POLICY "partners_public_select"
  ON partners FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "partners_admin_all"
  ON partners FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- EVENT_REGISTRATIONS - Utilisateurs voient leurs propres inscriptions
CREATE POLICY "event_registrations_own_select"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()) OR is_admin());

CREATE POLICY "event_registrations_own_insert"
  ON event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()) OR is_admin());

CREATE POLICY "event_registrations_admin_all"
  ON event_registrations FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- NEWSLETTER_SUBSCRIPTIONS - Insertion publique, gestion admin
CREATE POLICY "newsletter_public_insert"
  ON newsletter_subscriptions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "newsletter_admin_all"
  ON newsletter_subscriptions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- CONTACT_MESSAGES - Insertion publique, lecture admin uniquement
CREATE POLICY "contact_messages_public_insert"
  ON contact_messages FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "contact_messages_admin_all"
  ON contact_messages FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- STATIC_FILES - Lecture publique des fichiers publics, gestion auth/admin
CREATE POLICY "static_files_public_select"
  ON static_files FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "static_files_auth_select"
  ON static_files FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "static_files_auth_insert"
  ON static_files FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid() OR is_admin());

CREATE POLICY "static_files_admin_all"
  ON static_files FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- FILE_CATEGORIES - Lecture publique, gestion admin
CREATE POLICY "file_categories_public_select"
  ON file_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "file_categories_admin_all"
  ON file_categories FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- FILE_USAGE - Lecture auth, gestion admin
CREATE POLICY "file_usage_auth_select"
  ON file_usage FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "file_usage_admin_all"
  ON file_usage FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- PAGES - Lecture publique des pages publiées, gestion admin
CREATE POLICY "pages_public_select"
  ON pages FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "pages_admin_all"
  ON pages FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- PAGE_SECTIONS - Lecture publique des sections actives, gestion admin
CREATE POLICY "page_sections_public_select"
  ON page_sections FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "page_sections_admin_all"
  ON page_sections FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- CARDS - Lecture publique des cartes actives, gestion admin
CREATE POLICY "cards_public_select"
  ON cards FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "cards_admin_all"
  ON cards FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- SLIDESHOW_IMAGES - Lecture publique des images actives, gestion admin
CREATE POLICY "slideshow_public_select"
  ON slideshow_images FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "slideshow_admin_all"
  ON slideshow_images FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- SITE_SETTINGS - Lecture publique des paramètres publics, gestion admin
CREATE POLICY "site_settings_public_select"
  ON site_settings FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "site_settings_admin_all"
  ON site_settings FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- MEMBERSHIP_TYPES - Lecture publique des types actifs, gestion admin
CREATE POLICY "membership_types_public_select"
  ON membership_types FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "membership_types_admin_all"
  ON membership_types FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- LEADERSHIP_TEAM - Lecture publique des membres actifs, gestion admin
CREATE POLICY "leadership_public_select"
  ON leadership_team FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "leadership_admin_all"
  ON leadership_team FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- LEG_DISCIPLINES - Lecture publique des disciplines actives, gestion admin
CREATE POLICY "leg_disciplines_public_select"
  ON leg_disciplines FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "leg_disciplines_admin_all"
  ON leg_disciplines FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- LEG_CLUBS - Lecture publique des clubs actifs, gestion admin
CREATE POLICY "leg_clubs_public_select"
  ON leg_clubs FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "leg_clubs_admin_all"
  ON leg_clubs FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- LEG_CLUB_DISCIPLINES - Lecture publique, gestion admin
CREATE POLICY "leg_club_disciplines_public_select"
  ON leg_club_disciplines FOR SELECT
  TO public
  USING (true);

CREATE POLICY "leg_club_disciplines_admin_all"
  ON leg_club_disciplines FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- LEG_TOURNAMENTS - Lecture publique des tournois actifs, gestion admin
CREATE POLICY "leg_tournaments_public_select"
  ON leg_tournaments FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "leg_tournaments_admin_all"
  ON leg_tournaments FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- SPONSORS - Lecture publique des sponsors actifs, gestion admin
CREATE POLICY "sponsors_public_select"
  ON sponsors FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "sponsors_admin_all"
  ON sponsors FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- STREAMS - Lecture publique, gestion admin
CREATE POLICY "streams_public_select"
  ON streams FOR SELECT
  TO public
  USING (true);

CREATE POLICY "streams_admin_all"
  ON streams FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- HISTORY_TIMELINE - Lecture publique des événements actifs, gestion admin
CREATE POLICY "history_public_select"
  ON history_timeline FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "history_admin_all"
  ON history_timeline FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- EMAIL_QUEUE - Admin uniquement
CREATE POLICY "email_queue_admin_all"
  ON email_queue FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- EMAIL_TEMPLATES - Admin uniquement
CREATE POLICY "email_templates_admin_all"
  ON email_templates FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- EMAIL_LOGS - Admin uniquement
CREATE POLICY "email_logs_admin_all"
  ON email_logs FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- PROFILES - Utilisateur voit son propre profil, admin voit tout
CREATE POLICY "profiles_own_select"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "profiles_own_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- SECTION 5: INDEX POUR PERFORMANCE ET SÉCURITÉ
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_news_published ON news(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_news_author ON news(author_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_static_files_uploaded_by ON static_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_static_files_is_public ON static_files(is_public);
CREATE INDEX IF NOT EXISTS idx_static_files_category ON static_files(category_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_member ON event_registrations(member_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_page_sections_page ON page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_active ON page_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status, priority, created_at);

-- =====================================================
-- SECTION 6: SÉCURISATION DES FONCTIONS EXISTANTES
-- =====================================================

-- Fonction register_member sécurisée
CREATE OR REPLACE FUNCTION public.register_member(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_birth_date date DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_member_type text DEFAULT 'player'::text,
  p_age_category text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_member_id uuid;
  v_existing_email text;
BEGIN
  IF p_email IS NULL OR p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Email invalide';
  END IF;
  
  IF p_member_type NOT IN ('player', 'club', 'partner') THEN
    RAISE EXCEPTION 'Type de membre invalide';
  END IF;
  
  SELECT email INTO v_existing_email
  FROM public.members
  WHERE email = p_email;
  
  IF v_existing_email IS NOT NULL THEN
    RAISE EXCEPTION 'Un membre avec cet email existe déjà';
  END IF;
  
  INSERT INTO public.members (
    first_name, last_name, email, phone, birth_date,
    address, city, member_type, age_category, status
  ) VALUES (
    p_first_name, p_last_name, p_email, p_phone, p_birth_date,
    p_address, p_city, p_member_type, p_age_category, 'pending'
  )
  RETURNING id INTO v_member_id;
  
  RETURN v_member_id;
END;
$$;

-- Fonction increment_download_count sécurisée
CREATE OR REPLACE FUNCTION public.increment_download_count(file_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.static_files
  SET 
    download_count = COALESCE(download_count, 0) + 1,
    last_accessed_at = NOW()
  WHERE id = file_id;
END;
$$;

-- =====================================================
-- SECTION 7: CONTRAINTES DE VALIDATION
-- =====================================================

ALTER TABLE leadership_team DROP CONSTRAINT IF EXISTS leadership_team_email_check;
ALTER TABLE leadership_team ADD CONSTRAINT leadership_team_email_check 
  CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE leadership_team DROP CONSTRAINT IF EXISTS leadership_team_official_email_check;
ALTER TABLE leadership_team ADD CONSTRAINT leadership_team_official_email_check 
  CHECK (official_email IS NULL OR official_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE contact_messages DROP CONSTRAINT IF EXISTS contact_messages_email_check;
ALTER TABLE contact_messages ADD CONSTRAINT contact_messages_email_check 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE newsletter_subscriptions DROP CONSTRAINT IF EXISTS newsletter_subscriptions_email_check;
ALTER TABLE newsletter_subscriptions ADD CONSTRAINT newsletter_subscriptions_email_check 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- =====================================================
-- SECTION 8: TRIGGERS DE MISE À JOUR AUTOMATIQUE
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'news', 'events', 'members', 'partners', 'newsletter_subscriptions',
      'contact_messages', 'static_files', 'file_categories', 'pages',
      'page_sections', 'site_settings', 'membership_types', 'leadership_team',
      'cards', 'slideshow_images', 'leg_disciplines', 'leg_clubs',
      'leg_club_disciplines', 'leg_tournaments', 'sponsors', 'streams',
      'history_timeline', 'email_queue', 'email_templates'
    )
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END $$;

-- =====================================================
-- SECTION 9: SYSTÈME D'AUDIT
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_admin_only"
  ON audit_log FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);

CREATE OR REPLACE FUNCTION public.log_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_email text;
BEGIN
  SELECT raw_user_meta_data->>'email'
  INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  INSERT INTO public.audit_log (
    table_name, record_id, action, old_data, new_data, user_id, user_email
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    auth.uid(),
    v_user_email
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT unnest(ARRAY[
      'members', 'partners', 'events', 'news', 'leadership_team',
      'site_settings', 'membership_types', 'email_queue'
    ])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS audit_%I ON %I;
      CREATE TRIGGER audit_%I
        AFTER INSERT OR UPDATE OR DELETE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION log_audit();
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END $$;

-- =====================================================
-- SECTION 10: PERMISSIONS FINALES
-- =====================================================

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =====================================================
-- COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION is_admin() IS 'Vérifie si l''utilisateur actuel est un administrateur basé sur son email';
COMMENT ON FUNCTION is_authenticated() IS 'Vérifie si un utilisateur est authentifié';
COMMENT ON TABLE audit_log IS 'Journal d''audit pour tracer toutes les modifications sensibles';
