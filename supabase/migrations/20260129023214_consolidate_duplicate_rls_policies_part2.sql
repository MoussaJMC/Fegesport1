/*
  # Consolidate Duplicate RLS Policies - Part 2
  
  ## Security Issue
  Multiple permissive policies for the same role/action combination
  
  ## Changes
  Consolidate policies for tables with complex user access patterns:
  - event_registrations (multiple INSERT, SELECT, UPDATE policies)
  - members (multiple INSERT and ALL policies)  
  - news (overlapping SELECT policies)
  - newsletter_subscriptions (multiple INSERT and UPDATE policies)
  
  ## Strategy
  Create single policies per action that combine all conditions with OR
*/

-- EVENT_REGISTRATIONS TABLE
DROP POLICY IF EXISTS "Admin has full access to event_registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can register for open events" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Enable update for own registrations" ON public.event_registrations;

CREATE POLICY "event_registrations_select_policy"
  ON public.event_registrations
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = event_registrations.member_id 
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "event_registrations_insert_policy"
  ON public.event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR (
      EXISTS (
        SELECT 1 FROM events 
        WHERE events.id = event_registrations.event_id 
        AND events.status = 'open'
      )
      AND auth.uid() IS NOT NULL
    )
  );

CREATE POLICY "event_registrations_update_policy"
  ON public.event_registrations
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = event_registrations.member_id 
      AND members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = event_registrations.member_id 
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "event_registrations_delete_policy"
  ON public.event_registrations
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- MEMBERS TABLE
DROP POLICY IF EXISTS "Admin full access to members" ON public.members;
DROP POLICY IF EXISTS "Users can manage own member profile" ON public.members;
DROP POLICY IF EXISTS "Public can register as member" ON public.members;

CREATE POLICY "members_select_policy"
  ON public.members
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR user_id = auth.uid()
  );

CREATE POLICY "members_insert_policy"
  ON public.members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR user_id = auth.uid()
  );

CREATE POLICY "members_update_policy"
  ON public.members
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR user_id = auth.uid()
  )
  WITH CHECK (
    public.is_admin()
    OR user_id = auth.uid()
  );

CREATE POLICY "members_delete_policy"
  ON public.members
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin()
    OR user_id = auth.uid()
  );

-- NEWS TABLE
DROP POLICY IF EXISTS "Admin can do everything with news" ON public.news;
DROP POLICY IF EXISTS "Public can view published news" ON public.news;

CREATE POLICY "news_select_policy"
  ON public.news
  FOR SELECT
  USING (
    published = true
    OR public.is_admin()
  );

CREATE POLICY "news_modify_policy"
  ON public.news
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- NEWSLETTER_SUBSCRIPTIONS TABLE
DROP POLICY IF EXISTS "Admin has full access to newsletter_subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.newsletter_subscriptions;

CREATE POLICY "newsletter_select_policy"
  ON public.newsletter_subscriptions
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "newsletter_insert_policy"
  ON public.newsletter_subscriptions
  FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

CREATE POLICY "newsletter_update_policy"
  ON public.newsletter_subscriptions
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR email = auth.email()
  )
  WITH CHECK (
    public.is_admin()
    OR email = auth.email()
  );

CREATE POLICY "newsletter_delete_policy"
  ON public.newsletter_subscriptions
  FOR DELETE
  TO authenticated
  USING (public.is_admin());