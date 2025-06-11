/*
  # Fix Authentication Schema

  1. Changes
    - Ensure auth schema exists
    - Set up proper auth user management tables if missing
    - Add necessary RLS policies for auth tables
    
  2. Security
    - Enable RLS on auth-related tables
    - Add policies for proper authentication flow
*/

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Ensure we have the auth.users table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' 
    AND table_name = 'users'
  ) THEN
    -- Create the auth.users table
    CREATE TABLE auth.users (
      id uuid NOT NULL PRIMARY KEY,
      email text,
      encrypted_password text,
      email_confirmed_at timestamp with time zone,
      invited_at timestamp with time zone,
      confirmation_token text,
      confirmation_sent_at timestamp with time zone,
      recovery_token text,
      recovery_sent_at timestamp with time zone,
      email_change_token text,
      email_change text,
      email_change_sent_at timestamp with time zone,
      last_sign_in_at timestamp with time zone,
      raw_app_meta_data jsonb,
      raw_user_meta_data jsonb,
      is_super_admin boolean,
      created_at timestamp with time zone,
      updated_at timestamp with time zone,
      phone text,
      phone_confirmed_at timestamp with time zone,
      phone_change text,
      phone_change_token text,
      phone_change_sent_at timestamp with time zone,
      confirmed_at timestamp with time zone,
      email_change_confirm_status smallint,
      banned_until timestamp with time zone,
      reauthentication_token text,
      reauthentication_sent_at timestamp with time zone,
      is_sso_user boolean DEFAULT false,
      deleted_at timestamp with time zone
    );
  END IF;
END $$;

-- Ensure we have the auth.sessions table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' 
    AND table_name = 'sessions'
  ) THEN
    -- Create the auth.sessions table
    CREATE TABLE auth.sessions (
      id uuid NOT NULL PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at timestamp with time zone,
      updated_at timestamp with time zone
    );
  END IF;
END $$;

-- Add necessary indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users (email);
CREATE INDEX IF NOT EXISTS users_instance_id_email_idx ON auth.users (email);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON auth.sessions (user_id);

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
DO $$ 
BEGIN
  -- Users policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND schemaname = 'auth'
    AND policyname = 'Users can view own user data'
  ) THEN
    CREATE POLICY "Users can view own user data" 
    ON auth.users 
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = id);
  END IF;

  -- Sessions policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sessions' 
    AND schemaname = 'auth'
    AND policyname = 'Users can view own sessions'
  ) THEN
    CREATE POLICY "Users can view own sessions" 
    ON auth.sessions 
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);
  END IF;
END $$;