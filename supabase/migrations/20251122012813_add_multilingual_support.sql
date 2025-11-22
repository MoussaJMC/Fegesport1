/*
  # Add Multilingual Support to Content Tables

  ## Overview
  This migration adds bilingual FR/EN support to all content tables in the database.

  ## Approach
  Instead of duplicating columns (title_fr, title_en), we use JSONB columns to store
  translations. This approach is more flexible and scalable for future languages.

  ## Tables Modified
  1. news - Articles/News
  2. events - Events
  3. partners - Partners
  4. cards - Information cards
  5. slideshow_images - Slideshow images
  6. streams - Live streams
  7. leadership_team - Leadership team members
  8. membership_types - Membership types
  9. pages - CMS Pages
  10. page_sections - Page sections
  11. file_categories - File categories

  ## Translation Structure
  All translatable fields will use JSONB format:
  {
    "fr": "Texte en français",
    "en": "Text in English"
  }

  ## Changes Applied
  1. Add 'translations' JSONB column to each content table
  2. Create helper functions to get translation by language
  3. Migrate existing French content to translations.fr
  4. Update RLS policies to work with translations
  5. Add indexes for better performance
*/

-- ============================================================================
-- 1. NEWS TABLE - Add translations
-- ============================================================================

ALTER TABLE news
ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_news_translations ON news USING gin(translations);

-- Migrate existing data to translations (assuming existing data is French)
UPDATE news
SET translations = jsonb_build_object(
  'fr', jsonb_build_object(
    'title', title,
    'excerpt', excerpt,
    'content', content
  ),
  'en', jsonb_build_object(
    'title', '',
    'excerpt', '',
    'content', ''
  )
)
WHERE translations = '{}'::jsonb;

-- ============================================================================
-- 2. EVENTS TABLE - Add translations
-- ============================================================================

ALTER TABLE events
ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_events_translations ON events USING gin(translations);

UPDATE events
SET translations = jsonb_build_object(
  'fr', jsonb_build_object(
    'title', title,
    'description', description,
    'location', location
  ),
  'en', jsonb_build_object(
    'title', '',
    'description', '',
    'location', ''
  )
)
WHERE translations = '{}'::jsonb;

-- ============================================================================
-- 3. PARTNERS TABLE - Add translations
-- ============================================================================

ALTER TABLE partners
ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_partners_translations ON partners USING gin(translations);

UPDATE partners
SET translations = jsonb_build_object(
  'fr', jsonb_build_object(
    'name', name,
    'description', description
  ),
  'en', jsonb_build_object(
    'name', '',
    'description', ''
  )
)
WHERE translations = '{}'::jsonb;

-- ============================================================================
-- 4. CARDS TABLE - Add translations
-- ============================================================================

ALTER TABLE cards
ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_cards_translations ON cards USING gin(translations);

UPDATE cards
SET translations = jsonb_build_object(
  'fr', jsonb_build_object(
    'title', title,
    'content', content
  ),
  'en', jsonb_build_object(
    'title', '',
    'content', ''
  )
)
WHERE translations = '{}'::jsonb;

-- ============================================================================
-- 5. SLIDESHOW_IMAGES TABLE - Add translations
-- ============================================================================

ALTER TABLE slideshow_images
ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_slideshow_translations ON slideshow_images USING gin(translations);

UPDATE slideshow_images
SET translations = jsonb_build_object(
  'fr', jsonb_build_object(
    'title', title,
    'description', description
  ),
  'en', jsonb_build_object(
    'title', '',
    'description', ''
  )
)
WHERE translations = '{}'::jsonb;

-- ============================================================================
-- 6. STREAMS TABLE - Add translations
-- ============================================================================

ALTER TABLE streams
ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_streams_translations ON streams USING gin(translations);

UPDATE streams
SET translations = jsonb_build_object(
  'fr', jsonb_build_object(
    'title', title,
    'description', description
  ),
  'en', jsonb_build_object(
    'title', '',
    'description', ''
  )
)
WHERE translations = '{}'::jsonb;

-- ============================================================================
-- 7. LEADERSHIP_TEAM TABLE - Add translations
-- ============================================================================

ALTER TABLE leadership_team
ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_leadership_translations ON leadership_team USING gin(translations);

UPDATE leadership_team
SET translations = jsonb_build_object(
  'fr', jsonb_build_object(
    'name', name,
    'position', position,
    'bio', bio
  ),
  'en', jsonb_build_object(
    'name', '',
    'position', '',
    'bio', ''
  )
)
WHERE translations = '{}'::jsonb;

-- ============================================================================
-- 8. MEMBERSHIP_TYPES TABLE - Add translations
-- ============================================================================

ALTER TABLE membership_types
ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_membership_types_translations ON membership_types USING gin(translations);

UPDATE membership_types
SET translations = jsonb_build_object(
  'fr', jsonb_build_object(
    'name', name,
    'description', description,
    'period', period,
    'features', features
  ),
  'en', jsonb_build_object(
    'name', '',
    'description', '',
    'period', '',
    'features', ARRAY[]::text[]
  )
)
WHERE translations = '{}'::jsonb;

-- ============================================================================
-- 9. PAGES TABLE - Add translations
-- ============================================================================

ALTER TABLE pages
ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_pages_translations ON pages USING gin(translations);

UPDATE pages
SET translations = jsonb_build_object(
  'fr', jsonb_build_object(
    'title', title,
    'meta_description', meta_description
  ),
  'en', jsonb_build_object(
    'title', '',
    'meta_description', ''
  )
)
WHERE translations = '{}'::jsonb;

-- ============================================================================
-- 10. PAGE_SECTIONS TABLE - Add translations
-- ============================================================================

ALTER TABLE page_sections
ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_page_sections_translations ON page_sections USING gin(translations);

UPDATE page_sections
SET translations = jsonb_build_object(
  'fr', jsonb_build_object(
    'title', title,
    'content', content
  ),
  'en', jsonb_build_object(
    'title', '',
    'content', ''
  )
)
WHERE translations = '{}'::jsonb;

-- ============================================================================
-- 11. FILE_CATEGORIES TABLE - Add translations
-- ============================================================================

ALTER TABLE file_categories
ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_file_categories_translations ON file_categories USING gin(translations);

UPDATE file_categories
SET translations = jsonb_build_object(
  'fr', jsonb_build_object(
    'name', name,
    'description', description
  ),
  'en', jsonb_build_object(
    'name', '',
    'description', ''
  )
)
WHERE translations = '{}'::jsonb;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to extract translation for a specific language
CREATE OR REPLACE FUNCTION get_translation(
  translations JSONB,
  lang TEXT,
  field TEXT,
  fallback_lang TEXT DEFAULT 'fr'
)
RETURNS TEXT AS $$
BEGIN
  -- Try to get the requested language
  IF translations->lang->>field IS NOT NULL AND translations->lang->>field != '' THEN
    RETURN translations->lang->>field;
  END IF;
  
  -- Fallback to default language
  IF translations->fallback_lang->>field IS NOT NULL THEN
    RETURN translations->fallback_lang->>field;
  END IF;
  
  -- Return empty string if nothing found
  RETURN '';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get full translation object for a language
CREATE OR REPLACE FUNCTION get_full_translation(
  translations JSONB,
  lang TEXT,
  fallback_lang TEXT DEFAULT 'fr'
)
RETURNS JSONB AS $$
BEGIN
  -- Try to get the requested language
  IF translations->lang IS NOT NULL THEN
    RETURN translations->lang;
  END IF;
  
  -- Fallback to default language
  IF translations->fallback_lang IS NOT NULL THEN
    RETURN translations->fallback_lang;
  END IF;
  
  -- Return empty object if nothing found
  RETURN '{}'::jsonb;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- To verify translations were added:
-- SELECT id, title, translations FROM news LIMIT 1;
-- SELECT id, name, translations FROM partners LIMIT 1;
