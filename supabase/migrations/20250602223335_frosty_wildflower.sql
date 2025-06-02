/*
  # Create admin user and role
  
  1. Creates admin role if it doesn't exist
  2. Grants necessary permissions to admin role
  3. Creates or updates admin user with proper credentials
*/

-- Create admin role if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
    CREATE ROLE admin;
  END IF;
END
$$;

-- Grant admin role necessary permissions
GRANT ALL ON SCHEMA public TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO admin;

-- Update or create admin user with custom claims
DO $$
DECLARE
  new_user_id uuid;
  existing_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO existing_user_id 
  FROM auth.users 
  WHERE email = 'jmc.esgc2013@gmail.com';

  IF existing_user_id IS NOT NULL THEN
    -- Delete existing user and their identities to ensure clean state
    DELETE FROM auth.identities WHERE user_id = existing_user_id;
    DELETE FROM auth.users WHERE id = existing_user_id;
  END IF;

  -- Insert new user
  INSERT INTO auth.users (
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
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'jmc.esgc2013@gmail.com',
    crypt('Volatile@123*', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
    '{"name": "Admin FEGESPORT"}'::jsonb,
    NOW(),
    NOW(),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64')
  )
  RETURNING id INTO new_user_id;

  -- Insert into auth.identities with provider_id
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    format('{"sub": "%s", "email": "jmc.esgc2013@gmail.com"}', new_user_id)::jsonb,
    'email',
    'jmc.esgc2013@gmail.com',
    NOW(),
    NOW(),
    NOW()
  );

  -- Grant admin role to user
  UPDATE auth.users
  SET role = 'admin'
  WHERE id = new_user_id;
END
$$;