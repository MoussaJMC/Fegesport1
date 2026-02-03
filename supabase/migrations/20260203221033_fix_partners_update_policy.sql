/*
  # Fix partners UPDATE policy

  1. Changes
    - Drop existing UPDATE policy
    - Create new UPDATE policy with both USING and WITH CHECK clauses
    - Ensures proper RLS enforcement for updates
  
  2. Security
    - Admins can update any partner record
    - WITH CHECK ensures data validation on update
*/

-- Drop the existing update policy
DROP POLICY IF EXISTS "Allow admins to update partners" ON partners;

-- Create new update policy with both USING and WITH CHECK
CREATE POLICY "Allow admins to update partners"
  ON partners
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
