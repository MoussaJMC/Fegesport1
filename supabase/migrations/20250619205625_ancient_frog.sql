/*
  # Fix Members Table RLS Policy for Anonymous Inserts

  1. Security Changes
    - Remove restrictive INSERT policy that blocks anonymous users
    - Add new policy allowing anonymous users to insert member records
    - Maintain security by only allowing inserts, not reads/updates/deletes for anonymous users

  2. Changes Made
    - Drop existing restrictive INSERT policy
    - Create new policy allowing public inserts for membership registration
    - Keep existing policies for authenticated operations intact
*/

-- Drop the restrictive INSERT policy that blocks anonymous users
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON members;

-- Create a new policy that allows anonymous users to insert member records
-- This is necessary for the membership registration form
CREATE POLICY "Allow anonymous member registration"
  ON members
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Ensure authenticated users can still insert (for admin purposes)
CREATE POLICY "Allow authenticated member insert"
  ON members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);