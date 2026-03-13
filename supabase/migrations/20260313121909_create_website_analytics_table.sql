/*
  # Création de la table des statistiques de trafic web

  ## Nouvelle Table
    - `website_analytics`
      - `id` (uuid, primary key)
      - `year` (integer) - Année des statistiques
      - `month` (integer) - Mois (1-12)
      - `unique_visitors` (integer) - Nombre de visiteurs uniques
      - `total_visits` (integer) - Nombre total de visites
      - `page_views` (integer, nullable) - Nombre de pages vues
      - `bounce_rate` (numeric, nullable) - Taux de rebond (%)
      - `avg_session_duration` (integer, nullable) - Durée moyenne de session (secondes)
      - `notes` (text, nullable) - Notes ou commentaires
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  ## Sécurité
    - Enable RLS sur `website_analytics`
    - Seuls les admins peuvent lire/écrire les statistiques
    - Public ne peut pas accéder aux statistiques

  ## Index
    - Index unique sur (year, month) pour éviter les doublons
    - Index sur year pour les requêtes par année
*/

-- Créer la table website_analytics
CREATE TABLE IF NOT EXISTS website_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL CHECK (year >= 2000 AND year <= 2100),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  unique_visitors integer NOT NULL DEFAULT 0 CHECK (unique_visitors >= 0),
  total_visits integer NOT NULL DEFAULT 0 CHECK (total_visits >= 0),
  page_views integer CHECK (page_views >= 0),
  bounce_rate numeric(5,2) CHECK (bounce_rate >= 0 AND bounce_rate <= 100),
  avg_session_duration integer CHECK (avg_session_duration >= 0),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index unique pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS idx_website_analytics_year_month 
  ON website_analytics(year, month);

-- Index pour requêtes par année
CREATE INDEX IF NOT EXISTS idx_website_analytics_year 
  ON website_analytics(year);

-- Commentaires
COMMENT ON TABLE website_analytics IS 
  'Statistiques de trafic web mensuelles - Accessible uniquement aux admins';
COMMENT ON COLUMN website_analytics.unique_visitors IS 
  'Nombre de visiteurs uniques pour le mois';
COMMENT ON COLUMN website_analytics.total_visits IS 
  'Nombre total de visites (sessions) pour le mois';
COMMENT ON COLUMN website_analytics.page_views IS 
  'Nombre total de pages vues pour le mois';
COMMENT ON COLUMN website_analytics.bounce_rate IS 
  'Taux de rebond en pourcentage (0-100)';
COMMENT ON COLUMN website_analytics.avg_session_duration IS 
  'Durée moyenne de session en secondes';

-- Enable RLS
ALTER TABLE website_analytics ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins (toutes opérations)
CREATE POLICY "website_analytics_admin_all"
  ON website_analytics
  FOR ALL
  TO authenticated
  USING ((select is_admin()))
  WITH CHECK ((select is_admin()));

-- Pas d'accès public aux statistiques
-- Les utilisateurs non-admin ne peuvent rien faire

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_website_analytics_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_website_analytics_updated_at_trigger
  BEFORE UPDATE ON website_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_website_analytics_updated_at();

-- Insérer quelques données d'exemple pour 2024 et 2025
INSERT INTO website_analytics (year, month, unique_visitors, total_visits, page_views, notes)
VALUES
  (2024, 1, 0, 0, 0, 'À remplir avec les données réelles'),
  (2024, 2, 0, 0, 0, 'À remplir avec les données réelles'),
  (2024, 3, 0, 0, 0, 'À remplir avec les données réelles'),
  (2024, 4, 0, 0, 0, 'À remplir avec les données réelles'),
  (2024, 5, 0, 0, 0, 'À remplir avec les données réelles'),
  (2024, 6, 0, 0, 0, 'À remplir avec les données réelles'),
  (2024, 7, 0, 0, 0, 'À remplir avec les données réelles'),
  (2024, 8, 0, 0, 0, 'À remplir avec les données réelles'),
  (2024, 9, 0, 0, 0, 'À remplir avec les données réelles'),
  (2024, 10, 0, 0, 0, 'À remplir avec les données réelles'),
  (2024, 11, 0, 0, 0, 'À remplir avec les données réelles'),
  (2024, 12, 0, 0, 0, 'À remplir avec les données réelles'),
  (2025, 1, 0, 0, 0, 'À remplir avec les données réelles'),
  (2025, 2, 0, 0, 0, 'À remplir avec les données réelles'),
  (2025, 3, 0, 0, 0, 'À remplir avec les données réelles'),
  (2025, 4, 0, 0, 0, 'À remplir avec les données réelles'),
  (2025, 5, 0, 0, 0, 'À remplir avec les données réelles'),
  (2025, 6, 0, 0, 0, 'À remplir avec les données réelles'),
  (2025, 7, 0, 0, 0, 'À remplir avec les données réelles'),
  (2025, 8, 0, 0, 0, 'À remplir avec les données réelles'),
  (2025, 9, 0, 0, 0, 'À remplir avec les données réelles'),
  (2025, 10, 0, 0, 0, 'À remplir avec les données réelles'),
  (2025, 11, 0, 0, 0, 'À remplir avec les données réelles'),
  (2025, 12, 0, 0, 0, 'À remplir avec les données réelles')
ON CONFLICT (year, month) DO NOTHING;
