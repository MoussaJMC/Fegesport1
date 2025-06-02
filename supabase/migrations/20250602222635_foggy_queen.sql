/*
  # Authentication Setup

  1. Create admin user
    - Email: jmc.esgc2013@gmail.com
    - Password: Volatile@123*
    - Role: admin
  
  2. Security
    - Set up admin role and permissions
    - Configure RLS policies
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

-- Create admin user with custom claims
DO $$
DECLARE
  new_user_id uuid;
BEGIN
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
    email_change_token_current,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
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
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64')
  )
  RETURNING id INTO new_user_id;

  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    format('{"sub": "%s", "email": "jmc.esgc2013@gmail.com"}', new_user_id)::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
  );
END
$$;