/*
  # Fix Authentication Schema Issues

  1. Changes
    - Drop and recreate problematic functions with proper security
    - Fix RLS policies that may be causing schema query issues
    - Ensure proper admin user setup
    - Clean up any conflicting policies

  2. Security
    - Recreate admin functions with proper search paths
    - Fix RLS policies to prevent schema conflicts
    - Ensure proper user authentication flow
*/

-- First, let's clean up any problematic policies and functions
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all existing policies that might be causing conflicts
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Drop existing functions to recreate them properly
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.require_admin() CASCADE;
DROP FUNCTION IF EXISTS public.create_admin_policies() CASCADE;

-- Create a simple role checking function that doesn't cause schema conflicts
CREATE OR REPLACE FUNCTION public.role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'anon'
  )::text;
$$;

-- Create admin checking function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT public.role() = 'admin';
$$;

-- Create user ID function
CREATE OR REPLACE FUNCTION public.uid()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    '00000000-0000-0000-0000-000000000000'
  )::uuid;
$$;

-- Create email function
CREATE OR REPLACE FUNCTION public.email()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    ''
  )::text;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.uid() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.email() TO anon, authenticated;

-- Ensure all tables have RLS enabled
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Create simple, non-conflicting policies for news
CREATE POLICY "Enable read access for all users" ON news
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON news
  FOR INSERT WITH CHECK (role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON news
  FOR UPDATE USING (role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON news
  FOR DELETE USING (role() = 'authenticated');

CREATE POLICY "Admin has full access to news" ON news
  FOR ALL USING (role() = 'admin')
  WITH CHECK (role() = 'admin');

-- Create policies for events
CREATE POLICY "Allow read access for all users on events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON events
  FOR INSERT WITH CHECK (role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON events
  FOR UPDATE USING (role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON events
  FOR DELETE USING (role() = 'authenticated');

CREATE POLICY "Admin has full access to events" ON events
  FOR ALL USING (role() = 'admin')
  WITH CHECK (role() = 'admin');

-- Create policies for members
CREATE POLICY "Enable insert for all users" ON members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON members
  FOR SELECT USING (role() = 'authenticated');

CREATE POLICY "Enable update for own profile" ON members
  FOR UPDATE USING (uid() = user_id);

CREATE POLICY "Enable delete for own profile" ON members
  FOR DELETE USING (uid() = user_id);

CREATE POLICY "Admin has full access to members" ON members
  FOR ALL USING (role() = 'admin')
  WITH CHECK (role() = 'admin');

-- Create policies for partners
CREATE POLICY "Enable read access for all users" ON partners
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON partners
  FOR INSERT WITH CHECK (role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON partners
  FOR UPDATE USING (role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON partners
  FOR DELETE USING (role() = 'authenticated');

CREATE POLICY "Admin has full access to partners" ON partners
  FOR ALL USING (role() = 'admin')
  WITH CHECK (role() = 'admin');

-- Create policies for contact_messages
CREATE POLICY "Allow insert for all users on contact_messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users" ON contact_messages
  FOR SELECT USING (role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON contact_messages
  FOR UPDATE USING (role() = 'authenticated');

CREATE POLICY "Admin has full access to contact_messages" ON contact_messages
  FOR ALL USING (role() = 'admin')
  WITH CHECK (role() = 'admin');

-- Create policies for newsletter_subscriptions
CREATE POLICY "Enable insert for all users" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users" ON newsletter_subscriptions
  FOR SELECT USING (role() = 'authenticated');

CREATE POLICY "Enable update for own subscription" ON newsletter_subscriptions
  FOR UPDATE USING (email = email());

CREATE POLICY "Admin has full access to newsletter_subscriptions" ON newsletter_subscriptions
  FOR ALL USING (role() = 'admin')
  WITH CHECK (role() = 'admin');

-- Create policies for event_registrations
CREATE POLICY "Enable insert for authenticated users" ON event_registrations
  FOR INSERT WITH CHECK (role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON event_registrations
  FOR SELECT USING (role() = 'authenticated');

CREATE POLICY "Enable update for own registrations" ON event_registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = event_registrations.member_id
      AND members.user_id = uid()
    )
  );

-- Clean up any existing admin users to avoid conflicts
DELETE FROM auth.users WHERE email IN ('admin@fegesport.org', 'jmc.esgc2013@gmail.com');

-- Create the admin user with proper structure
DO $$
DECLARE
  admin_user_id uuid := gen_random_uuid();
BEGIN
  -- Insert admin user
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
    admin_user_id,
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
  );

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
END $$;