/*
  # Fix File Upload RLS Policies

  1. Storage Setup
    - Create static-files storage bucket if it doesn't exist
    - Set up RLS policies for storage bucket

  2. Database Policies
    - Ensure proper RLS policies for static_files table
    - Add missing INSERT policy for authenticated users

  3. Helper Functions
    - Ensure is_admin() function exists and works properly
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('static-files', 'static-files', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage policies for static-files bucket
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Allow admins to upload to static-files bucket" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public read access to static-files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow admins to delete from static-files bucket" ON storage.objects;
  DROP POLICY IF EXISTS "Allow admins to update static-files bucket" ON storage.objects;
END $$;

-- Allow admins to upload files
CREATE POLICY "Allow admins to upload to static-files bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'static-files' AND 
    is_admin()
  );

-- Allow public read access to files
CREATE POLICY "Allow public read access to static-files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'static-files');

-- Allow admins to delete files
CREATE POLICY "Allow admins to delete from static-files bucket"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'static-files' AND 
    is_admin()
  );

-- Allow admins to update files
CREATE POLICY "Allow admins to update static-files bucket"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'static-files' AND 
    is_admin()
  )
  WITH CHECK (
    bucket_id = 'static-files' AND 
    is_admin()
  );

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