/*
  # Fix Events Update Policy - Remove Conflicting Policy

  ## Problem
  There are two UPDATE policies on the events table:
  1. "Admin can update events" - uses email check (works)
  2. "events_admin_all" - uses is_admin() function (fails)
  
  Both policies must pass for an UPDATE to succeed, causing the error:
  "new row violates row-level security policy for table events"
  
  ## Changes
  1. Drop the old conflicting "events_admin_all" policy
  2. Create separate admin policies for INSERT and DELETE
  3. Keep the new email-based UPDATE policy
  
  ## Security
  - Only admin@fegesport.org can insert, update, or delete events
  - Public users can only SELECT non-cancelled events
*/

-- Drop the conflicting policy
DROP POLICY IF EXISTS "events_admin_all" ON events;

-- Create INSERT policy for admin
CREATE POLICY "Admin can insert events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@fegesport.org'
  );

-- Create DELETE policy for admin
CREATE POLICY "Admin can delete events"
  ON events
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@fegesport.org'
  );

-- Create SELECT policy for admin (can see all events including cancelled)
CREATE POLICY "Admin can view all events"
  ON events
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@fegesport.org'
  );
