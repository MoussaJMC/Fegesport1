/*
  # Fix RLS policies - Remove blocking WITH CHECK clauses

  1. Security Fix
    - Remove WITH CHECK (is_admin()) from admin policies that use FOR ALL
    - This prevents admin policies from blocking legitimate user operations
    - Admin policies should only grant additional access, not block user access

  2. Tables Updated
    - news
    - events  
    - members
    - partners
    - contact_messages
    - newsletter_subscriptions
*/

-- Drop and recreate the problematic admin policies without WITH CHECK clauses

-- NEWS TABLE - Fix admin policy
DROP POLICY IF EXISTS "Admin has full access to news" ON news;
CREATE POLICY "Admin has full access to news" ON news
  FOR ALL USING (is_admin());

-- EVENTS TABLE - Fix admin policy  
DROP POLICY IF EXISTS "Admin has full access to events" ON events;
CREATE POLICY "Admin has full access to events" ON events
  FOR ALL USING (is_admin());

-- MEMBERS TABLE - Fix admin policy
DROP POLICY IF EXISTS "Admin has full access to members" ON members;
CREATE POLICY "Admin has full access to members" ON members
  FOR ALL USING (is_admin());

-- PARTNERS TABLE - Fix admin policy
DROP POLICY IF EXISTS "Admin has full access to partners" ON partners;
CREATE POLICY "Admin has full access to partners" ON partners
  FOR ALL USING (is_admin());

-- CONTACT MESSAGES TABLE - Fix admin policy
DROP POLICY IF EXISTS "Admin has full access to contact_messages" ON contact_messages;
CREATE POLICY "Admin has full access to contact_messages" ON contact_messages
  FOR ALL USING (is_admin());

-- NEWSLETTER SUBSCRIPTIONS TABLE - Fix admin policy
DROP POLICY IF EXISTS "Admin has full access to newsletter_subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Admin has full access to newsletter_subscriptions" ON newsletter_subscriptions
  FOR ALL USING (is_admin());