/*
  # Consolidate Duplicate RLS Policies - Part 1
  
  ## Security Issue
  Multiple permissive policies for the same role/action combination can lead to 
  unintended access patterns and make security auditing difficult.
  
  ## Changes
  Consolidate policies for tables with public read + admin full access pattern:
  - cards
  - events
  - leadership_team
  - membership_types
  - page_sections
  - pages
  - partners
  - site_settings
  - slideshow_images
  - static_files
  - streams
  
  ## Strategy
  Replace multiple policies with single consolidated policies per action
*/

-- CARDS TABLE
DROP POLICY IF EXISTS "Admin has full access to cards" ON public.cards;
DROP POLICY IF EXISTS "Public read access for cards" ON public.cards;

CREATE POLICY "cards_select_policy"
  ON public.cards
  FOR SELECT
  USING (true);

CREATE POLICY "cards_modify_policy"
  ON public.cards
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- EVENTS TABLE
DROP POLICY IF EXISTS "Admin has full access to events" ON public.events;
DROP POLICY IF EXISTS "Public can view published events" ON public.events;

CREATE POLICY "events_select_policy"
  ON public.events
  FOR SELECT
  USING (
    (status <> 'cancelled' AND date >= CURRENT_DATE - INTERVAL '7 days')
    OR public.is_admin()
  );

CREATE POLICY "events_modify_policy"
  ON public.events
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- LEADERSHIP_TEAM TABLE
DROP POLICY IF EXISTS "Admin has full access to leadership_team" ON public.leadership_team;
DROP POLICY IF EXISTS "Public read access for leadership" ON public.leadership_team;

CREATE POLICY "leadership_select_policy"
  ON public.leadership_team
  FOR SELECT
  USING (true);

CREATE POLICY "leadership_modify_policy"
  ON public.leadership_team
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- MEMBERSHIP_TYPES TABLE
DROP POLICY IF EXISTS "Admin has full access to membership_types" ON public.membership_types;
DROP POLICY IF EXISTS "Public read access for membership types" ON public.membership_types;

CREATE POLICY "membership_types_select_policy"
  ON public.membership_types
  FOR SELECT
  USING (true);

CREATE POLICY "membership_types_modify_policy"
  ON public.membership_types
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PAGE_SECTIONS TABLE
DROP POLICY IF EXISTS "Admin has full access to page sections" ON public.page_sections;
DROP POLICY IF EXISTS "Public read access for active sections" ON public.page_sections;

CREATE POLICY "page_sections_select_policy"
  ON public.page_sections
  FOR SELECT
  USING (
    (is_active = true AND EXISTS (
      SELECT 1 FROM pages 
      WHERE pages.id = page_sections.page_id 
      AND pages.status = 'published'
    ))
    OR public.is_admin()
  );

CREATE POLICY "page_sections_modify_policy"
  ON public.page_sections
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PAGES TABLE
DROP POLICY IF EXISTS "Admin has full access to pages" ON public.pages;
DROP POLICY IF EXISTS "Public read access for published pages" ON public.pages;

CREATE POLICY "pages_select_policy"
  ON public.pages
  FOR SELECT
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "pages_modify_policy"
  ON public.pages
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PARTNERS TABLE
DROP POLICY IF EXISTS "Admin has full access to partners" ON public.partners;
DROP POLICY IF EXISTS "Public can view active partners" ON public.partners;

CREATE POLICY "partners_select_policy"
  ON public.partners
  FOR SELECT
  USING (status = 'active' OR public.is_admin());

CREATE POLICY "partners_modify_policy"
  ON public.partners
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- SITE_SETTINGS TABLE
DROP POLICY IF EXISTS "Admin has full access to site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Enable read access for public settings" ON public.site_settings;

CREATE POLICY "site_settings_select_policy"
  ON public.site_settings
  FOR SELECT
  USING (is_public = true OR public.is_admin());

CREATE POLICY "site_settings_modify_policy"
  ON public.site_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- SLIDESHOW_IMAGES TABLE
DROP POLICY IF EXISTS "Admin has full access to slideshow_images" ON public.slideshow_images;
DROP POLICY IF EXISTS "Public can view active slideshow images" ON public.slideshow_images;

CREATE POLICY "slideshow_images_select_policy"
  ON public.slideshow_images
  FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "slideshow_images_modify_policy"
  ON public.slideshow_images
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- STATIC_FILES TABLE
DROP POLICY IF EXISTS "Admin has full access to static_files" ON public.static_files;
DROP POLICY IF EXISTS "Public can view public files" ON public.static_files;

CREATE POLICY "static_files_select_policy"
  ON public.static_files
  FOR SELECT
  USING (is_public = true OR public.is_admin());

CREATE POLICY "static_files_modify_policy"
  ON public.static_files
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- STREAMS TABLE
DROP POLICY IF EXISTS "Admin has full access to streams" ON public.streams;
DROP POLICY IF EXISTS "Public can view streams" ON public.streams;

CREATE POLICY "streams_select_policy"
  ON public.streams
  FOR SELECT
  USING (true);

CREATE POLICY "streams_modify_policy"
  ON public.streams
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());