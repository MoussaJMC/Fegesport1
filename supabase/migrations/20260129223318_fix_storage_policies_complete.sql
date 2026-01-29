/*
  # Fix Storage Bucket Policies - Complete Solution
  
  1. Issues Fixed
    - Missing WITH CHECK on INSERT policy for storage.objects
    - Inconsistent admin role checking (user_metadata vs raw_user_meta_data)
    - Missing SELECT policy for public access to files
    
  2. Changes
    - DROP all existing storage policies for static-files bucket
    - CREATE consistent policies using auth.uid() and auth.users table
    - Add proper SELECT policy for public access
    - Add INSERT policy with proper admin check
    - Add UPDATE/DELETE policies with proper admin check
    
  3. Security
    - Public files are readable by everyone (bucket is public)
    - Only admins can upload/update/delete files
    - Admin check uses auth.users.raw_user_meta_data for consistency
*/

-- Drop all existing policies for static-files bucket
DROP POLICY IF EXISTS "Admin users can upload files to static-files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update files in static-files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete files from static-files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view public files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own uploaded files" ON storage.objects;
DROP POLICY IF EXISTS "Everyone can read files from static-files" ON storage.objects;

-- Allow everyone to view files from the public bucket
CREATE POLICY "Anyone can view files from static-files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'static-files');

-- Only authenticated admins can upload files
CREATE POLICY "Admins can upload to static-files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'static-files'
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only authenticated admins can update files
CREATE POLICY "Admins can update in static-files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'static-files'
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'static-files'
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only authenticated admins can delete files
CREATE POLICY "Admins can delete from static-files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'static-files'
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
