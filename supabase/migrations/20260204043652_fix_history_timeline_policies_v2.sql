/*
  # Fix History Timeline RLS Policies - V2

  1. Issues
    - Previous policies may not be correctly evaluating the is_admin() function
    - Need to match the pattern used in working tables like news
    
  2. Changes
    - Update policies to use SELECT subquery pattern like news table
    - Simplify WITH CHECK clauses for UPDATE
    
  3. Security
    - Public can view active history entries
    - Admins can view all entries (including inactive)
    - Only admins can insert, update, and delete entries
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active history entries" ON history_timeline;
DROP POLICY IF EXISTS "Admins can view all history entries" ON history_timeline;
DROP POLICY IF EXISTS "Admins can insert history entries" ON history_timeline;
DROP POLICY IF EXISTS "Admins can update history entries" ON history_timeline;
DROP POLICY IF EXISTS "Admins can delete history entries" ON history_timeline;

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
  USING ((SELECT is_admin()));

-- Admins can insert history entries
CREATE POLICY "Admins can insert history entries"
  ON history_timeline
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT is_admin()));

-- Admins can update history entries
CREATE POLICY "Admins can update history entries"
  ON history_timeline
  FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin()));

-- Admins can delete history entries
CREATE POLICY "Admins can delete history entries"
  ON history_timeline
  FOR DELETE
  TO authenticated
  USING ((SELECT is_admin()));
