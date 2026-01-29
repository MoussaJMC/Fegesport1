/*
  # Create JWT Diagnostic Function
  
  ## Purpose
  Create a function to help debug what's in the JWT token
  This will help us understand why RLS policies aren't working
*/

-- Create diagnostic function
CREATE OR REPLACE FUNCTION get_jwt_claims()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN auth.jwt();
END;
$$;

GRANT EXECUTE ON FUNCTION get_jwt_claims TO authenticated;