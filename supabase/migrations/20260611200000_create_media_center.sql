/*
  # CENTRE MÉDIA IA FEGESPORT — Schéma complet

  Crée l'infrastructure du Centre Média :
  - media_events          : événements/activités saisis par l'admin (Agent 1 — Collecteur)
  - media_event_files     : médias rattachés (photos, affiches, PDF, vidéos)
  - generated_articles    : contenus IA longs (article de presse, actualité courte, newsletter HTML)
  - social_posts          : publications IA réseaux sociaux (Facebook, LinkedIn, X/Twitter)
  - newsletter_campaigns  : campagnes envoyées via Resend (stats ouvertures/clics)
  - news_sources          : sources de la veille mondiale esport (Agent 2)
  - collected_news        : actualités collectées + analyse IA (Agent 3 — Analyseur)
  - publication_logs      : journal d'audit de toutes les actions de publication
  - ai_usage_logs         : suivi de la consommation API IA + quota journalier

  Réutilise (NE MODIFIE PAS la structure existante en production) :
  - news                    → publication finale des articles sur le site
  - newsletter_subscriptions → liste des abonnés (ajout colonne nullable unsubscribe_token)
  - admin_users / is_admin_user() → contrôle d'accès
  - email_logs / email_queue → traçabilité email existante

  Sécurité :
  - RLS activée sur toutes les tables, accès admin via is_admin_user()
  - Bucket storage "media-center" : lecture publique, écriture admin uniquement
  - Quota IA journalier via la fonction check_media_ai_quota()
*/

-- ============================================================
-- 1. TABLES PRINCIPALES
-- ============================================================

-- Événements du Centre Média (source des générations IA)
CREATE TABLE IF NOT EXISTS media_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  event_date date,
  event_time text,
  location text,
  description text NOT NULL DEFAULT '',
  organizer text DEFAULT 'FEGESPORT',
  category text DEFAULT 'tournoi' CHECK (category IN ('tournoi', 'formation', 'partenariat', 'institutionnel', 'communaute', 'international', 'autre')),
  participants_count integer,
  clubs jsonb DEFAULT '[]'::jsonb,          -- ["Club A", "Club B", ...]
  results jsonb DEFAULT '[]'::jsonb,        -- [{"rank":1,"name":"...","prize":"..."}]
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'in_review', 'published', 'archived')),
  -- Résultats de l'analyse IA (Étape 2 du workflow)
  ai_summary text,
  ai_keywords jsonb DEFAULT '[]'::jsonb,
  ai_categories jsonb DEFAULT '[]'::jsonb,
  ai_seo_tags jsonb DEFAULT '[]'::jsonb,
  ai_analyzed_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Médias rattachés à un événement
CREATE TABLE IF NOT EXISTS media_event_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES media_events(id) ON DELETE CASCADE,
  file_type text NOT NULL CHECK (file_type IN ('photo', 'poster', 'pdf', 'video')),
  storage_path text NOT NULL,
  public_url text NOT NULL,
  file_name text,
  file_size integer,
  caption text,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Contenus longs générés par l'IA (Agent 4 — Rédacteur)
CREATE TABLE IF NOT EXISTS generated_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES media_events(id) ON DELETE CASCADE,
  collected_news_id uuid,                   -- FK ajoutée plus bas (table créée après)
  content_type text NOT NULL CHECK (content_type IN ('press_article', 'short_news', 'newsletter')),
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,                    -- markdown (articles) ou HTML (newsletter)
  word_count integer,
  -- SEO automatique
  slug text,
  meta_title text,
  meta_description text,
  keywords jsonb DEFAULT '[]'::jsonb,
  og_title text,
  og_description text,
  og_image text,
  schema_org jsonb,                         -- objet Schema.org NewsArticle complet
  -- Workflow de validation humaine (Étape 4)
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'published')),
  rejection_reason text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  -- Traçabilité IA (protection hallucinations : modèle + version de prompt + passe éditeur)
  model text,
  prompt_version text DEFAULT 'v1',
  editor_check jsonb,                       -- résultat de l'Agent 5 (Éditeur) : qualité, orthographe, cohérence
  generation_count integer DEFAULT 1,
  -- Publication (Étape 5)
  published_news_id uuid REFERENCES news(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Publications réseaux sociaux générées par l'IA
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES media_events(id) ON DELETE CASCADE,
  collected_news_id uuid,
  platform text NOT NULL CHECK (platform IN ('facebook', 'linkedin', 'twitter')),
  content text NOT NULL,
  hashtags jsonb DEFAULT '[]'::jsonb,
  suggested_image_url text,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'ready', 'published')),
  rejection_reason text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  model text,
  generation_count integer DEFAULT 1,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Campagnes newsletter (envoi via Resend)
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES media_events(id) ON DELETE SET NULL,
  generated_article_id uuid REFERENCES generated_articles(id) ON DELETE SET NULL,
  subject text NOT NULL,
  preheader text,
  html_content text NOT NULL,
  text_content text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_for timestamptz,
  sent_at timestamptz,
  recipients_count integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  opens_count integer DEFAULT 0,
  clicks_count integer DEFAULT 0,
  bounces_count integer DEFAULT 0,
  unsubscribes_count integer DEFAULT 0,
  error_message text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Sources de la veille mondiale esport
CREATE TABLE IF NOT EXISTS news_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  organization text,
  website_url text,
  feed_url text,                            -- flux RSS/Atom si disponible
  source_type text NOT NULL DEFAULT 'rss' CHECK (source_type IN ('rss', 'html', 'api')),
  topics jsonb DEFAULT '[]'::jsonb,         -- ["compétitions","règlements","annonces","classements","partenariats"]
  is_active boolean NOT NULL DEFAULT true,
  last_fetched_at timestamptz,
  last_fetch_status text,
  fetch_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Actualités collectées par la veille + analyse IA
CREATE TABLE IF NOT EXISTS collected_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES news_sources(id) ON DELETE SET NULL,
  title text NOT NULL,
  url text NOT NULL UNIQUE,                 -- déduplication par URL (vérification des sources)
  summary text,
  raw_excerpt text,
  image_url text,
  published_at timestamptz,
  collected_at timestamptz NOT NULL DEFAULT now(),
  -- Analyse IA (Agent 3) : importance, impact, pertinence pour la Guinée
  ai_importance integer CHECK (ai_importance BETWEEN 0 AND 100),
  ai_impact integer CHECK (ai_impact BETWEEN 0 AND 100),
  ai_relevance_guinea integer CHECK (ai_relevance_guinea BETWEEN 0 AND 100),
  ai_category text,
  ai_analysis jsonb,
  ai_analyzed_at timestamptz,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'analyzed', 'flagged', 'used', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- FK différées (generated_articles / social_posts → collected_news)
DO $$ BEGIN
  ALTER TABLE generated_articles
    ADD CONSTRAINT generated_articles_collected_news_fk
    FOREIGN KEY (collected_news_id) REFERENCES collected_news(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE social_posts
    ADD CONSTRAINT social_posts_collected_news_fk
    FOREIGN KEY (collected_news_id) REFERENCES collected_news(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Journal d'audit des publications
CREATE TABLE IF NOT EXISTS publication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,                -- media_event | generated_article | social_post | newsletter_campaign | collected_news
  entity_id uuid NOT NULL,
  action text NOT NULL,                     -- created | generated | regenerated | approved | rejected | published | sent | dismissed
  channel text,                             -- site | facebook | linkedin | twitter | newsletter
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_by_email text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Suivi de la consommation IA (quotas API)
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,              -- media-generate | media-watch
  model text NOT NULL,
  input_tokens integer DEFAULT 0,
  output_tokens integer DEFAULT 0,
  event_id uuid REFERENCES media_events(id) ON DELETE SET NULL,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. EXTENSION DOUCE DES TABLES EXISTANTES (colonnes nullables)
-- ============================================================

-- Jeton de désabonnement newsletter (lien one-click dans les emails)
ALTER TABLE newsletter_subscriptions
  ADD COLUMN IF NOT EXISTS unsubscribe_token uuid DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_subscriptions_unsub_token
  ON newsletter_subscriptions(unsubscribe_token) WHERE unsubscribe_token IS NOT NULL;

-- SEO des articles du site (slug + métadonnées) — nullable, n'impacte pas l'existant
ALTER TABLE news ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE news ADD COLUMN IF NOT EXISTS seo jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_slug ON news(slug) WHERE slug IS NOT NULL;

-- ============================================================
-- 3. INDEX
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_media_events_status ON media_events(status);
CREATE INDEX IF NOT EXISTS idx_media_events_date ON media_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_media_events_created_by ON media_events(created_by);
CREATE INDEX IF NOT EXISTS idx_media_event_files_event ON media_event_files(event_id);
CREATE INDEX IF NOT EXISTS idx_generated_articles_event ON generated_articles(event_id);
CREATE INDEX IF NOT EXISTS idx_generated_articles_status ON generated_articles(status);
CREATE INDEX IF NOT EXISTS idx_generated_articles_type ON generated_articles(content_type);
CREATE INDEX IF NOT EXISTS idx_generated_articles_news ON generated_articles(published_news_id);
CREATE INDEX IF NOT EXISTS idx_generated_articles_collected ON generated_articles(collected_news_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_event ON social_posts(event_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_collected ON social_posts(collected_news_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_event ON newsletter_campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_article ON newsletter_campaigns(generated_article_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_created_by ON newsletter_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_news_sources_active ON news_sources(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_collected_news_source ON collected_news(source_id);
CREATE INDEX IF NOT EXISTS idx_collected_news_status ON collected_news(status);
CREATE INDEX IF NOT EXISTS idx_collected_news_relevance ON collected_news(ai_relevance_guinea DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_collected_news_collected_at ON collected_news(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_publication_logs_entity ON publication_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_publication_logs_created ON publication_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_publication_logs_performed_by ON publication_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created ON ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_event ON ai_usage_logs(event_id);

-- ============================================================
-- 4. TRIGGERS updated_at (réutilise update_updated_at_column existante)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['media_events', 'generated_articles', 'social_posts', 'newsletter_campaigns', 'news_sources']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at_%I ON %I', t, t);
    EXECUTE format('CREATE TRIGGER set_updated_at_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
  END LOOP;
END $$;

-- ============================================================
-- 5. QUOTA IA JOURNALIER
-- ============================================================

-- Retourne true si le quota journalier d'appels IA n'est pas dépassé.
-- Limite par défaut : 50 appels/jour (modifiable via site_settings clé 'media_ai_daily_quota').
CREATE OR REPLACE FUNCTION check_media_ai_quota()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_quota integer := 50;
  v_used integer;
  v_setting text;
BEGIN
  BEGIN
    SELECT value INTO v_setting FROM site_settings WHERE key = 'media_ai_daily_quota' LIMIT 1;
    IF v_setting IS NOT NULL THEN
      v_quota := v_setting::integer;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_quota := 50;
  END;

  SELECT count(*) INTO v_used
  FROM ai_usage_logs
  WHERE created_at >= date_trunc('day', now());

  RETURN v_used < v_quota;
END;
$$;

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE media_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_event_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE collected_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Tout le Centre Média est réservé aux admins (validation humaine obligatoire).
-- Les contenus publiés sont diffusés via la table `news` (déjà publique).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['media_events', 'media_event_files', 'generated_articles', 'social_posts',
                           'newsletter_campaigns', 'news_sources', 'collected_news']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "admin_all_%s" ON %I', t, t);
    EXECUTE format(
      'CREATE POLICY "admin_all_%s" ON %I FOR ALL TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user())',
      t, t
    );
  END LOOP;
END $$;

-- Audit : lecture/insertion admin, jamais de modification ni suppression
DROP POLICY IF EXISTS "admin_read_publication_logs" ON publication_logs;
CREATE POLICY "admin_read_publication_logs" ON publication_logs
  FOR SELECT TO authenticated USING (is_admin_user());
DROP POLICY IF EXISTS "admin_insert_publication_logs" ON publication_logs;
CREATE POLICY "admin_insert_publication_logs" ON publication_logs
  FOR INSERT TO authenticated WITH CHECK (is_admin_user());

DROP POLICY IF EXISTS "admin_read_ai_usage_logs" ON ai_usage_logs;
CREATE POLICY "admin_read_ai_usage_logs" ON ai_usage_logs
  FOR SELECT TO authenticated USING (is_admin_user());
-- Les insertions ai_usage_logs sont faites par les Edge Functions (service_role, bypass RLS).

-- ============================================================
-- 7. BUCKET STORAGE media-center
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-center',
  'media-center',
  true,                                     -- lecture publique (images réutilisées sur le site)
  52428800,                                 -- 50 Mo max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "media_center_public_read" ON storage.objects;
CREATE POLICY "media_center_public_read" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'media-center');

DROP POLICY IF EXISTS "media_center_admin_insert" ON storage.objects;
CREATE POLICY "media_center_admin_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media-center' AND is_admin_user());

DROP POLICY IF EXISTS "media_center_admin_update" ON storage.objects;
CREATE POLICY "media_center_admin_update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'media-center' AND is_admin_user());

DROP POLICY IF EXISTS "media_center_admin_delete" ON storage.objects;
CREATE POLICY "media_center_admin_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media-center' AND is_admin_user());

-- ============================================================
-- 8. SEED — SOURCES DE VEILLE MONDIALE
-- ============================================================

INSERT INTO news_sources (name, organization, website_url, feed_url, source_type, topics) VALUES
  ('IESF — International Esports Federation', 'IESF', 'https://iesf.org', 'https://iesf.org/feed', 'rss', '["compétitions","règlements","annonces"]'),
  ('ACES — African Confederation of Esports', 'ACES', 'https://aces.africa', NULL, 'html', '["compétitions","annonces","partenariats"]'),
  ('GEF — Global Esports Federation', 'GEF', 'https://globalesports.org', 'https://globalesports.org/feed', 'rss', '["compétitions","annonces","partenariats"]'),
  ('Esports World Cup', 'EWC', 'https://esportsworldcup.com', NULL, 'html', '["compétitions","classements","annonces"]'),
  ('Riot Games News', 'Riot Games', 'https://www.riotgames.com/en/news', NULL, 'html', '["compétitions","annonces"]'),
  ('EA Sports FC News', 'EA Sports', 'https://www.ea.com/games/ea-sports-fc/news', NULL, 'html', '["compétitions","annonces","règlements"]'),
  ('Mobile Legends Esports', 'Moonton', 'https://esports.mobilelegends.com', NULL, 'html', '["compétitions","classements"]'),
  ('PUBG Mobile Esports', 'Tencent/Krafton', 'https://www.pubgmobile.com/esports', NULL, 'html', '["compétitions","classements","règlements"]'),
  ('Free Fire Esports', 'Garena', 'https://ff.garena.com/esports', NULL, 'html', '["compétitions","classements"]'),
  ('Tekken Esports (Bandai Namco)', 'Bandai Namco', 'https://www.bandainamcoesports.com', NULL, 'html', '["compétitions","règlements"]'),
  ('Street Fighter / Capcom Pro Tour', 'Capcom', 'https://sf.esports.capcom.com', NULL, 'html', '["compétitions","classements","règlements"]'),
  ('FIFAe', 'FIFA', 'https://www.fifa.gg', NULL, 'html', '["compétitions","règlements","classements"]')
ON CONFLICT DO NOTHING;
