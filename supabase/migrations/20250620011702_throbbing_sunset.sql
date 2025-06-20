/*
  # Membership Types Management

  1. New Tables
    - `membership_types`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the membership type
      - `description` (text) - Description of the membership
      - `price` (numeric) - Price in FCFA
      - `period` (text) - Period description (par an, par mois, etc.)
      - `features` (text[]) - Array of features included
      - `is_active` (boolean) - Whether the membership type is active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on membership_types table
    - Add policies for public read access and admin management
    - Add trigger for updated_at timestamp

  3. Default Data
    - Insert default membership types (Player, Club, Partner)
*/

-- Create membership_types table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_membership_types_active ON membership_types(is_active);

-- Enable RLS
ALTER TABLE membership_types ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Enable read access for all users" ON membership_types;
  DROP POLICY IF EXISTS "Admin has full access to membership_types" ON membership_types;
EXCEPTION
  WHEN undefined_object THEN
    NULL; -- Policy doesn't exist, continue
END $$;

-- Membership types policies
CREATE POLICY "Enable read access for all users" ON membership_types
  FOR SELECT USING ((is_active = true) OR (auth.role() = 'authenticated'));

CREATE POLICY "Admin has full access to membership_types" ON membership_types
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- Create trigger to update updated_at timestamp (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_membership_types_updated_at'
  ) THEN
    CREATE TRIGGER update_membership_types_updated_at BEFORE UPDATE ON membership_types
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert default membership types (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM membership_types LIMIT 1) THEN
    INSERT INTO membership_types (name, description, price, period, features, is_active) VALUES
      (
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
      ),
      (
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
      ),
      (
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
      );
  END IF;
END $$;