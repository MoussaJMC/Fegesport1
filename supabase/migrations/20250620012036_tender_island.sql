/*
  # Leadership Team Management

  1. New Tables
    - `leadership_team` - Stores information about leadership team members
      - `id` (uuid, primary key)
      - `name` (text) - Full name of the team member
      - `position` (text) - Position/role in the organization
      - `bio` (text) - Short biography
      - `image_url` (text) - Profile image URL
      - `order` (integer) - Display order
      - `is_active` (boolean) - Whether to display the team member
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on the table
    - Add policies for admin access and public read access
*/

-- Check if the table already exists before creating it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'leadership_team') THEN
    -- Create leadership_team table
    CREATE TABLE leadership_team (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      position text NOT NULL,
      bio text,
      image_url text,
      "order" integer DEFAULT 0,
      is_active boolean DEFAULT true,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Create indexes
    CREATE INDEX idx_leadership_team_active ON leadership_team(is_active);
    CREATE INDEX idx_leadership_team_order ON leadership_team("order");

    -- Enable RLS
    ALTER TABLE leadership_team ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Enable read access for all users" ON leadership_team;
  DROP POLICY IF EXISTS "Admin has full access to leadership_team" ON leadership_team;
EXCEPTION
  WHEN undefined_object THEN
    NULL; -- Policy doesn't exist, continue
END $$;

-- Create policies
CREATE POLICY "Enable read access for all users" ON leadership_team
  FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admin has full access to leadership_team" ON leadership_team
  FOR ALL USING (is_admin());

-- Create trigger to update updated_at timestamp if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_leadership_team_updated_at'
  ) THEN
    CREATE TRIGGER update_leadership_team_updated_at 
    BEFORE UPDATE ON leadership_team
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert default leadership team members if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM leadership_team LIMIT 1) THEN
    INSERT INTO leadership_team (name, position, bio, image_url, "order", is_active) VALUES
      (
        'Mamadou Diallo',
        'Président',
        'Entrepreneur visionnaire et passionné d''esport, Mamadou dirige la FEGESPORT avec l''ambition de faire de la Guinée une référence de l''esport en Afrique.',
        'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
        1,
        true
      ),
      (
        'Aïssata Camara',
        'Secrétaire Générale',
        'Forte d''une expérience de 15 ans dans l''administration sportive, Aïssata coordonne l''ensemble des activités de la fédération.',
        'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg',
        2,
        true
      ),
      (
        'Ibrahima Sow',
        'Directeur Technique',
        'Ancien joueur professionnel et expert technique, Ibrahima supervise tous les aspects compétitifs et la formation des arbitres.',
        'https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg',
        3,
        true
      ),
      (
        'Fatoumata Barry',
        'Directrice Marketing',
        'Spécialiste en marketing digital, Fatoumata développe la stratégie de communication et les partenariats de la FEGESPORT.',
        'https://images.pexels.com/photos/2381469/pexels-photo-2381469.jpeg',
        4,
        true
      ),
      (
        'Sékou Condé',
        'Directeur des Compétitions',
        'Expert en organisation d''événements esport, Sékou coordonne l''ensemble des compétitions nationales et internationales.',
        'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
        5,
        true
      ),
      (
        'Mariama Touré',
        'Directrice du Développement',
        'Chargée du développement des programmes jeunesse et de l''expansion de l''esport dans toutes les régions de Guinée.',
        'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg',
        6,
        true
      );
  END IF;
END $$;