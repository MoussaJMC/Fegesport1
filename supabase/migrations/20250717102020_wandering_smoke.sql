/*
  # Fix member registration policies

  1. Changes
     - Conditionally create the anonymous member registration policy only if it doesn't exist
     - Conditionally create the authenticated member insert policy only if it doesn't exist
     - Add a general insert policy for all users if needed
  
  2. Security
     - Maintains proper access control for member registration
     - Prevents duplicate policy errors
*/

-- Conditionally create anonymous registration policy only if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'members' AND policyname = 'Allow anonymous member registration'
  ) THEN
    CREATE POLICY "Allow anonymous member registration" 
      ON members 
      FOR INSERT 
      TO anon 
      WITH CHECK (true);
    RAISE NOTICE 'Created anonymous member registration policy';
  ELSE
    RAISE NOTICE 'Anonymous member registration policy already exists';
  END IF;
END $$;

-- Conditionally create authenticated user insert policy only if it doesn't exist
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
    RAISE NOTICE 'Created authenticated member insert policy';
  ELSE
    RAISE NOTICE 'Authenticated member insert policy already exists';
  END IF;
END $$;

-- Ensure there's a general insert policy for all users if needed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'members' AND policyname = 'Enable insert for all users'
  ) THEN
    CREATE POLICY "Enable insert for all users"
      ON members
      FOR INSERT
      TO public
      WITH CHECK (true);
    RAISE NOTICE 'Created general insert policy for all users';
  ELSE
    RAISE NOTICE 'General insert policy for all users already exists';
  END IF;
END $$;

-- Log existing policies for verification
DO $$ 
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'members' AND 
        operation = 'INSERT';
  
  RAISE NOTICE 'Found % INSERT policies for members table', policy_count;
END $$;