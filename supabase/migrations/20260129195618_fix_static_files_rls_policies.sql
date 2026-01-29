/*
  # Fix Static Files RLS Policies
  
  1. Security Changes
    - Add SELECT policy for all users (files are publicly accessible)
    - Add INSERT/UPDATE/DELETE policies for authenticated admin users
    
  This allows:
  - Everyone can view static files
  - Only authenticated admins can manage files
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view static files" ON static_files;
DROP POLICY IF EXISTS "Admins can insert static files" ON static_files;
DROP POLICY IF EXISTS "Admins can update static files" ON static_files;
DROP POLICY IF EXISTS "Admins can delete static files" ON static_files;

-- Allow everyone to view static files (they are public content)
CREATE POLICY "Anyone can view static files"
  ON static_files
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated admins can insert files
CREATE POLICY "Admins can insert static files"
  ON static_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT COALESCE((auth.jwt()->>'email'), '') IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ))
  );

-- Only authenticated admins can update files
CREATE POLICY "Admins can update static files"
  ON static_files
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT COALESCE((auth.jwt()->>'email'), '') IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ))
  )
  WITH CHECK (
    (SELECT COALESCE((auth.jwt()->>'email'), '') IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ))
  );

-- Only authenticated admins can delete files
CREATE POLICY "Admins can delete static files"
  ON static_files
  FOR DELETE
  TO authenticated
  USING (
    (SELECT COALESCE((auth.jwt()->>'email'), '') IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ))
  );