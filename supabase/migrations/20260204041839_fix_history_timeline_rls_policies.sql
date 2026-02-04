/*
  # Fix History Timeline RLS Policies

  1. Issues
    - Current policies use USING (true) which allows any authenticated user to manage history
    - Should use is_admin() function to restrict to admins only
    
  2. Changes
    - Drop existing overly permissive policies
    - Recreate using public.is_admin() function
    - Public can view active entries
    - Only admins can manage entries
    
  3. Security
    - Public can view active history entries
    - Admins can view all entries (including inactive)
    - Only admins can insert, update, and delete entries
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active history timeline entries" ON history_timeline;
DROP POLICY IF EXISTS "Authenticated users can view all history timeline entries" ON history_timeline;
DROP POLICY IF EXISTS "Authenticated users can insert history timeline entries" ON history_timeline;
DROP POLICY IF EXISTS "Authenticated users can update history timeline entries" ON history_timeline;
DROP POLICY IF EXISTS "Authenticated users can delete history timeline entries" ON history_timeline;

-- Public can view active history entries
CREATE POLICY "Anyone can view active history entries"
  ON history_timeline
  FOR SELECT
  USING (is_active = true);

-- Admins can view all history entries (including inactive)
CREATE POLICY "Admins can view all history entries"
  ON history_timeline
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can insert history entries
CREATE POLICY "Admins can insert history entries"
  ON history_timeline
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update history entries
CREATE POLICY "Admins can update history entries"
  ON history_timeline
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete history entries
CREATE POLICY "Admins can delete history entries"
  ON history_timeline
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
