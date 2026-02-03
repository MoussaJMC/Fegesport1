/*
  # Fix partners SELECT policy for admins

  1. Changes
    - Add SELECT policy for admins to view all partners (active and inactive)
    - Keep public policy for viewing only active partners
  
  2. Security
    - Admins can view all partners regardless of status
    - Public users can only view active partners
    - Required for admins to update partners properly
*/

-- Add admin select policy
CREATE POLICY "Allow admins to view all partners"
  ON partners
  FOR SELECT
  TO authenticated
  USING (is_admin());
