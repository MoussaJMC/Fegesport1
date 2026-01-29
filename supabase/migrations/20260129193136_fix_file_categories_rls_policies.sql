/*
  # Fix File Categories RLS Policies
  
  1. Security Changes
    - Add SELECT policy for all users (categories are public data)
    - Add INSERT/UPDATE/DELETE policies for authenticated admin users
    
  This allows:
  - Everyone can view file categories
  - Only authenticated admins can manage categories
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view file categories" ON file_categories;
DROP POLICY IF EXISTS "Admins can insert file categories" ON file_categories;
DROP POLICY IF EXISTS "Admins can update file categories" ON file_categories;
DROP POLICY IF EXISTS "Admins can delete file categories" ON file_categories;

-- Allow everyone to view file categories (they are public reference data)
CREATE POLICY "Anyone can view file categories"
  ON file_categories
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated admins can insert categories
CREATE POLICY "Admins can insert file categories"
  ON file_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT COALESCE((auth.jwt()->>'email'), '') IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ))
  );

-- Only authenticated admins can update categories
CREATE POLICY "Admins can update file categories"
  ON file_categories
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

-- Only authenticated admins can delete categories
CREATE POLICY "Admins can delete file categories"
  ON file_categories
  FOR DELETE
  TO authenticated
  USING (
    (SELECT COALESCE((auth.jwt()->>'email'), '') IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ))
  );