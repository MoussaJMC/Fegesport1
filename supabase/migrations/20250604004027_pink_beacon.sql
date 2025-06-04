/*
  # Create Admin User

  1. Changes
    - Creates admin user with proper metadata and confirmation
    - Sets up email confirmation
    - Ensures proper role assignment

  2. Security
    - Uses secure password hashing
    - Sets appropriate user role and metadata
*/

-- Drop existing admin user if exists
DELETE FROM auth.users WHERE email = 'admin@fegesport.org';

-- Create admin user with correct metadata
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@fegesport.org',
  crypt('Admin@2025!', gen_salt('bf')),
  now(),
  '{"role": "admin"}'::jsonb,
  now(),
  now(),
  encode(gen_random_bytes(32), 'hex')
);

-- Ensure user is confirmed
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'admin@fegesport.org';