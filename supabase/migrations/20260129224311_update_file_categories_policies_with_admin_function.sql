/*
  # Update File Categories Policies to Use is_admin() Function
  
  1. Changes
    - Replace complex email-based admin checks with is_admin() function
    - Consistent with storage and static_files policies
    - More reliable and maintainable
    
  2. Security
    - Public can view all file categories
    - Only admins can insert/update/delete
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view file categories" ON file_categories;
DROP POLICY IF EXISTS "Admins can insert file categories" ON file_categories;
DROP POLICY IF EXISTS "Admins can update file categories" ON file_categories;
DROP POLICY IF EXISTS "Admins can delete file categories" ON file_categories;

-- Allow everyone to view file categories
CREATE POLICY "Anyone can view file categories"
  ON file_categories
  FOR SELECT
  TO public
  USING (true);

-- Only admins can insert categories
CREATE POLICY "Admins can insert file categories"
  ON file_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only admins can update categories
CREATE POLICY "Admins can update file categories"
  ON file_categories
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete categories
CREATE POLICY "Admins can delete file categories"
  ON file_categories
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
