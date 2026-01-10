/*
  # Fix Performance and Security - Part 2: RLS Optimization

  ## Optimize RLS Policies for Performance
  Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation per row.
  This significantly improves query performance at scale by evaluating auth functions once per query.

  ## Tables Updated
  - members
  - event_registrations  
  - contact_messages
  - newsletter_subscriptions
  - profiles
  - membership_types
  - cards
  - leadership_team
  - pages
  - page_sections
*/

-- =====================================================
-- MEMBERS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can manage own member profile" ON members;
DROP POLICY IF EXISTS "Public can register as member" ON members;

CREATE POLICY "Users can manage own member profile"
  ON members
  FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Public can register as member"
  ON members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- EVENT_REGISTRATIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can register for open events" ON event_registrations;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON event_registrations;
DROP POLICY IF EXISTS "Enable update for own registrations" ON event_registrations;

CREATE POLICY "Users can register for open events"
  ON event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_id 
      AND events.status = 'open'
    )
    AND (select auth.uid()) IS NOT NULL
  );

CREATE POLICY "Enable read access for authenticated users"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Enable update for own registrations"
  ON event_registrations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = member_id 
      AND members.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- CONTACT_MESSAGES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Enable read for authenticated users" ON contact_messages;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON contact_messages;

CREATE POLICY "Enable read for authenticated users"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Enable update for authenticated users"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- =====================================================
-- NEWSLETTER_SUBSCRIPTIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Enable read for authenticated users" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Enable update for own subscription" ON newsletter_subscriptions;

CREATE POLICY "Enable read for authenticated users"
  ON newsletter_subscriptions
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Enable update for own subscription"
  ON newsletter_subscriptions
  FOR UPDATE
  TO authenticated
  USING (email = (select auth.email()));

-- =====================================================
-- PROFILES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Allow authenticated users to select their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own profile" ON profiles;

CREATE POLICY "Allow authenticated users to select their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Allow authenticated users to insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Allow authenticated users to update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Allow authenticated users to delete their own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- MEMBERSHIP_TYPES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Enable read access for all users" ON membership_types;
DROP POLICY IF EXISTS "Read access for membership types" ON membership_types;

CREATE POLICY "Public read access for membership types"
  ON membership_types
  FOR SELECT
  USING (true);

-- =====================================================
-- CARDS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Enable read access for all users" ON cards;

CREATE POLICY "Public read access for cards"
  ON cards
  FOR SELECT
  USING (true);

-- =====================================================
-- LEADERSHIP_TEAM TABLE
-- =====================================================

DROP POLICY IF EXISTS "Enable read access for all users" ON leadership_team;

CREATE POLICY "Public read access for leadership"
  ON leadership_team
  FOR SELECT
  USING (true);

-- =====================================================
-- PAGES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Enable read access for published pages" ON pages;

CREATE POLICY "Public read access for published pages"
  ON pages
  FOR SELECT
  USING (status = 'published');

-- =====================================================
-- PAGE_SECTIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Enable read access for active sections of published pages" ON page_sections;

CREATE POLICY "Public read access for active sections"
  ON page_sections
  FOR SELECT
  USING (
    is_active = true 
    AND EXISTS (
      SELECT 1 FROM pages 
      WHERE pages.id = page_id 
      AND pages.status = 'published'
    )
  );
