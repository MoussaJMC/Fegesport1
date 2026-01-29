/*
  # Fix Static Files RLS - Use auth.uid() Instead of Email
  
  1. Changes
    - Replace email-based admin check with uid-based check
    - More reliable and performant
    - Fixes insert permission issues
    
  This allows:
  - Everyone can view static files
  - Only authenticated admins (via raw_user_meta_data) can manage files
*/

-- Drop existing policies
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
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only authenticated admins can update files
CREATE POLICY "Admins can update static files"
  ON static_files
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only authenticated admins can delete files
CREATE POLICY "Admins can delete static files"
  ON static_files
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );