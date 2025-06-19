/*
  # Fix RLS Policies for Anonymous Member Registration

  1. Changes
    - Drop all existing INSERT policies on members table
    - Create a clear policy allowing anonymous users to register
    - Maintain policies for authenticated users
    
  2. Security
    - Allow anonymous registration for membership form
    - Maintain proper access control for other operations
*/

-- Drop all existing INSERT policies on members table to avoid conflicts
DO $$ 
DECLARE
  policy_name text;
BEGIN
  FOR policy_name IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'members' 
    AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON members', policy_name);
  END LOOP;
END $$;

-- Create a clear policy allowing anonymous users to register
CREATE POLICY "Allow anonymous member registration" 
  ON members 
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Create policy for authenticated users to insert members
CREATE POLICY "Allow authenticated member insert"
  ON members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure we maintain the general insert policy for all users
CREATE POLICY "Enable insert for all users"
  ON members
  FOR INSERT
  TO public
  WITH CHECK (true);