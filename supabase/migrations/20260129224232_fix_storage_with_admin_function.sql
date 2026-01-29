/*
  # Fix Storage Policies with Admin Check Function
  
  1. Issues
    - Direct query to auth.users in RLS policies may not work reliably in storage context
    - Need a SECURITY DEFINER function to properly check admin status
    
  2. Changes
    - Create is_admin() function with SECURITY DEFINER
    - Recreate storage policies using this function
    - Function checks both auth.uid() and raw_user_meta_data role
    
  3. Security
    - Function is SECURITY DEFINER but only checks current user's own data
    - Safe to use in RLS policies
*/

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (raw_user_meta_data->>'role') = 'admin',
      false
    )
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Anyone can view files from static-files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to static-files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update in static-files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from static-files" ON storage.objects;

-- Allow everyone to view files from the public bucket
CREATE POLICY "Anyone can view files from static-files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'static-files');

-- Only admins can upload files
CREATE POLICY "Admins can upload to static-files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'static-files'
    AND public.is_admin()
  );

-- Only admins can update files
CREATE POLICY "Admins can update in static-files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'static-files'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'static-files'
    AND public.is_admin()
  );

-- Only admins can delete files
CREATE POLICY "Admins can delete from static-files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'static-files'
    AND public.is_admin()
  );
