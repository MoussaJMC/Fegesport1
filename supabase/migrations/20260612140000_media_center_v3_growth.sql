/*
  # FEGESPORT AI MEDIA ECOSYSTEM V3 — Moteur de croissance

  Évolution incrémentale de V1/V2. Le système devient un outil de développement
  institutionnel : chaque contenu sert un objectif de recrutement/visibilité,
  et 6 nouveaux agents transforment les données média en intelligence de croissance.

  Nouveaux agents :
  - Agent 10 (Community Growth Manager) : growth_insights
  - Agent 11 (Partnership Intelligence) : prospects
  - Agent 12 (Athlete & Club Detector)  : ecosystem_profiles
  - Agent 13 (Sponsorship Content Gen.) : sponsorship_reports
  - Agent 14 (International Relations)  : opportunity_alerts
  - Agent 15 (Reputation Monitor)       : reputation_snapshots

  KPI exécutifs : vue executive_kpi_monthly branchée sur les tables de PROD
  existantes (members, partners, sponsors, newsletter_subscriptions,
  website_analytics) — sans les modifier.
*/

-- ============================================================
-- 1. OBJECTIFS DE CROISSANCE SUR LES CONTENUS
-- ============================================================
-- Chaque événement (et donc ses contenus dérivés) déclare ce qu'il sert :
-- recruit_players | recruit_clubs | recruit_partners | recruit_sponsors |
-- recruit_journalists | recruit_volunteers | grow_newsletter |
-- international_visibility | institutional_credibility
ALTER TABLE media_events ADD COLUMN IF NOT EXISTS growth_objectives jsonb DEFAULT '[]'::jsonb;
ALTER TABLE newsletter_campaigns ADD COLUMN IF NOT EXISTS growth_objectives jsonb DEFAULT '[]'::jsonb;

-- ============================================================
-- 2. AGENT 10 — COMMUNITY GROWTH MANAGER
-- ============================================================
CREATE TABLE IF NOT EXISTS growth_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start date NOT NULL,
  period_end date NOT NULL,
  top_contents jsonb DEFAULT '[]'::jsonb,      -- [{title, channel, metric, value}]
  top_topics jsonb DEFAULT '[]'::jsonb,
  top_hashtags jsonb DEFAULT '[]'::jsonb,
  top_channels jsonb DEFAULT '[]'::jsonb,
  best_times jsonb DEFAULT '[]'::jsonb,        -- créneaux horaires les plus performants
  recommendations jsonb DEFAULT '[]'::jsonb,   -- [{recommendation, rationale, objective}]
  ai_analysis jsonb,
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. AGENT 11 — PARTNERSHIP INTELLIGENCE
-- ============================================================
CREATE TABLE IF NOT EXISTS prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sector text NOT NULL CHECK (sector IN ('gaming', 'telecom', 'bank', 'insurance', 'equipment', 'pc_hardware', 'game_publisher', 'media', 'institution', 'other')),
  country text DEFAULT 'Guinée',
  website text,
  contact_info jsonb DEFAULT '{}'::jsonb,
  contact_reasons jsonb DEFAULT '[]'::jsonb,       -- raisons de contact
  opportunities jsonb DEFAULT '[]'::jsonb,         -- opportunités de partenariat
  compatibility_score integer CHECK (compatibility_score BETWEEN 0 AND 100),
  ai_rationale text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'qualified', 'contacted', 'in_discussion', 'partner', 'declined', 'dormant')),
  origin text NOT NULL DEFAULT 'ai' CHECK (origin IN ('ai', 'manual', 'watch')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, sector)
);

-- ============================================================
-- 4. AGENT 12 — ATHLETE & CLUB DETECTOR
-- ============================================================
CREATE TABLE IF NOT EXISTS ecosystem_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_type text NOT NULL CHECK (profile_type IN ('player', 'club', 'organizer', 'creator')),
  name text NOT NULL,
  aliases jsonb DEFAULT '[]'::jsonb,
  activity_score integer DEFAULT 0,            -- score d'activité cumulé
  mentions_count integer DEFAULT 1,
  first_seen_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now(),
  source_refs jsonb DEFAULT '[]'::jsonb,       -- [{type:'media_event'|'collected_news', id, title}]
  suggested_action text,                       -- suggestion de contact générée par l'IA
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'watch', 'contacted', 'member', 'ignored')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_type, name)
);

-- ============================================================
-- 5. AGENT 13 — SPONSORSHIP CONTENT GENERATOR
-- ============================================================
CREATE TABLE IF NOT EXISTS sponsorship_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_id uuid REFERENCES media_events(id) ON DELETE SET NULL,
  period_start date,
  period_end date,
  audience_metrics jsonb DEFAULT '{}'::jsonb,  -- {articles, social_posts, newsletters, recipients, opens, clicks, news_reach}
  highlights jsonb DEFAULT '[]'::jsonb,        -- records, résultats marquants
  media_value_estimate text,                   -- estimation prudente de la valeur média
  content text NOT NULL,                       -- argumentaire sponsor en markdown
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'sent', 'archived')),
  model text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. AGENT 14 — INTERNATIONAL RELATIONS MONITOR
-- ============================================================
CREATE TABLE IF NOT EXISTS opportunity_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_org text NOT NULL,                    -- IESF | ACES | GEF | WESCO | FIFAe | EWC | autre
  title text NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('call_for_participation', 'grant', 'competition', 'cooperation', 'training', 'other')),
  url text,
  deadline date,
  priority text NOT NULL DEFAULT 'standard' CHECK (priority IN ('urgent', 'priority', 'standard')),
  ai_summary text,
  collected_news_id uuid REFERENCES collected_news(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'applied', 'won', 'missed', 'dismissed')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. AGENT 15 — REPUTATION MONITOR
-- ============================================================
CREATE TABLE IF NOT EXISTS reputation_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  mentions_positive integer DEFAULT 0,
  mentions_negative integer DEFAULT 0,
  mentions_neutral integer DEFAULT 0,
  controversies jsonb DEFAULT '[]'::jsonb,
  communication_opportunities jsonb DEFAULT '[]'::jsonb,
  reputation_score integer CHECK (reputation_score BETWEEN 0 AND 100),
  visibility_score integer CHECK (visibility_score BETWEEN 0 AND 100),
  trust_score integer CHECK (trust_score BETWEEN 0 AND 100),
  ai_analysis jsonb,
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 8. INDEX
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_growth_insights_period ON growth_insights(period_end DESC);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_score ON prospects(compatibility_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_ecosystem_profiles_type ON ecosystem_profiles(profile_type, activity_score DESC);
CREATE INDEX IF NOT EXISTS idx_ecosystem_profiles_status ON ecosystem_profiles(status);
CREATE INDEX IF NOT EXISTS idx_sponsorship_reports_event ON sponsorship_reports(event_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_reports_created_by ON sponsorship_reports(created_by);
CREATE INDEX IF NOT EXISTS idx_opportunity_alerts_status ON opportunity_alerts(status, priority);
CREATE INDEX IF NOT EXISTS idx_opportunity_alerts_deadline ON opportunity_alerts(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_opportunity_alerts_news ON opportunity_alerts(collected_news_id);
CREATE INDEX IF NOT EXISTS idx_reputation_snapshots_date ON reputation_snapshots(snapshot_date DESC);

-- ============================================================
-- 9. TRIGGERS updated_at + RLS
-- ============================================================
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['prospects', 'ecosystem_profiles', 'sponsorship_reports', 'opportunity_alerts']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at_%I ON %I', t, t);
    EXECUTE format('CREATE TRIGGER set_updated_at_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
  END LOOP;
END $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['growth_insights', 'prospects', 'ecosystem_profiles', 'sponsorship_reports',
                           'opportunity_alerts', 'reputation_snapshots']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "admin_all_%s" ON %I', t, t);
    EXECUTE format(
      'CREATE POLICY "admin_all_%s" ON %I FOR ALL TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user())',
      t, t
    );
  END LOOP;
END $$;

-- ============================================================
-- 10. KPI EXÉCUTIFS — vue mensuelle sur les tables de PROD
-- ============================================================
CREATE OR REPLACE VIEW executive_kpi_monthly
WITH (security_invoker = true)
AS
SELECT
  m.month,
  COALESCE(pl.new_players, 0)      AS new_players,
  COALESCE(cl.new_clubs, 0)        AS new_clubs,
  COALESCE(pa.new_partners, 0)     AS new_partners,
  COALESCE(sp.new_sponsors, 0)     AS new_sponsors,
  COALESCE(ns.new_subscribers, 0)  AS new_subscribers,
  COALESCE(ar.articles_published, 0) AS articles_published,
  COALESCE(so.social_posts, 0)     AS social_posts,
  COALESCE(nl.newsletters_sent, 0) AS newsletters_sent,
  COALESCE(nl.opens, 0)            AS newsletter_opens,
  COALESCE(nl.clicks, 0)           AS newsletter_clicks,
  COALESCE(wa.page_views, 0)       AS site_page_views
FROM (
  SELECT generate_series(date_trunc('month', now()) - interval '11 months', date_trunc('month', now()), interval '1 month')::date AS month
) m
LEFT JOIN (
  SELECT date_trunc('month', created_at)::date AS month, count(*) AS new_players
  FROM members WHERE member_type = 'player' GROUP BY 1
) pl ON pl.month = m.month
LEFT JOIN (
  SELECT date_trunc('month', created_at)::date AS month, count(*) AS new_clubs
  FROM members WHERE member_type = 'club' GROUP BY 1
) cl ON cl.month = m.month
LEFT JOIN (
  SELECT date_trunc('month', created_at)::date AS month, count(*) AS new_partners
  FROM partners GROUP BY 1
) pa ON pa.month = m.month
LEFT JOIN (
  SELECT date_trunc('month', created_at)::date AS month, count(*) AS new_sponsors
  FROM sponsors GROUP BY 1
) sp ON sp.month = m.month
LEFT JOIN (
  SELECT date_trunc('month', created_at)::date AS month, count(*) AS new_subscribers
  FROM newsletter_subscriptions GROUP BY 1
) ns ON ns.month = m.month
LEFT JOIN (
  SELECT date_trunc('month', published_at)::date AS month, count(*) AS articles_published
  FROM generated_articles WHERE status = 'published' GROUP BY 1
) ar ON ar.month = m.month
LEFT JOIN (
  SELECT date_trunc('month', published_at)::date AS month, count(*) AS social_posts
  FROM social_posts WHERE status IN ('ready', 'published') GROUP BY 1
) so ON so.month = m.month
LEFT JOIN (
  SELECT date_trunc('month', sent_at)::date AS month, count(*) AS newsletters_sent,
         sum(opens_count) AS opens, sum(clicks_count) AS clicks
  FROM newsletter_campaigns WHERE status = 'sent' GROUP BY 1
) nl ON nl.month = m.month
LEFT JOIN (
  SELECT date_trunc('month', created_at)::date AS month, count(*) AS page_views
  FROM website_analytics GROUP BY 1
) wa ON wa.month = m.month;

REVOKE ALL ON executive_kpi_monthly FROM anon;
GRANT SELECT ON executive_kpi_monthly TO authenticated;

-- ============================================================
-- 11. AGENT 14 — source institutionnelle supplémentaire (WESCO)
-- ============================================================
INSERT INTO news_sources (name, organization, website_url, feed_url, source_type, topics)
SELECT 'WESCO — World Esports Consortium', 'WESCO', 'https://wesco.gg', NULL, 'html',
       '["annonces","partenariats","règlements"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM news_sources WHERE organization = 'WESCO');
