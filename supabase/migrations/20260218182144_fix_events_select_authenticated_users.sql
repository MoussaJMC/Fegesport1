/*
  # Fix Events SELECT Policy for Authenticated Users
  
  ## Problem
  The current RLS policies on the events table only allow:
  - Public users to SELECT non-cancelled events
  - Admin (admin@fegesport.org) to SELECT all events
  
  This means authenticated non-admin users cannot view events at all.
  
  ## Changes
  Add a SELECT policy for authenticated users (including admin) to view all events
  
  ## Security
  - Authenticated users can view all events (including cancelled ones for context)
  - Public users can only view non-cancelled events
  - Only admin can INSERT, UPDATE, DELETE
*/

-- Create SELECT policy for all authenticated users
CREATE POLICY "Authenticated users can view all events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);
