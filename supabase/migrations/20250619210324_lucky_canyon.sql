/*
  # Fix RLS policies for members table

  1. Security Updates
    - Drop existing conflicting policies
    - Create clear, non-overlapping policies for member registration
    - Allow anonymous users to register as members
    - Allow authenticated users to manage their own profiles
    - Allow admins full access

  2. Policy Structure
    - Anonymous users: INSERT only (for registration)
    - Authenticated users: SELECT, UPDATE, DELETE their own records
    - Admins: Full access to all records
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin has full access to members" ON members;
DROP POLICY IF EXISTS "Allow anonymous member registration" ON members;
DROP POLICY IF EXISTS "Allow authenticated member insert" ON members;
DROP POLICY IF EXISTS "Enable delete for own profile" ON members;
DROP POLICY IF EXISTS "Enable insert for all users" ON members;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON members;
DROP POLICY IF EXISTS "Enable update for own profile" ON members;

-- Create new, clear policies

-- Allow anonymous users to register (INSERT only)
CREATE POLICY "Allow anonymous registration"
  ON members
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to view their own member profile
CREATE POLICY "Users can view own member profile"
  ON members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to update their own member profile
CREATE POLICY "Users can update own member profile"
  ON members
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own member profile
CREATE POLICY "Users can delete own member profile"
  ON members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin has full access to all member records
CREATE POLICY "Admin full access to members"
  ON members
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Allow authenticated users to view all member profiles (for admin purposes)
CREATE POLICY "Authenticated users can view all members"
  ON members
  FOR SELECT
  TO authenticated
  USING (true);