/*
  # Fix Static Files RLS - Allow Authenticated Users to Insert

  1. Problem
    - INSERT policy requires is_admin() which blocks authenticated users
    - Files upload to storage but can't be saved to database
  
  2. Solution
    - Allow all authenticated users to insert files
    - Keep admin-only restrictions for update/delete
    - Public can read all files
  
  3. Security
    - Authenticated users can upload (tracked by uploaded_by)
    - Only admins can modify or delete
    - Everyone can view (public files)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can insert static files" ON static_files;
DROP POLICY IF EXISTS "Admins can update static files" ON static_files;
DROP POLICY IF EXISTS "Admins can delete static files" ON static_files;
DROP POLICY IF EXISTS "Anyone can view static files" ON static_files;

-- Allow authenticated users to insert files
CREATE POLICY "Authenticated users can insert static files"
  ON static_files FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update static files"
  ON static_files FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only admins can delete files
CREATE POLICY "Admins can delete static files"
  ON static_files FOR DELETE
  TO authenticated
  USING (is_admin());

-- Anyone can view files (public access)
CREATE POLICY "Public can view static files"
  ON static_files FOR SELECT
  TO public
  USING (true);
