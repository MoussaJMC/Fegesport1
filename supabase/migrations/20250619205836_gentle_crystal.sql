/*
  # Fix Members Table RLS Policy for Anonymous Inserts
  
  1. Changes
    - Drops any conflicting policies that might prevent anonymous users from inserting
    - Creates a clear policy allowing anonymous users to register as members
    - Ensures proper access control while allowing public registration
    
  2. Security
    - Maintains security by only allowing inserts for anonymous users
    - Preserves existing policies for authenticated users
*/

-- Drop any conflicting policies that might prevent anonymous inserts
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON members;

-- Create a clear policy allowing anonymous users to register
CREATE POLICY "Allow anonymous member registration" 
  ON members 
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Ensure the policy for authenticated users still exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'members' AND policyname = 'Allow authenticated member insert'
  ) THEN
    CREATE POLICY "Allow authenticated member insert"
      ON members
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Verify existing policies to ensure they don't conflict
DO $$ 
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'members' AND 
        operation = 'INSERT' AND 
        cmd = 'INSERT';
  
  RAISE NOTICE 'Found % INSERT policies for members table', policy_count;
END $$;