/*
  # Update Static Files Policies to Use is_admin() Function
  
  1. Changes
    - Replace complex admin checks with is_admin() function
    - Consistent with storage policies
    - More reliable and maintainable
    
  2. Security
    - Public can view all static files
    - Only admins can insert/update/delete
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view static files" ON static_files;
DROP POLICY IF EXISTS "Admins can insert static files" ON static_files;
DROP POLICY IF EXISTS "Admins can update static files" ON static_files;
DROP POLICY IF EXISTS "Admins can delete static files" ON static_files;

-- Allow everyone to view static files
CREATE POLICY "Anyone can view static files"
  ON static_files
  FOR SELECT
  TO public
  USING (true);

-- Only admins can insert files
CREATE POLICY "Admins can insert static files"
  ON static_files
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only admins can update files
CREATE POLICY "Admins can update static files"
  ON static_files
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete files
CREATE POLICY "Admins can delete static files"
  ON static_files
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
