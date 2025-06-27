/*
  # Création et configuration de la table membership_types
  
  1. Nouvelles Tables
    - `membership_types` - Types d'adhésion disponibles
      - `id` (uuid, primary key)
      - `name` (text, non null)
      - `description` (text)
      - `price` (numeric(10,2), non null)
      - `period` (text)
      - `features` (text[], non null)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Sécurité
    - Enable RLS sur la table `membership_types`
    - Politiques pour l'accès en lecture pour tous les utilisateurs
    - Politiques pour l'accès complet pour les administrateurs
  
  3. Données
    - Insertion des types d'adhésion par défaut
*/

-- Create membership_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS membership_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  period text,
  features text[] NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_membership_types_active ON membership_types(is_active);

-- Enable RLS
ALTER TABLE membership_types ENABLE ROW LEVEL SECURITY;

-- Membership types policies - create only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'membership_types' AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON membership_types
      FOR SELECT USING ((is_active = true) OR (auth.role() = 'authenticated'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'membership_types' AND policyname = 'Admin has full access to membership_types'
  ) THEN
    CREATE POLICY "Admin has full access to membership_types" ON membership_types
      FOR ALL USING (is_admin());
  END IF;
END $$;

-- Create trigger to update updated_at timestamp - only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_membership_types_updated_at'
  ) THEN
    CREATE TRIGGER update_membership_types_updated_at BEFORE UPDATE ON membership_types
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert default membership types if they don't exist
INSERT INTO membership_types (name, description, price, period, features, is_active) 
SELECT 
  'Joueur Individuel',
  'Adhésion pour les joueurs individuels',
  15000,
  'par an',
  ARRAY[
    'Licence officielle de joueur',
    'Participation aux tournois officiels',
    'Accès aux formations',
    'Newsletter exclusive',
    'Badge digital officiel'
  ],
  true
WHERE NOT EXISTS (
  SELECT 1 FROM membership_types WHERE name = 'Joueur Individuel'
);

INSERT INTO membership_types (name, description, price, period, features, is_active) 
SELECT 
  'Club Esport',
  'Adhésion pour les clubs esport',
  150000,
  'par an',
  ARRAY[
    'Statut de club officiel',
    'Jusqu''à 10 licences joueurs',
    'Organisation de tournois',
    'Support marketing',
    'Visibilité sur le site FEGESPORT'
  ],
  true
WHERE NOT EXISTS (
  SELECT 1 FROM membership_types WHERE name = 'Club Esport'
);

INSERT INTO membership_types (name, description, price, period, features, is_active) 
SELECT 
  'Partenaire',
  'Adhésion pour les partenaires',
  0,
  'sur mesure',
  ARRAY[
    'Statut de partenaire officiel',
    'Logo sur le site et événements',
    'Accès VIP aux événements',
    'Communication dédiée',
    'Programme personnalisé'
  ],
  true
WHERE NOT EXISTS (
  SELECT 1 FROM membership_types WHERE name = 'Partenaire'
);