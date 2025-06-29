/*
  # File Categories and Storage Setup
  
  1. New Tables
    - `file_categories` - Categories for organizing uploaded files
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `icon` (text)
      - `color` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `file_categories` table
    - Add admin access policy
  
  3. Default Data
    - Insert default file categories
*/

-- Create file_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS file_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  color text DEFAULT '#6B7280'::text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_file_categories_name ON file_categories(name);

-- Enable RLS
ALTER TABLE file_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Admin has full access to file_categories' 
    AND polrelid = 'file_categories'::regclass
  ) THEN
    CREATE POLICY "Admin has full access to file_categories" ON file_categories
      FOR ALL USING (is_admin());
  END IF;
END
$$;

-- Create trigger to update updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_file_categories_updated_at' 
    AND tgrelid = 'file_categories'::regclass
  ) THEN
    CREATE TRIGGER update_file_categories_updated_at BEFORE UPDATE ON file_categories
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Insert default file categories
INSERT INTO file_categories (name, description, icon, color) VALUES
  ('Documents', 'PDF, Word, Excel et autres documents', 'FileText', '#3B82F6'),
  ('Images', 'Photos, logos et autres images', 'Image', '#10B981'),
  ('Vidéos', 'Clips vidéo et enregistrements', 'Video', '#F59E0B'),
  ('Audio', 'Fichiers audio et musique', 'Music', '#8B5CF6'),
  ('Logos', 'Logos officiels et branding', 'Layout', '#EC4899'),
  ('Formulaires', 'Formulaires administratifs', 'FileText', '#6366F1'),
  ('Ressources', 'Ressources éducatives et guides', 'Book', '#EF4444'),
  ('Archives', 'Fichiers archivés', 'Archive', '#6B7280')
ON CONFLICT (name) DO NOTHING;