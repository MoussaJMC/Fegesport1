/*
  # Fix Events Update Policy

  ## Problem
  The current UPDATE policy for events table is incomplete:
  - Missing WITH CHECK clause required for UPDATE operations
  - Uses auth.role() which may not work correctly in all contexts
  
  ## Changes
  1. Drop the old incomplete update policy
  2. Create a new UPDATE policy with proper USING and WITH CHECK clauses
  3. Use is_admin() function for proper admin verification
  
  ## Security
  - Only authenticated admin users can update events
  - WITH CHECK ensures updated data meets security requirements
*/

-- Drop the old incomplete policy
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON events;

-- Create new comprehensive update policy for admins
CREATE POLICY "Admins can update events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
