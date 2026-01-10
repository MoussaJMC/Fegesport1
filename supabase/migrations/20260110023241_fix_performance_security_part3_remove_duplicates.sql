/*
  # Fix Performance and Security - Part 3: Remove Duplicate Policies

  ## Remove Redundant RLS Policies
  Many tables have duplicate policies that overlap. This creates confusion and 
  potential security issues. We keep only the essential policies:
  - Admin policies for full access
  - Public policies for read-only access to published content
  
  ## Tables Cleaned
  - events (remove duplicate admin policy)
  - file_usage (keep admin policy only)
  - members (remove redundant view policy)
  - membership_types (remove duplicate admin policies)
  - news (remove duplicate admin policy)
  - newsletter_subscriptions (remove duplicate public subscribe)
  - partners (remove duplicate admin policy)
  - site_settings (keep admin and public read)
  - slideshow_images (keep admin and active images)
  - static_files (consolidate admin policies)
  - streams (keep admin and public read)
*/

-- =====================================================
-- EVENTS TABLE
-- =====================================================

-- Remove old duplicate admin policy, keep "Admin has full access to events"
DROP POLICY IF EXISTS "Admin can manage all events" ON events;

-- =====================================================
-- FILE_USAGE TABLE
-- =====================================================

-- Admin policy covers all viewing needs
DROP POLICY IF EXISTS "Public can view file usage for public files" ON file_usage;

-- =====================================================
-- MEMBERS TABLE
-- =====================================================

-- User policies now cover viewing own data
DROP POLICY IF EXISTS "Authenticated users can view members" ON members;

-- =====================================================
-- MEMBERSHIP_TYPES TABLE
-- =====================================================

-- Remove old duplicate admin policy
DROP POLICY IF EXISTS "Admin full access to membership types" ON membership_types;

-- =====================================================
-- NEWS TABLE
-- =====================================================

-- Remove duplicate admin policy, keep "Admin has full access to news"
DROP POLICY IF EXISTS "Admin can manage all news" ON news;

-- =====================================================
-- NEWSLETTER_SUBSCRIPTIONS TABLE
-- =====================================================

-- Admin policy already allows inserts
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON newsletter_subscriptions;

-- Recreate a proper public subscribe policy
CREATE POLICY "Public can subscribe to newsletter"
  ON newsletter_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- =====================================================
-- PARTNERS TABLE
-- =====================================================

-- Remove duplicate admin policy, keep "Admin has full access to partners"
DROP POLICY IF EXISTS "Admin can manage all partners" ON partners;

-- =====================================================
-- SITE_SETTINGS TABLE
-- =====================================================

-- Keep both admin and public policies (not duplicates, serve different roles)
-- No changes needed

-- =====================================================
-- SLIDESHOW_IMAGES TABLE
-- =====================================================

-- Keep both policies (not duplicates)
-- No changes needed

-- =====================================================
-- STATIC_FILES TABLE
-- =====================================================

-- Remove redundant granular admin policies, keep consolidated admin policy
DROP POLICY IF EXISTS "Allow admins to insert static files" ON static_files;
DROP POLICY IF EXISTS "Allow admins to update static files" ON static_files;
DROP POLICY IF EXISTS "Allow admins to delete static files" ON static_files;

-- =====================================================
-- STREAMS TABLE
-- =====================================================

-- Keep both admin and public policies (not duplicates)
-- No changes needed
