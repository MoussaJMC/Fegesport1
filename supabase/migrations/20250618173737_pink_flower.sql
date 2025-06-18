/*
  # Pages Content Management System

  1. New Tables
    - `pages`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL identifier for the page
      - `title` (text) - Page title
      - `meta_description` (text) - SEO meta description
      - `status` (text) - draft, published, archived
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `page_sections`
      - `id` (uuid, primary key)
      - `page_id` (uuid, foreign key)
      - `section_key` (text) - unique identifier for the section
      - `section_type` (text) - text, image, hero, gallery, etc.
      - `title` (text) - section title
      - `content` (text) - main content/text
      - `image_url` (text) - image URL
      - `settings` (jsonb) - additional settings like colors, layout, etc.
      - `sort_order` (integer) - order of sections
      - `is_active` (boolean) - whether section is visible
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for admin access and public read access
*/

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  meta_description text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create page_sections table
CREATE TABLE IF NOT EXISTS page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES pages(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  section_type text NOT NULL CHECK (section_type IN ('hero', 'text', 'image', 'gallery', 'stats', 'features', 'testimonials', 'cta')),
  title text,
  content text,
  image_url text,
  settings jsonb DEFAULT '{}',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page_id, section_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_page_sections_page_id ON page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_sort_order ON page_sections(page_id, sort_order);

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

-- Pages policies
CREATE POLICY "Enable read access for published pages" ON pages
  FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "Admin has full access to pages" ON pages
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- Page sections policies
CREATE POLICY "Enable read access for active sections of published pages" ON page_sections
  FOR SELECT USING (
    is_active = true AND 
    EXISTS (
      SELECT 1 FROM pages 
      WHERE pages.id = page_sections.page_id 
      AND (pages.status = 'published' OR auth.role() = 'authenticated')
    )
  );

CREATE POLICY "Admin has full access to page sections" ON page_sections
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- Insert default pages
INSERT INTO pages (slug, title, meta_description, status) VALUES
  ('home', 'Accueil', 'Page d''accueil de la FEGESPORT - Fédération Guinéenne d''Esport', 'published'),
  ('about', 'À Propos', 'Découvrez la FEGESPORT, ses missions et son équipe', 'published'),
  ('contact', 'Contact', 'Contactez la FEGESPORT pour toute question ou demande', 'published')
ON CONFLICT (slug) DO NOTHING;

-- Insert default sections for home page
DO $$
DECLARE
  home_page_id uuid;
BEGIN
  SELECT id INTO home_page_id FROM pages WHERE slug = 'home';
  
  IF home_page_id IS NOT NULL THEN
    INSERT INTO page_sections (page_id, section_key, section_type, title, content, settings, sort_order) VALUES
      (home_page_id, 'hero', 'hero', 'FÉDÉRATION GUINÉENNE D''ESPORT', 'Promouvoir et développer l''esport en Guinée', '{"background_image": "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg", "cta_text": "Rejoignez-nous", "cta_link": "/membership"}', 1),
      (home_page_id, 'about', 'text', 'À PROPOS DE LA FEGESPORT', 'La Fédération Guinéenne d''Esport (FEGESPORT) est l''organisation nationale officielle pour l''esport en Guinée. Notre mission est de promouvoir, structurer et représenter l''esport guinéen au niveau national et international.', '{}', 2),
      (home_page_id, 'stats', 'stats', 'Nos Chiffres', '', '{"stats": [{"label": "Joueurs Inscrits", "value": "200+", "icon": "users"}, {"label": "Clubs Officiels", "value": "15", "icon": "building"}, {"label": "Partenaires", "value": "8", "icon": "star"}]}', 3)
    ON CONFLICT (page_id, section_key) DO NOTHING;
  END IF;
END $$;

-- Insert default sections for about page
DO $$
DECLARE
  about_page_id uuid;
BEGIN
  SELECT id INTO about_page_id FROM pages WHERE slug = 'about';
  
  IF about_page_id IS NOT NULL THEN
    INSERT INTO page_sections (page_id, section_key, section_type, title, content, settings, sort_order) VALUES
      (about_page_id, 'hero', 'hero', 'À Propos de la FEGESPORT', 'La Fédération Guinéenne d''Esport (FEGESPORT) est l''organisation nationale officielle pour l''esport en Guinée.', '{"background_image": "https://images.pexels.com/photos/7915559/pexels-photo-7915559.jpeg"}', 1),
      (about_page_id, 'mission', 'text', 'Notre Mission', 'La FEGESPORT a pour mission de développer et promouvoir l''esport en Guinée en créant un environnement structuré, inclusif et professionnel pour tous les acteurs de l''écosystème.', '{}', 2),
      (about_page_id, 'vision', 'text', 'Notre Vision', 'Notre vision est de positionner la Guinée comme un acteur majeur de l''esport en Afrique, en construisant un écosystème esport durable, équitable et innovant qui crée des opportunités pour tous.', '{}', 3)
    ON CONFLICT (page_id, section_key) DO NOTHING;
  END IF;
END $$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_sections_updated_at BEFORE UPDATE ON page_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();