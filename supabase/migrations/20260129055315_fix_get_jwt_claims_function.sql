/*
  # Fix get_jwt_claims Function
  
  ## Problem
  The current function uses auth.jwt() which may not work correctly in all contexts
  
  ## Solution
  Use current_setting('request.jwt.claims') instead, which is the standard way to access JWT claims
  
  ## Changes
  - Update get_jwt_claims() to use current_setting
*/

CREATE OR REPLACE FUNCTION public.get_jwt_claims()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN COALESCE(
    nullif(current_setting('request.jwt.claims', true), '')::json,
    '{}'::json
  );
END;
$$;