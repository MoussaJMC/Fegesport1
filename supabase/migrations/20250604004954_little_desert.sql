/*
  # Admin Authentication Setup
  
  1. New Functions
    - public.is_admin() - Checks if current user has admin role
    - public.get_user_role() - Gets the current user's role
  
  2. Security
    - Functions are marked as SECURITY DEFINER to run with elevated privileges
    - Proper error handling and input validation
*/

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'role' 
     FROM auth.users 
     WHERE id = auth.uid()),
    'user'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (SELECT get_user_role() = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policy helper function
CREATE OR REPLACE FUNCTION public.require_admin()
RETURNS boolean AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;