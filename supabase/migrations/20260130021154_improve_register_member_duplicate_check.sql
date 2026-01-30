/*
  # Improve register_member function to check for duplicate emails
  
  1. Changes
    - Add check for existing email before attempting insert
    - Return a clear error message if email already exists
    - This prevents the generic "duplicate key" constraint error
  
  2. Security
    - Maintains SECURITY DEFINER to bypass RLS
    - Validates all input before processing
    - Provides clear error messages
*/

-- Drop existing function
DROP FUNCTION IF EXISTS register_member(jsonb);

-- Create improved function with duplicate email check
CREATE OR REPLACE FUNCTION register_member(member_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_member_id uuid;
  existing_email_count integer;
BEGIN
  -- Validate required fields
  IF NOT (member_data ? 'first_name' AND member_data ? 'last_name' AND member_data ? 'email' AND member_data ? 'member_type') THEN
    RAISE EXCEPTION 'Missing required fields: first_name, last_name, email, member_type';
  END IF;

  -- Check if email already exists
  SELECT COUNT(*) INTO existing_email_count
  FROM members
  WHERE email = member_data->>'email';

  IF existing_email_count > 0 THEN
    RAISE EXCEPTION 'Un membre avec cet email existe déjà';
  END IF;

  -- Insert the member record
  INSERT INTO members (
    first_name,
    last_name,
    email,
    phone,
    address,
    city,
    member_type,
    status,
    membership_start,
    membership_end,
    age_category
  ) VALUES (
    member_data->>'first_name',
    member_data->>'last_name',
    member_data->>'email',
    member_data->>'phone',
    member_data->>'address',
    member_data->>'city',
    member_data->>'member_type',
    COALESCE(member_data->>'status', 'active'),
    COALESCE((member_data->>'membership_start')::date, CURRENT_DATE),
    COALESCE((member_data->>'membership_end')::date, CURRENT_DATE + INTERVAL '1 year'),
    member_data->>'age_category'
  )
  RETURNING id INTO new_member_id;

  RETURN new_member_id;
END;
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION register_member(jsonb) TO anon, authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION register_member(jsonb) IS 'Public function to register new members with duplicate email checking, bypassing RLS for registration purposes';
