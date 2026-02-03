/*
  # Création des tables eLeague (LEG)

  1. Nouvelles Tables
    - `leg_disciplines`
      - `id` (uuid, clé primaire)
      - `name` (text) - Nom de la discipline
      - `games` (text[]) - Liste des jeux
      - `icon` (text) - Icône emoji
      - `color` (text) - Couleur de la discipline
      - `is_active` (boolean) - Discipline active ou non
      - `sort_order` (integer) - Ordre d'affichage
      - `translations` (jsonb) - Support multilingue
      - `created_at`, `updated_at` (timestamptz)

    - `leg_clubs`
      - `id` (uuid, clé primaire)
      - `name` (text) - Nom du club
      - `city` (text) - Ville du club
      - `region` (text) - Région
      - `leader_name` (text) - Nom du représentant
      - `leader_title` (text) - Titre du représentant
      - `leader_photo` (text) - URL photo du représentant
      - `leader_quote` (text) - Citation du représentant
      - `latitude` (numeric) - Coordonnées GPS
      - `longitude` (numeric) - Coordonnées GPS
      - `color` (text) - Couleur du club
      - `logo` (text) - URL du logo
      - `trophies` (integer) - Nombre de trophées
      - `stream_viewers` (integer) - Viewers moyens
      - `win_rate` (numeric) - Taux de victoire global
      - `rank` (integer) - Classement global
      - `discord_url` (text) - Lien Discord
      - `twitch_url` (text) - Lien Twitch
      - `twitter_url` (text) - Lien Twitter
      - `is_active` (boolean) - Club actif ou non
      - `translations` (jsonb) - Support multilingue
      - `created_at`, `updated_at` (timestamptz)

    - `leg_club_disciplines`
      - `id` (uuid, clé primaire)
      - `club_id` (uuid, référence vers leg_clubs)
      - `discipline_id` (uuid, référence vers leg_disciplines)
      - `roster` (text[]) - Liste des joueurs
      - `achievements` (text[]) - Liste des accomplissements
      - `stats` (jsonb) - Statistiques spécifiques (winRate, matches, kd, etc.)
      - `created_at`, `updated_at` (timestamptz)

  2. Sécurité
    - Activer RLS sur toutes les tables
    - Lecture publique pour tous
    - Modifications réservées aux admins authentifiés
*/

-- Création de la table des disciplines
CREATE TABLE IF NOT EXISTS leg_disciplines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  games text[] NOT NULL DEFAULT '{}',
  icon text,
  color text DEFAULT '#6B7280',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  translations jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Création de la table des clubs
CREATE TABLE IF NOT EXISTS leg_clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  region text NOT NULL,
  leader_name text NOT NULL,
  leader_title text,
  leader_photo text,
  leader_quote text,
  latitude numeric,
  longitude numeric,
  color text DEFAULT '#6B7280',
  logo text,
  trophies integer DEFAULT 0,
  stream_viewers integer DEFAULT 0,
  win_rate numeric DEFAULT 0,
  rank integer DEFAULT 0,
  discord_url text,
  twitch_url text,
  twitter_url text,
  is_active boolean DEFAULT true,
  translations jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Création de la table des disciplines par club
CREATE TABLE IF NOT EXISTS leg_club_disciplines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES leg_clubs(id) ON DELETE CASCADE,
  discipline_id uuid NOT NULL REFERENCES leg_disciplines(id) ON DELETE CASCADE,
  roster text[] DEFAULT '{}',
  achievements text[] DEFAULT '{}',
  stats jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(club_id, discipline_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_leg_disciplines_active ON leg_disciplines(is_active);
CREATE INDEX IF NOT EXISTS idx_leg_clubs_active ON leg_clubs(is_active);
CREATE INDEX IF NOT EXISTS idx_leg_clubs_rank ON leg_clubs(rank);
CREATE INDEX IF NOT EXISTS idx_leg_club_disciplines_club ON leg_club_disciplines(club_id);
CREATE INDEX IF NOT EXISTS idx_leg_club_disciplines_discipline ON leg_club_disciplines(discipline_id);

-- Activer RLS
ALTER TABLE leg_disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE leg_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leg_club_disciplines ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour leg_disciplines
CREATE POLICY "Lecture publique des disciplines"
  ON leg_disciplines FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins peuvent insérer des disciplines"
  ON leg_disciplines FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'contact@fegesport.org'
      )
    )
  );

CREATE POLICY "Admins peuvent modifier des disciplines"
  ON leg_disciplines FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'contact@fegesport.org'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'contact@fegesport.org'
      )
    )
  );

CREATE POLICY "Admins peuvent supprimer des disciplines"
  ON leg_disciplines FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'contact@fegesport.org'
      )
    )
  );

-- Politiques RLS pour leg_clubs
CREATE POLICY "Lecture publique des clubs"
  ON leg_clubs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins peuvent insérer des clubs"
  ON leg_clubs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'contact@fegesport.org'
      )
    )
  );

CREATE POLICY "Admins peuvent modifier des clubs"
  ON leg_clubs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'contact@fegesport.org'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'contact@fegesport.org'
      )
    )
  );

CREATE POLICY "Admins peuvent supprimer des clubs"
  ON leg_clubs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'contact@fegesport.org'
      )
    )
  );

-- Politiques RLS pour leg_club_disciplines
CREATE POLICY "Lecture publique des disciplines de club"
  ON leg_club_disciplines FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins peuvent insérer des disciplines de club"
  ON leg_club_disciplines FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'contact@fegesport.org'
      )
    )
  );

CREATE POLICY "Admins peuvent modifier des disciplines de club"
  ON leg_club_disciplines FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'contact@fegesport.org'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'contact@fegesport.org'
      )
    )
  );

CREATE POLICY "Admins peuvent supprimer des disciplines de club"
  ON leg_club_disciplines FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'contact@fegesport.org'
      )
    )
  );