/*
  # Création de la table des tournois eLeague

  1. Nouvelle Table
    - `leg_tournaments`
      - `id` (uuid, clé primaire)
      - `title` (text, titre du tournoi)
      - `discipline_id` (uuid, référence vers leg_disciplines)
      - `description` (text, description du tournoi)
      - `start_date` (date, date de début)
      - `end_date` (date, date de fin)
      - `prize_pool` (numeric, dotation)
      - `format` (text, format du tournoi)
      - `max_teams` (integer, nombre maximum d'équipes)
      - `status` (text, statut: upcoming/ongoing/completed/cancelled)
      - `is_active` (boolean, actif ou non)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `translations` (jsonb, traductions)

  2. Sécurité
    - Activation de RLS sur la table
    - Politique de lecture publique pour les tournois actifs
    - Politique d'écriture pour les administrateurs uniquement
*/

-- Créer la table leg_tournaments si elle n'existe pas
CREATE TABLE IF NOT EXISTS leg_tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  discipline_id uuid REFERENCES leg_disciplines(id) ON DELETE CASCADE,
  description text,
  start_date date NOT NULL,
  end_date date,
  prize_pool numeric(10, 2),
  format text NOT NULL DEFAULT 'Single Elimination',
  max_teams integer NOT NULL DEFAULT 8,
  status text NOT NULL DEFAULT 'upcoming',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  translations jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT valid_status CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled'))
);

-- Activer RLS
ALTER TABLE leg_tournaments ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique (seulement les tournois actifs et non annulés)
CREATE POLICY "Public can view active tournaments"
  ON leg_tournaments
  FOR SELECT
  TO public
  USING (is_active = true AND status != 'cancelled');

-- Politique de lecture admin (tous les tournois)
CREATE POLICY "Admins can view all tournaments"
  ON leg_tournaments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'contact@fegesport224.org'
    )
  );

-- Politique d'insertion admin
CREATE POLICY "Admins can insert tournaments"
  ON leg_tournaments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'contact@fegesport224.org'
    )
  );

-- Politique de mise à jour admin
CREATE POLICY "Admins can update tournaments"
  ON leg_tournaments
  FOR UPDATE
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

-- Créer un index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_leg_tournaments_discipline ON leg_tournaments(discipline_id);
CREATE INDEX IF NOT EXISTS idx_leg_tournaments_status ON leg_tournaments(status);
CREATE INDEX IF NOT EXISTS idx_leg_tournaments_active ON leg_tournaments(is_active);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_leg_tournaments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_leg_tournaments_updated_at ON leg_tournaments;
CREATE TRIGGER update_leg_tournaments_updated_at
  BEFORE UPDATE ON leg_tournaments
  FOR EACH ROW
  EXECUTE FUNCTION update_leg_tournaments_updated_at();