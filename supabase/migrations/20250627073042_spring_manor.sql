/*
  # Add file categories

  1. New Table
    - Ensures file_categories table exists with proper structure
    - Adds default categories for file organization
  
  2. Security
    - Enables RLS on the table
    - Adds appropriate policies
*/

-- Create file_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS file_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  color text DEFAULT '#6B7280',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE file_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'file_categories' AND policyname = 'Admin has full access to file_categories'
  ) THEN
    CREATE POLICY "Admin has full access to file_categories" ON file_categories
      FOR ALL USING (is_admin());
  END IF;
END $$;

-- Create trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_file_categories_updated_at'
  ) THEN
    CREATE TRIGGER update_file_categories_updated_at BEFORE UPDATE ON file_categories
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert default categories if they don't exist
INSERT INTO file_categories (name, description, icon, color) 
SELECT 'Documents', 'PDF, Word, Excel et autres documents', 'FileText', '#3B82F6'
WHERE NOT EXISTS (SELECT 1 FROM file_categories WHERE name = 'Documents');

INSERT INTO file_categories (name, description, icon, color) 
SELECT 'Images', 'Photos, logos et autres images', 'Image', '#10B981'
WHERE NOT EXISTS (SELECT 1 FROM file_categories WHERE name = 'Images');

INSERT INTO file_categories (name, description, icon, color) 
SELECT 'Vidéos', 'Clips vidéo et enregistrements', 'Video', '#F59E0B'
WHERE NOT EXISTS (SELECT 1 FROM file_categories WHERE name = 'Vidéos');

INSERT INTO file_categories (name, description, icon, color) 
SELECT 'Audio', 'Fichiers audio et musique', 'Music', '#8B5CF6'
WHERE NOT EXISTS (SELECT 1 FROM file_categories WHERE name = 'Audio');

INSERT INTO file_categories (name, description, icon, color) 
SELECT 'Logos', 'Logos officiels et branding', 'Layout', '#EC4899'
WHERE NOT EXISTS (SELECT 1 FROM file_categories WHERE name = 'Logos');

INSERT INTO file_categories (name, description, icon, color) 
SELECT 'Formulaires', 'Formulaires administratifs', 'FileText', '#6366F1'
WHERE NOT EXISTS (SELECT 1 FROM file_categories WHERE name = 'Formulaires');

INSERT INTO file_categories (name, description, icon, color) 
SELECT 'Ressources', 'Ressources éducatives et guides', 'Book', '#EF4444'
WHERE NOT EXISTS (SELECT 1 FROM file_categories WHERE name = 'Ressources');

INSERT INTO file_categories (name, description, icon, color) 
SELECT 'Archives', 'Fichiers archivés', 'Archive', '#6B7280'
WHERE NOT EXISTS (SELECT 1 FROM file_categories WHERE name = 'Archives');