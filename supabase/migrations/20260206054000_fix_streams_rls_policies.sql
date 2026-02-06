/*
  # Fix Streams RLS Policies
  
  1. Changes
    - Add INSERT policy for authenticated admins
    - Add UPDATE policy for authenticated admins
    - Add DELETE policy for authenticated admins
  
  2. Security
    - Only admins can create, update, and delete streams
    - Public can read all streams
    - Uses is_admin() function for authorization
*/

-- Create function to check if user is admin (if not exists)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT email IN (
      'admin@fegesport224.com'
    )
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add INSERT policy for admins
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'streams' AND policyname = 'streams_insert_policy'
  ) THEN
    CREATE POLICY streams_insert_policy ON streams
      FOR INSERT
      TO authenticated
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Add UPDATE policy for admins
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'streams' AND policyname = 'streams_update_policy'
  ) THEN
    CREATE POLICY streams_update_policy ON streams
      FOR UPDATE
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Add DELETE policy for admins
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'streams' AND policyname = 'streams_delete_policy'
  ) THEN
    CREATE POLICY streams_delete_policy ON streams
      FOR DELETE
      TO authenticated
      USING (is_admin());
  END IF;
END $$;