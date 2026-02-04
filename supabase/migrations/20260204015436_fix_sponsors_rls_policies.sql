/*
  # Fix Sponsors RLS Policies

  1. Issues
    - Current policies use direct email check which may not work reliably
    - Should use is_admin() function like other tables
    
  2. Changes
    - Drop existing sponsor policies
    - Recreate using public.is_admin() function
    
  3. Security
    - Public can view active sponsors
    - Admins can view all sponsors (including inactive ones)
    - Admins can manage all sponsors
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active sponsors" ON sponsors;
DROP POLICY IF EXISTS "Admins can view all sponsors" ON sponsors;
DROP POLICY IF EXISTS "Admins can insert sponsors" ON sponsors;
DROP POLICY IF EXISTS "Admins can update sponsors" ON sponsors;
DROP POLICY IF EXISTS "Admins can delete sponsors" ON sponsors;

-- Public can view active sponsors
CREATE POLICY "Anyone can view active sponsors"
  ON sponsors
  FOR SELECT
  USING (is_active = true);

-- Admins can view all sponsors (including inactive)
CREATE POLICY "Admins can view all sponsors"
  ON sponsors
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can insert sponsors
CREATE POLICY "Admins can insert sponsors"
  ON sponsors
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update sponsors
CREATE POLICY "Admins can update sponsors"
  ON sponsors
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete sponsors
CREATE POLICY "Admins can delete sponsors"
  ON sponsors
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
