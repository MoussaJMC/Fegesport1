/*
  # Membership Types Table

  1. Changes
    - Creates membership_types table if it doesn't exist
    - Adds necessary indexes and RLS policies
    - Inserts default membership types
    
  2. Security
    - Enables RLS on the table
    - Creates policies for public and admin access
*/

-- Check if the table already exists before creating it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'membership_types') THEN
    -- Create membership_types table
    CREATE TABLE membership_types (
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
    CREATE INDEX idx_membership_types_active ON membership_types(is_active);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE membership_types ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Enable read access for all users" ON membership_types;
  DROP POLICY IF EXISTS "Admin has full access to membership_types" ON membership_types;
EXCEPTION
  WHEN undefined_object THEN
    NULL; -- Policy doesn't exist, continue
END $$;

-- Create new policies
CREATE POLICY "Read access for membership types" ON membership_types
  FOR SELECT USING ((is_active = true) OR (auth.role() = 'authenticated'));

CREATE POLICY "Admin full access to membership types" ON membership_types
  FOR ALL USING (is_admin());

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