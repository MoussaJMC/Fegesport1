/*
  # Add Slideshow and Streams Tables

  1. New Tables
    - `slideshow_images` - Stores images for the homepage slideshow
    - `streams` - Stores YouTube and Twitch stream information for the DIRECT page
  
  2. Security
    - Enable RLS on both tables
    - Add policies for admin access and public viewing
*/

-- Create slideshow_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS slideshow_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create streams table if it doesn't exist
CREATE TABLE IF NOT EXISTS streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'twitch')),
  stream_id TEXT NOT NULL,
  description TEXT,
  is_live BOOLEAN DEFAULT FALSE,
  scheduled_for TIMESTAMPTZ,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE slideshow_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;

-- Create policies for slideshow_images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Admin has full access to slideshow_images' 
    AND polrelid = 'slideshow_images'::regclass
  ) THEN
    CREATE POLICY "Admin has full access to slideshow_images" ON slideshow_images
      FOR ALL USING (is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Public can view active slideshow images' 
    AND polrelid = 'slideshow_images'::regclass
  ) THEN
    CREATE POLICY "Public can view active slideshow images" ON slideshow_images
      FOR SELECT USING (is_active = true);
  END IF;
END
$$;

-- Create policies for streams
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Admin has full access to streams' 
    AND polrelid = 'streams'::regclass
  ) THEN
    CREATE POLICY "Admin has full access to streams" ON streams
      FOR ALL USING (is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Public can view streams' 
    AND polrelid = 'streams'::regclass
  ) THEN
    CREATE POLICY "Public can view streams" ON streams
      FOR SELECT USING (true);
  END IF;
END
$$;

-- Create triggers to update updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_slideshow_images_updated_at' 
    AND tgrelid = 'slideshow_images'::regclass
  ) THEN
    CREATE TRIGGER update_slideshow_images_updated_at BEFORE UPDATE ON slideshow_images
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_streams_updated_at' 
    AND tgrelid = 'streams'::regclass
  ) THEN
    CREATE TRIGGER update_streams_updated_at BEFORE UPDATE ON streams
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Insert sample data for slideshow
INSERT INTO slideshow_images (title, description, image_url, sort_order, is_active)
SELECT 
  'Tournoi National FIFA 25',
  'Les meilleurs joueurs guinéens s''affrontent pour le titre de champion national',
  'https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg',
  1,
  true
WHERE NOT EXISTS (SELECT 1 FROM slideshow_images LIMIT 1);

INSERT INTO slideshow_images (title, description, image_url, sort_order, is_active)
SELECT 
  'Formation des Arbitres Esport',
  'Programme de certification pour les arbitres officiels de la FEGESPORT',
  'https://images.pexels.com/photos/159393/gamepad-video-game-controller-game-controller-controller-159393.jpeg',
  2,
  true
WHERE NOT EXISTS (SELECT 1 FROM slideshow_images LIMIT 1);

INSERT INTO slideshow_images (title, description, image_url, sort_order, is_active)
SELECT 
  'Championnat PUBG Mobile',
  'Les meilleures équipes guinéennes s''affrontent dans une compétition intense',
  'https://images.pexels.com/photos/7862608/pexels-photo-7862608.jpeg',
  3,
  true
WHERE NOT EXISTS (SELECT 1 FROM slideshow_images LIMIT 1);

-- Insert sample data for streams
INSERT INTO streams (title, platform, stream_id, description, is_live, thumbnail_url)
SELECT 
  'Tournoi FIFA 25 - Quarts de finale',
  'youtube',
  'jfKfPfyJRdk',
  'Suivez en direct les quarts de finale du tournoi FIFA 25 organisé par la FEGESPORT.',
  true,
  'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM streams LIMIT 1);

INSERT INTO streams (title, platform, stream_id, description, is_live, scheduled_for, thumbnail_url)
SELECT 
  'PUBG Mobile Championship - Jour 2',
  'twitch',
  'esl_pubgmobile',
  'Deuxième journée du championnat PUBG Mobile avec les meilleures équipes guinéennes.',
  false,
  '2025-07-15T18:00:00Z',
  'https://images.pexels.com/photos/159393/gamepad-video-game-controller-game-controller-controller-159393.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM streams LIMIT 1);

INSERT INTO streams (title, platform, stream_id, description, is_live, scheduled_for, thumbnail_url)
SELECT 
  'Conférence: L''avenir de l''esport en Guinée',
  'youtube',
  'dQw4w9WgXcQ',
  'Conférence avec les acteurs majeurs de l''esport guinéen sur les perspectives d''avenir.',
  false,
  '2025-07-20T16:30:00Z',
  'https://images.pexels.com/photos/7862508/pexels-photo-7862508.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM streams LIMIT 1);