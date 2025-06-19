/*
  # Fix Members Table RLS Policy for Anonymous Registration

  1. Security Updates
    - Drop conflicting RLS policies on members table
    - Create a clear policy for anonymous user registration
    - Ensure proper access control for different user roles

  2. Changes
    - Remove duplicate or conflicting policies
    - Add a simple, clear policy for anonymous registration
    - Maintain security for authenticated operations
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin full access to members" ON members;
DROP POLICY IF EXISTS "Allow anonymous registration" ON members;
DROP POLICY IF EXISTS "Authenticated users can view all members" ON members;
DROP POLICY IF EXISTS "Users can delete own member profile" ON members;
DROP POLICY IF EXISTS "Users can update own member profile" ON members;
DROP POLICY IF EXISTS "Users can view own member profile" ON members;

-- Create new, clear policies

-- Allow anonymous users to register (insert new members)
CREATE POLICY "Allow anonymous member registration"
  ON members
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to view all members
CREATE POLICY "Authenticated users can view members"
  ON members
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to view and update their own member profile
CREATE POLICY "Users can manage own member profile"
  ON members
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin has full access to all members
CREATE POLICY "Admin full access to members"
  ON members
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());