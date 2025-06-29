/*
  # Fix Storage Permissions for File Uploads

  1. Storage Policies
    - Creates proper storage policies for the static-files bucket
    - Allows authenticated admin users to upload, update, and delete files
    - Allows public read access to all files in the bucket
  
  2. Security
    - Uses the is_admin() function to verify admin privileges
    - Ensures proper RLS enforcement
*/

-- Ensure is_admin function exists
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has admin role in user_metadata
  RETURN COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin',
    FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage policies for the static-files bucket
-- Note: We're using a different approach that doesn't require direct access to storage.policies
BEGIN;
  -- First, make sure the bucket exists
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('static-files', 'static-files', true)
  ON CONFLICT (id) DO NOTHING;

  -- Create policies for the objects table
  -- Policy for admins to upload files
  CREATE POLICY "Admin users can upload files to static-files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'static-files' AND
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  );

  -- Policy for admins to update files
  CREATE POLICY "Admin users can update files in static-files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'static-files' AND
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  )
  WITH CHECK (
    bucket_id = 'static-files' AND
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  );

  -- Policy for admins to delete files
  CREATE POLICY "Admin users can delete files from static-files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'static-files' AND
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  );

  -- Policy for everyone to read files
  CREATE POLICY "Everyone can read files from static-files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'static-files');
COMMIT;