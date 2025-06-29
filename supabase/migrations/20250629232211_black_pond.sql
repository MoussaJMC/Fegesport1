/*
  # Create cards table

  1. New Tables
    - `cards`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `content` (text, not null)
      - `image_url` (text, nullable)
      - `category` (text, not null, with check constraint)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `cards` table
    - Add policy for admin full access
    - Add policy for public read access to active cards
*/

-- Create cards table if it doesn't exist
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('communiqué', 'compétition', 'partenariat')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cards_category ON cards(category);
CREATE INDEX IF NOT EXISTS idx_cards_active ON cards(is_active);

-- Enable RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Admin has full access to cards' 
    AND polrelid = 'cards'::regclass
  ) THEN
    CREATE POLICY "Admin has full access to cards" ON cards
      FOR ALL USING (is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Enable read access for all users' 
    AND polrelid = 'cards'::regclass
  ) THEN
    CREATE POLICY "Enable read access for all users" ON cards
      FOR SELECT USING ((is_active = true) OR (auth.role() = 'authenticated'));
  END IF;
END
$$;

-- Create trigger to update updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_cards_updated_at' 
    AND tgrelid = 'cards'::regclass
  ) THEN
    CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Insert sample data if table is empty
INSERT INTO cards (title, content, image_url, category, is_active)
SELECT 
  'Lancement officiel de la FEGESPORT',
  'La Fédération Guinéenne d''Esport (FEGESPORT) a été officiellement lancée lors d''une cérémonie à Conakry en présence de représentants du Ministère des Sports, de clubs esport et de partenaires.',
  'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
  'communiqué',
  true
WHERE NOT EXISTS (SELECT 1 FROM cards LIMIT 1);

INSERT INTO cards (title, content, image_url, category, is_active)
SELECT 
  'Premier tournoi national FIFA 25',
  'La FEGESPORT organise son premier tournoi national FIFA 25 avec la participation de 64 joueurs de toute la Guinée. L''événement se déroulera à Conakry du 20 au 22 février.',
  'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
  'compétition',
  true
WHERE NOT EXISTS (SELECT 1 FROM cards LIMIT 1);

INSERT INTO cards (title, content, image_url, category, is_active)
SELECT 
  'Partenariat avec le Ministère de la Jeunesse et des Sports',
  'La FEGESPORT a signé une convention de partenariat avec le Ministère de la Jeunesse et des Sports pour développer l''esport en Guinée.',
  'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg',
  'partenariat',
  true
WHERE NOT EXISTS (SELECT 1 FROM cards LIMIT 1);