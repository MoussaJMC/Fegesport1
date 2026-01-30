/*
  # Create Public Member Registration Function
  
  1. Problem
    - RLS policies are blocking anonymous inserts even with WITH CHECK (true)
    - Direct inserts fail with RLS violation
  
  2. Solution
    - Create a SECURITY DEFINER function that bypasses RLS
    - This function will handle member registration safely
    - It will validate input and insert the record with elevated privileges
  
  3. Security
    - Function validates all required fields
    - Uses SECURITY DEFINER to bypass RLS safely
    - Only allows INSERT operations (no updates/deletes)
    - Returns the inserted member ID
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS register_member(jsonb);

-- Create a function for public member registration that bypasses RLS
CREATE OR REPLACE FUNCTION register_member(member_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_member_id uuid;
BEGIN
  -- Validate required fields
  IF NOT (member_data ? 'first_name' AND member_data ? 'last_name' AND member_data ? 'email' AND member_data ? 'member_type') THEN
    RAISE EXCEPTION 'Missing required fields: first_name, last_name, email, member_type';
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
COMMENT ON FUNCTION register_member(jsonb) IS 'Public function to register new members, bypassing RLS for registration purposes';
