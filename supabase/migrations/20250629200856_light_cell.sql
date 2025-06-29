/*
  # Fix file upload permissions

  1. New Functions
    - `is_admin()` function to check if user has admin role
  
  2. Table Policies
    - Add policies for static_files table to allow admin operations
    
  Note: This migration avoids direct modification of storage.objects table
  which requires superuser privileges. Storage bucket permissions should be
  configured through the Supabase dashboard instead.
*/

-- Ensure is_admin function exists
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has admin role in user_metadata
  RETURN COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin',
    FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add missing INSERT policy for static_files table if it doesn't exist
DO $$
BEGIN
  -- Check if the INSERT policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'static_files' 
    AND policyname = 'Allow admins to insert static files'
  ) THEN
    CREATE POLICY "Allow admins to insert static files"
      ON public.static_files
      FOR INSERT
      TO authenticated
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Ensure UPDATE policy exists for static_files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'static_files' 
    AND policyname = 'Allow admins to update static files'
  ) THEN
    CREATE POLICY "Allow admins to update static files"
      ON public.static_files
      FOR UPDATE
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Ensure DELETE policy exists for static_files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'static_files' 
    AND policyname = 'Allow admins to delete static files'
  ) THEN
    CREATE POLICY "Allow admins to delete static files"
      ON public.static_files
      FOR DELETE
      TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- Ensure SELECT policy exists for static_files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'static_files' 
    AND policyname = 'Public can view public files'
  ) THEN
    CREATE POLICY "Public can view public files"
      ON public.static_files
      FOR SELECT
      TO public
      USING (is_public = true);
  END IF;
END $$;

-- Ensure SELECT policy exists for admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'static_files' 
    AND policyname = 'Admin has full access to static_files'
  ) THEN
    CREATE POLICY "Admin has full access to static_files"
      ON public.static_files
      FOR ALL
      TO authenticated
      USING (is_admin());
  END IF;
END $$;