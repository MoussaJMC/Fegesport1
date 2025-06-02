/*
  # Authentication and Admin Setup

  1. Changes
    - Creates admin role if it doesn't exist
    - Grants necessary permissions to admin role
    - Updates or creates admin user with specified credentials
    - Sets up admin identities

  2. Security
    - Ensures admin role has appropriate permissions
    - Updates existing admin user if already exists
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
    -- Update existing user
    UPDATE auth.users SET
      encrypted_password = crypt('Volatile@123*', gen_salt('bf')),
      email_confirmed_at = NOW(),
      raw_app_meta_data = '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
      raw_user_meta_data = '{"name": "Admin FEGESPORT"}'::jsonb,
      updated_at = NOW()
    WHERE id = existing_user_id
    RETURNING id INTO new_user_id;
  ELSE
    -- Insert new user
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
      encode(gen_random_bytes(32), 'base64'
    )
    RETURNING id INTO new_user_id;

    -- Insert into auth.identities for new user
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
  END IF;
END
$$;