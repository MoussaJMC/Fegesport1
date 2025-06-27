/*
  # Création de la table des cartes

  1. Nouvelle Table
    - `cards`
      - `id` (uuid, primary key)
      - `title` (text, non null)
      - `content` (text, non null)
      - `image_url` (text, nullable)
      - `category` (text, non null, avec contrainte de vérification)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Sécurité
    - Enable RLS sur la table `cards`
    - Ajout de politiques pour les utilisateurs authentifiés et administrateurs
*/

-- Création de la table cards
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('communiqué', 'compétition', 'partenariat')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Création des index
CREATE INDEX IF NOT EXISTS idx_cards_category ON cards(category);
CREATE INDEX IF NOT EXISTS idx_cards_active ON cards(is_active);

-- Activation de RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cards' AND policyname = 'Admin has full access to cards'
  ) THEN
    CREATE POLICY "Admin has full access to cards" ON cards
      FOR ALL USING (is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cards' AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON cards
      FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
  END IF;
END $$;

-- Trigger pour mettre à jour le timestamp updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_cards_updated_at'
  ) THEN
    CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insertion de données d'exemple
INSERT INTO cards (title, content, image_url, category, is_active) 
SELECT 
  'Lancement officiel de la FEGESPORT',
  'La Fédération Guinéenne d''Esport (FEGESPORT) a été officiellement lancée lors d''une cérémonie à Conakry en présence de représentants du Ministère des Sports, de clubs esport et de partenaires.',
  'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
  'communiqué',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM cards WHERE title = 'Lancement officiel de la FEGESPORT'
);

INSERT INTO cards (title, content, image_url, category, is_active) 
SELECT 
  'Premier tournoi national FIFA 25',
  'La FEGESPORT organise son premier tournoi national FIFA 25 avec la participation de 64 joueurs de toute la Guinée. L''événement se déroulera à Conakry du 20 au 22 février.',
  'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
  'compétition',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM cards WHERE title = 'Premier tournoi national FIFA 25'
);

INSERT INTO cards (title, content, image_url, category, is_active) 
SELECT 
  'Partenariat avec le Ministère de la Jeunesse et des Sports',
  'La FEGESPORT a signé une convention de partenariat avec le Ministère de la Jeunesse et des Sports pour développer l''esport en Guinée.',
  'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg',
  'partenariat',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM cards WHERE title = 'Partenariat avec le Ministère de la Jeunesse et des Sports'
);