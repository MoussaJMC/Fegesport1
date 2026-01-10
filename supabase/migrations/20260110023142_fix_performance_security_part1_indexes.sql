/*
  # Fix Performance and Security - Part 1: Indexes

  ## Add Missing Foreign Key Indexes
  - Add index on `event_registrations.member_id` for faster joins
  - Add index on `members.user_id` for auth lookups
  - Add index on `news.author_id` for author queries
  - Add index on `static_files.uploaded_by` for user file queries

  ## Remove Unused Indexes
  Clean up indexes that are not being used by queries to reduce maintenance overhead
*/

-- =====================================================
-- ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_event_registrations_member_id ON event_registrations(member_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_news_author_id ON news(author_id);
CREATE INDEX IF NOT EXISTS idx_static_files_uploaded_by ON static_files(uploaded_by);

-- =====================================================
-- REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_profiles_user_id;
DROP INDEX IF EXISTS idx_pages_status;
DROP INDEX IF EXISTS idx_page_sections_page_id;
DROP INDEX IF EXISTS idx_static_files_type;
DROP INDEX IF EXISTS idx_static_files_public;
DROP INDEX IF EXISTS idx_static_files_featured;
DROP INDEX IF EXISTS idx_static_files_tags;
DROP INDEX IF EXISTS idx_file_usage_file;
DROP INDEX IF EXISTS idx_file_usage_content;
DROP INDEX IF EXISTS idx_cards_category;
DROP INDEX IF EXISTS idx_partners_translations;
DROP INDEX IF EXISTS idx_cards_translations;
DROP INDEX IF EXISTS idx_slideshow_translations;
DROP INDEX IF EXISTS idx_streams_translations;
DROP INDEX IF EXISTS idx_leadership_translations;
DROP INDEX IF EXISTS idx_membership_types_translations;
DROP INDEX IF EXISTS idx_pages_translations;
DROP INDEX IF EXISTS idx_page_sections_translations;
DROP INDEX IF EXISTS idx_file_categories_translations;
DROP INDEX IF EXISTS idx_news_translations;
DROP INDEX IF EXISTS idx_events_translations;
