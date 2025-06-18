/*
  # Site Settings Management

  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key)
      - `setting_key` (text, unique)
      - `setting_value` (jsonb)
      - `setting_type` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `site_settings` table
    - Add policy for admin access only
    - Add policy for public read access to published settings

  3. Default Settings
    - Logo configuration
    - Menu items
    - Site metadata
*/

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}',
  setting_type text NOT NULL CHECK (setting_type IN ('logo', 'menu', 'metadata', 'theme', 'contact')),
  description text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_site_settings_type ON site_settings(setting_type);
CREATE INDEX IF NOT EXISTS idx_site_settings_public ON site_settings(is_public);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Site settings policies
CREATE POLICY "Enable read access for public settings" ON site_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admin has full access to site settings" ON site_settings
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
  (
    'site_logo',
    '{
      "main_logo": "https://images.pexels.com/photos/7915559/pexels-photo-7915559.jpeg",
      "alt_text": "FEGESPORT Logo",
      "width": 48,
      "height": 48,
      "link": "/"
    }',
    'logo',
    'Configuration du logo principal du site',
    true
  ),
  (
    'main_navigation',
    '{
      "brand_text": "FEGESPORT",
      "items": [
        {"label": "Accueil", "path": "/", "order": 1},
        {"label": "À propos", "path": "/about", "order": 2},
        {"label": "Actualités", "path": "/news", "order": 3},
        {"label": "Adhésion", "path": "/membership", "order": 4, "submenu": [
          {"label": "Adhésion", "path": "/membership"},
          {"label": "Communauté", "path": "/membership/community"}
        ]},
        {"label": "Ressources", "path": "/resources", "order": 5},
        {"label": "Partenaires", "path": "/partners", "order": 6},
        {"label": "Contact", "path": "/contact", "order": 7}
      ]
    }',
    'menu',
    'Configuration du menu principal de navigation',
    true
  ),
  (
    'site_metadata',
    '{
      "site_title": "FEGESPORT - Fédération Guinéenne d''Esport",
      "site_description": "La Fédération Guinéenne d''Esport (FEGESPORT) est l''organisation nationale officielle pour l''esport en Guinée.",
      "keywords": ["esport", "guinée", "fédération", "gaming", "compétition"],
      "og_image": "https://fegesport224.org/og-image.jpg",
      "favicon": "/favicon.ico"
    }',
    'metadata',
    'Métadonnées générales du site',
    true
  ),
  (
    'contact_info',
    '{
      "address": "Conakry, Guinée",
      "postal_code": "BP 12345",
      "email": "contact@fegesport224.org",
      "phone": "+224 625878764",
      "social_media": {
        "facebook": "https://facebook.com/fegesport",
        "twitter": "https://twitter.com/fegesport",
        "instagram": "https://instagram.com/fegesport",
        "youtube": "https://youtube.com/fegesport"
      }
    }',
    'contact',
    'Informations de contact de l''organisation',
    true
  )
ON CONFLICT (setting_key) DO NOTHING;