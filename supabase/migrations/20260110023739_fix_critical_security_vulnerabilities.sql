/*
  # Fix Critical Security Vulnerabilities

  ## CRITICAL PRIVACY VIOLATIONS FIXED

  ### 1. Newsletter Subscriptions
  - REMOVED: "Enable read for authenticated users" policy
  - REASON: ANY authenticated user could read ALL subscriber emails (GDPR violation)
  - AFTER: Only admins can read subscriptions

  ### 2. Contact Messages
  - REMOVED: "Enable read for authenticated users" policy  
  - REMOVED: "Enable update for authenticated users" policy
  - REASON: ANY authenticated user could read/modify ALL contact messages
  - AFTER: Only admins can access contact messages

  ### 3. Event Registrations
  - REMOVED: "Enable read access for authenticated users" policy
  - ADDED: "Users can view own registrations" policy
  - REASON: ANY authenticated user could see ALL registrations
  - AFTER: Users only see their own registrations, admins see all

  ### 4. Newsletter Subscription Validation
  - UPDATED: "Public can subscribe to newsletter" policy
  - ADDED: Email format validation
  - REASON: No validation allowed spam/invalid emails

  ## Security Impact
  - Prevents unauthorized access to private user data
  - Ensures GDPR/privacy compliance
  - Restricts data access to appropriate users only
*/

-- =====================================================
-- FIX 1: REMOVE PRIVACY-VIOLATING NEWSLETTER POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Enable read for authenticated users" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Enable update for own subscription" ON newsletter_subscriptions;

-- Only allow users to update their own subscription status
CREATE POLICY "Users can update own subscription"
  ON newsletter_subscriptions
  FOR UPDATE
  TO authenticated
  USING (email = (select auth.email()))
  WITH CHECK (email = (select auth.email()));

-- =====================================================
-- FIX 2: REMOVE PRIVACY-VIOLATING CONTACT MESSAGE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Enable read for authenticated users" ON contact_messages;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON contact_messages;

-- Contact messages should ONLY be accessible to admins (already have admin policy)
-- No additional policies needed

-- =====================================================
-- FIX 3: FIX EVENT REGISTRATIONS PRIVACY
-- =====================================================

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON event_registrations;

-- Users can only view their own registrations
CREATE POLICY "Users can view own registrations"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = member_id 
      AND members.user_id = (select auth.uid())
    )
  );

-- Admins can view all registrations (already covered by admin policy)

-- =====================================================
-- FIX 4: ADD EMAIL VALIDATION FOR NEWSLETTER
-- =====================================================

DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON newsletter_subscriptions;

CREATE POLICY "Public can subscribe to newsletter"
  ON newsletter_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Validate email format
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

-- =====================================================
-- FIX 5: ENSURE ADMIN POLICIES EXIST
-- =====================================================

-- Verify admin has full access to event_registrations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'event_registrations' 
    AND policyname = 'Admin has full access to event_registrations'
  ) THEN
    CREATE POLICY "Admin has full access to event_registrations"
      ON event_registrations
      FOR ALL
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;
