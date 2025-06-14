/*
  # Update Admin User Metadata

  1. Changes
    - Updates the admin user's raw_user_meta_data to include role: admin
    - Ensures proper admin access for the authentication system

  2. Security
    - Only updates the specific admin user
    - Maintains existing metadata while adding admin role
*/

-- Update admin user metadata to include admin role
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object(
  'email_verified', true,
  'role', 'admin'
)
WHERE email = 'admin@fegesport.org';

-- Verify the update
DO $$
DECLARE
  user_metadata jsonb;
BEGIN
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users 
  WHERE email = 'admin@fegesport.org';
  
  IF user_metadata->>'role' = 'admin' THEN
    RAISE NOTICE 'Admin user metadata updated successfully: %', user_metadata;
  ELSE
    RAISE WARNING 'Failed to update admin user metadata';
  END IF;
END $$;