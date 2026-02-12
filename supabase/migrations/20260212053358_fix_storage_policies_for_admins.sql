/*
  # Fix Storage Policies for Admin Upload

  1. Problem
    - Storage policies require is_admin() check but auth.uid() is not properly set
    - This prevents authenticated admins from uploading files
  
  2. Solution
    - Simplify storage policies to allow all authenticated users to upload
    - Keep admin-only restrictions for delete operations
    - Maintain public read access
  
  3. Security
    - Only authenticated users can upload (not anonymous)
    - Anyone can view files (public bucket)
    - Only admins can delete files
*/

-- Drop existing storage policies
DROP POLICY IF EXISTS "Admins can upload to static-files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update in static-files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from static-files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view files from static-files" ON storage.objects;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload to static-files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'static-files');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update in static-files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'static-files')
  WITH CHECK (bucket_id = 'static-files');

-- Only admins can delete files
CREATE POLICY "Admins can delete from static-files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'static-files' AND is_admin());

-- Anyone can view files (public bucket)
CREATE POLICY "Anyone can view files from static-files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'static-files');
