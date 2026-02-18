/*
  # Fix Events Update Policy - Use Email-Based Admin Check

  ## Problem
  The previous UPDATE policy uses is_admin() which checks user_metadata role.
  This may not be set correctly for all admin users.
  
  ## Changes
  1. Drop the current update policy
  2. Create a new UPDATE policy that checks for admin email directly
  3. Use the same pattern as other admin policies in the system
  
  ## Security
  - Only authenticated users with admin email can update events
  - WITH CHECK ensures updated data meets security requirements
*/

-- Drop the current policy
DROP POLICY IF EXISTS "Admins can update events" ON events;

-- Create new update policy using email check
CREATE POLICY "Admin can update events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@fegesport.org'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@fegesport.org'
  );
