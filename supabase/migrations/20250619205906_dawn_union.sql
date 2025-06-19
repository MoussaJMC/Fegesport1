/*
  # Fix Members Table RLS Policy for Anonymous Registration

  1. Changes
    - Drop existing conflicting policies safely
    - Create new policies allowing anonymous member registration
    - Ensure authenticated users can still insert members
    - Maintain existing admin and user-specific policies

  2. Security
    - Allow anonymous users to register as members
    - Maintain RLS for other operations
    - Preserve admin access controls
*/

-- Drop any existing INSERT policies that might conflict
DO $$ 
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'members' 
    AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON members', policy_record.policyname);
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

-- Verify the policies were created successfully
DO $$ 
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'members' AND cmd = 'INSERT';
  
  RAISE NOTICE 'Created % INSERT policies for members table', policy_count;
  
  -- List all INSERT policies for verification
  FOR policy_record IN 
    SELECT policyname, roles 
    FROM pg_policies 
    WHERE tablename = 'members' AND cmd = 'INSERT'
  LOOP
    RAISE NOTICE 'Policy: % for roles: %', policy_record.policyname, policy_record.roles;
  END LOOP;
END $$;