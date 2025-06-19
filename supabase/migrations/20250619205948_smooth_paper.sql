/*
  # Fix Members Table RLS Policies for Anonymous Registration

  1. Changes
    - Drop existing INSERT policies that might conflict
    - Create new policies allowing anonymous member registration
    - Ensure authenticated users can also insert members
    - Add general policy for all users

  2. Security
    - Allow anonymous users to register as members
    - Maintain security for other operations
    - Enable proper member registration flow
*/

-- Drop any existing INSERT policies that might conflict
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

-- Verify the policies were created successfully
DO $$ 
DECLARE
  policy_count integer;
  policy_name text;
  policy_roles text[];
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'members' AND cmd = 'INSERT';
  
  RAISE NOTICE 'Created % INSERT policies for members table', policy_count;
  
  -- List all INSERT policies for verification
  FOR policy_name, policy_roles IN 
    SELECT policyname, roles 
    FROM pg_policies 
    WHERE tablename = 'members' AND cmd = 'INSERT'
  LOOP
    RAISE NOTICE 'Policy: % for roles: %', policy_name, policy_roles;
  END LOOP;
END $$;