/*
  # Restrict Storage Uploads to Admin Users Only

  1. Security Changes
    - Drop existing permissive storage policies that allow all authenticated users to upload
    - Create new restrictive policies that only allow admin users to upload files
    - Maintain public read access for published content
    - Only admins can delete files

  2. Storage Policies Updated
    - INSERT: Only admin users can upload files
    - DELETE: Only admin users can delete files
    - SELECT: Public can view files (read-only)
    - UPDATE: Only admin users can update file metadata

  ## IMPORTANT
  This migration enhances security by preventing storage abuse and quota exhaustion.
  Only users with admin privileges (verified via is_admin() function) can upload files.
*/

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can upload to static-files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view static files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete static files" ON storage.objects;

-- Create new restrictive policies for static-files bucket

-- Only admins can upload files
CREATE POLICY "Only admins can upload to static-files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'static-files' 
    AND is_admin()
  );

-- Public read access (unchanged for published content)
CREATE POLICY "Public can view static-files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'static-files');

-- Only admins can delete files
CREATE POLICY "Only admins can delete static-files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'static-files' 
    AND is_admin()
  );

-- Only admins can update file metadata
CREATE POLICY "Only admins can update static-files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'static-files' 
    AND is_admin()
  )
  WITH CHECK (
    bucket_id = 'static-files' 
    AND is_admin()
  );
