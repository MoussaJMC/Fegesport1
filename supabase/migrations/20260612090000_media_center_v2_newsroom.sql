/*
  # FEGESPORT AI MEDIA CENTER V2 — Salle de rédaction numérique

  Évolution INCRÉMENTALE de la migration 20260611200000_create_media_center.sql.
  Aucune table existante n'est recréée ; uniquement des extensions.

  Nouveautés par agent :
  - Agent 1 (World Esport Scout)  : impact Afrique + 6 nouvelles sources (Valorant, CS, Liquipedia,
                                     Esports Insider, Dot Esports, Esports Observer)
  - Agent 2 (Field Reporter)      : entités extraites (joueurs, clubs, partenaires, scores, citations)
  - Agent 3 (Editor in Chief)     : priorité éditoriale (urgent/prioritaire/standard/archive)
                                     + décision (publier/réviser/ignorer)
  - Agent 4 (Press Writer)        : nouveau type de contenu 'web_seo'
  - Agent 5 (Fact Checker)        : score de confiance 0-100, < 70 → relecture obligatoire
  - Agent 7 (Social Media Manager): Instagram, WhatsApp Channel, Telegram + CTA + visuel suggéré
  - Agent 8 (Newsletter Manager)  : segments d'abonnés + types de campagne (hebdo/mensuel/urgent)
  - Agent 9 (Media Analytics)     : vues KPI journalier / hebdomadaire / mensuel
*/

-- ============================================================
-- 1. AGENT 3 — EDITOR IN CHIEF : triage éditorial de la veille
-- ============================================================

ALTER TABLE collected_news ADD COLUMN IF NOT EXISTS ai_impact_africa integer
  CHECK (ai_impact_africa BETWEEN 0 AND 100);
ALTER TABLE collected_news ADD COLUMN IF NOT EXISTS editorial_priority text
  CHECK (editorial_priority IN ('urgent', 'priority', 'standard', 'archive'));
ALTER TABLE collected_news ADD COLUMN IF NOT EXISTS editorial_decision text
  CHECK (editorial_decision IN ('publish', 'revise', 'ignore'));
ALTER TABLE collected_news ADD COLUMN IF NOT EXISTS editorial_reason text;

CREATE INDEX IF NOT EXISTS idx_collected_news_priority
  ON collected_news(editorial_priority) WHERE editorial_priority IS NOT NULL;

-- Triage aussi applicable aux événements internes
ALTER TABLE media_events ADD COLUMN IF NOT EXISTS editorial_priority text
  CHECK (editorial_priority IN ('urgent', 'priority', 'standard', 'archive'));

-- ============================================================
-- 2. AGENT 2 — FIELD REPORTER : entités extraites
-- ============================================================

-- { "players": [], "clubs": [], "partners": [], "scores": [], "quotes": [] }
ALTER TABLE media_events ADD COLUMN IF NOT EXISTS extracted_entities jsonb DEFAULT '{}'::jsonb;

-- ============================================================
-- 3. AGENT 4 — PRESS WRITER : version Site Web SEO
-- ============================================================

ALTER TABLE generated_articles DROP CONSTRAINT IF EXISTS generated_articles_content_type_check;
ALTER TABLE generated_articles ADD CONSTRAINT generated_articles_content_type_check
  CHECK (content_type IN ('press_article', 'short_news', 'web_seo', 'newsletter'));

-- ============================================================
-- 4. AGENT 5 — FACT CHECKER : score de confiance
-- ============================================================

-- { "confidence": 0-100, "verdict": "...", "checked_facts": [{claim, source, confidence, date}], "warnings": [] }
ALTER TABLE generated_articles ADD COLUMN IF NOT EXISTS fact_check jsonb;
ALTER TABLE generated_articles ADD COLUMN IF NOT EXISTS fact_check_score integer
  CHECK (fact_check_score BETWEEN 0 AND 100);
-- true quand fact_check_score < 70 → "RELECTURE OBLIGATOIRE" dans l'admin
ALTER TABLE generated_articles ADD COLUMN IF NOT EXISTS needs_mandatory_review boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_generated_articles_mandatory_review
  ON generated_articles(needs_mandatory_review) WHERE needs_mandatory_review = true;

-- ============================================================
-- 5. AGENT 7 — SOCIAL MEDIA MANAGER : 6 canaux + CTA + visuels
-- ============================================================

ALTER TABLE social_posts DROP CONSTRAINT IF EXISTS social_posts_platform_check;
ALTER TABLE social_posts ADD CONSTRAINT social_posts_platform_check
  CHECK (platform IN ('facebook', 'linkedin', 'twitter', 'instagram', 'whatsapp', 'telegram'));

ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS cta text;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS visual_suggestion text;

-- ============================================================
-- 6. AGENT 8 — NEWSLETTER MANAGER : segments + types de campagne
-- ============================================================

-- Segment d'abonné : general | players | clubs | partners | press
ALTER TABLE newsletter_subscriptions ADD COLUMN IF NOT EXISTS segment text DEFAULT 'general'
  CHECK (segment IN ('general', 'players', 'clubs', 'partners', 'press'));

ALTER TABLE newsletter_campaigns ADD COLUMN IF NOT EXISTS campaign_type text DEFAULT 'event'
  CHECK (campaign_type IN ('event', 'weekly', 'monthly', 'urgent'));
ALTER TABLE newsletter_campaigns ADD COLUMN IF NOT EXISTS target_segments jsonb DEFAULT '["general"]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_segment
  ON newsletter_subscriptions(segment) WHERE status = 'active';

-- ============================================================
-- 7. AGENT 9 — MEDIA ANALYTICS : vues KPI
-- ============================================================

-- KPI journalier (les vues hebdo/mensuel agrègent côté requête avec date_trunc)
CREATE OR REPLACE VIEW media_kpi_daily
WITH (security_invoker = true)
AS
SELECT
  d.day,
  COALESCE(a.articles_published, 0)   AS articles_published,
  COALESCE(s.social_ready, 0)         AS social_posts_ready,
  COALESCE(n.campaigns_sent, 0)       AS newsletters_sent,
  COALESCE(n.recipients, 0)           AS newsletter_recipients,
  COALESCE(n.opens, 0)                AS newsletter_opens,
  COALESCE(n.clicks, 0)               AS newsletter_clicks,
  COALESCE(c.news_collected, 0)       AS news_collected,
  COALESCE(ai.ai_calls, 0)            AS ai_calls,
  COALESCE(ai.tokens_in, 0)           AS ai_tokens_in,
  COALESCE(ai.tokens_out, 0)          AS ai_tokens_out,
  COALESCE(sub.new_subscribers, 0)    AS new_subscribers
FROM (
  SELECT generate_series(date_trunc('day', now()) - interval '89 days', date_trunc('day', now()), interval '1 day')::date AS day
) d
LEFT JOIN (
  SELECT published_at::date AS day, count(*) AS articles_published
  FROM generated_articles WHERE status = 'published' GROUP BY 1
) a ON a.day = d.day
LEFT JOIN (
  SELECT published_at::date AS day, count(*) AS social_ready
  FROM social_posts WHERE status IN ('ready', 'published') GROUP BY 1
) s ON s.day = d.day
LEFT JOIN (
  SELECT sent_at::date AS day, count(*) AS campaigns_sent,
         sum(recipients_count) AS recipients, sum(opens_count) AS opens, sum(clicks_count) AS clicks
  FROM newsletter_campaigns WHERE status = 'sent' GROUP BY 1
) n ON n.day = d.day
LEFT JOIN (
  SELECT collected_at::date AS day, count(*) AS news_collected
  FROM collected_news GROUP BY 1
) c ON c.day = d.day
LEFT JOIN (
  SELECT created_at::date AS day, count(*) AS ai_calls,
         sum(input_tokens) AS tokens_in, sum(output_tokens) AS tokens_out
  FROM ai_usage_logs GROUP BY 1
) ai ON ai.day = d.day
LEFT JOIN (
  SELECT created_at::date AS day, count(*) AS new_subscribers
  FROM newsletter_subscriptions GROUP BY 1
) sub ON sub.day = d.day;

-- ============================================================
-- 8. AGENT 1 — WORLD ESPORT SCOUT : sources supplémentaires
-- ============================================================

INSERT INTO news_sources (name, organization, website_url, feed_url, source_type, topics)
SELECT v.name, v.organization, v.website_url, v.feed_url, v.source_type, v.topics::jsonb
FROM (VALUES
  ('Valorant Esports', 'Riot Games', 'https://valorantesports.com', NULL, 'html', '["compétitions","classements"]'),
  ('Counter-Strike (HLTV)', 'HLTV', 'https://www.hltv.org', 'https://www.hltv.org/rss/news', 'rss', '["compétitions","classements","annonces"]'),
  ('Liquipedia', 'Team Liquid', 'https://liquipedia.net', NULL, 'html', '["compétitions","classements","règlements"]'),
  ('Esports Insider', 'Esports Insider', 'https://esportsinsider.com', 'https://esportsinsider.com/feed', 'rss', '["annonces","partenariats"]'),
  ('Dot Esports', 'Gamurs', 'https://dotesports.com', 'https://dotesports.com/feed', 'rss', '["compétitions","annonces"]'),
  ('The Esports Advocate', 'TEA', 'https://esportsadvocate.net', 'https://esportsadvocate.net/feed/', 'rss', '["annonces","partenariats","règlements"]')
) AS v(name, organization, website_url, feed_url, source_type, topics)
WHERE NOT EXISTS (SELECT 1 FROM news_sources ns WHERE ns.name = v.name);

-- ============================================================
-- 9. SÉCURITÉ — la vue KPI est réservée aux admins
-- ============================================================

REVOKE ALL ON media_kpi_daily FROM anon;
GRANT SELECT ON media_kpi_daily TO authenticated;
-- security_invoker = true : la vue applique les RLS des tables sous-jacentes,
-- qui exigent toutes is_admin_user().
