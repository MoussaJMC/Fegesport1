/*
  # Fix RLS Policies for Admin Access
  
  1. Changes
    - Create RLS policies for all tables without accessing auth schema
    - Use built-in Supabase functions instead of custom auth functions
    - Enable proper admin access through user metadata
    
  2. Security
    - Enable RLS on all tables
    - Create policies for public read access where appropriate
    - Admin access through user metadata checking
*/

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_user_id'
  ) THEN
    CREATE INDEX idx_profiles_user_id ON profiles(user_id);
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Function to check if user is admin using built-in functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT CASE 
      WHEN current_setting('request.jwt.claims', true)::json->>'role' = 'admin' THEN true
      WHEN current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role' = 'admin' THEN true
      ELSE false
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on function
GRANT EXECUTE ON FUNCTION is_admin() TO anon, authenticated;

-- NEWS TABLE POLICIES
CREATE POLICY "Enable read access for all users" ON news
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON news
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON news
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON news
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin has full access to news" ON news
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- EVENTS TABLE POLICIES
CREATE POLICY "Allow read access for all users on events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON events
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON events
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin has full access to events" ON events
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- MEMBERS TABLE POLICIES
CREATE POLICY "Enable insert for all users" ON members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for own profile" ON members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for own profile" ON members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admin has full access to members" ON members
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- PARTNERS TABLE POLICIES
CREATE POLICY "Enable read access for all users" ON partners
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON partners
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON partners
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON partners
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin has full access to partners" ON partners
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- CONTACT MESSAGES TABLE POLICIES
CREATE POLICY "Allow insert for all users on contact_messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users" ON contact_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON contact_messages
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin has full access to contact_messages" ON contact_messages
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- NEWSLETTER SUBSCRIPTIONS TABLE POLICIES
CREATE POLICY "Enable insert for all users" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users" ON newsletter_subscriptions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for own subscription" ON newsletter_subscriptions
  FOR UPDATE USING (email = auth.email());

CREATE POLICY "Admin has full access to newsletter_subscriptions" ON newsletter_subscriptions
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- EVENT REGISTRATIONS TABLE POLICIES
CREATE POLICY "Enable insert for authenticated users" ON event_registrations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON event_registrations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for own registrations" ON event_registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = event_registrations.member_id
      AND members.user_id = auth.uid()
    )
  );

-- PROFILES TABLE POLICIES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Note: Admin user creation must be done through Supabase Dashboard or Auth API
-- as direct manipulation of auth.users requires superuser privileges