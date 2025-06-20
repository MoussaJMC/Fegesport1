/*
  # Membership Types Management

  1. New Tables
    - `membership_types` - Stores different membership types with their details and features
  
  2. Security
    - Enable RLS on the table
    - Add policies for admin access and public read access
    - Ensure proper access control
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

-- Membership types policies
CREATE POLICY "Enable read access for all users" ON membership_types
  FOR SELECT USING ((is_active = true) OR (auth.role() = 'authenticated'));

CREATE POLICY "Admin has full access to membership_types" ON membership_types
  FOR ALL USING (is_admin());

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_membership_types_updated_at BEFORE UPDATE ON membership_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default membership types
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
  )
ON CONFLICT (id) DO NOTHING;