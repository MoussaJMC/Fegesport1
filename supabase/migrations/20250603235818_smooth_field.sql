/*
  # Add Admin User
  
  1. Changes
    - Creates initial admin user with secure password
    - Sets proper admin role in user metadata
*/

-- Create admin user if not exists
DO $$
BEGIN
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
    updated_at
  )
  SELECT
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@fegesport.org',
    crypt('Admin@2025!', gen_salt('bf')),
    now(),
    '{"role": "admin"}'::jsonb,
    now(),
    now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@fegesport.org'
  );
END $$;