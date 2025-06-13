/*
  # Fix RLS Policies for Admin Access

  1. New Tables
    - Creates profiles table if not exists
    - Ensures all tables have proper structure

  2. Security
    - Creates comprehensive RLS policies for all tables
    - Ensures admin user can access all data
    - Maintains security for non-admin users

  3. Functions
    - Creates helper functions for role checking
    - Ensures proper admin authentication
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

-- Create helper functions for authentication
CREATE OR REPLACE FUNCTION auth.role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'anon'
  )::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    '00000000-0000-0000-0000-000000000000'
  )::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.email()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    ''
  )::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION auth.role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.email() TO anon, authenticated;
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

-- Ensure admin user exists with correct metadata
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@fegesport.org';

  IF admin_user_id IS NULL THEN
    -- Create admin user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@fegesport.org',
      crypt('Admin@2025!', gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "admin"}'::jsonb,
      now(),
      now(),
      encode(gen_random_bytes(32), 'hex'),
      encode(gen_random_bytes(32), 'hex')
    )
    RETURNING id INTO admin_user_id;

    -- Insert identity for the admin user
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      created_at,
      updated_at,
      last_sign_in_at
    )
    VALUES (
      gen_random_uuid(),
      admin_user_id,
      admin_user_id::text,
      format('{"sub": "%s", "email": "admin@fegesport.org", "email_verified": true, "role": "admin"}', admin_user_id)::jsonb,
      'email',
      now(),
      now(),
      now()
    );

    RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
  ELSE
    -- Update existing admin user to ensure correct metadata
    UPDATE auth.users
    SET 
      raw_user_meta_data = '{"role": "admin"}'::jsonb,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE id = admin_user_id;

    RAISE NOTICE 'Admin user updated with ID: %', admin_user_id;
  END IF;
END $$;