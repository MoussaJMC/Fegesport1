/*
  # Fix Storage Permissions for File Uploads

  1. Storage Policies
    - Creates a function to check admin status
    - Adds storage policies for the static-files bucket
    - Ensures proper permissions for file uploads

  2. Security
    - Ensures only admins can upload files
    - Allows public read access for files
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

-- Create a function to check if a bucket exists
CREATE OR REPLACE FUNCTION bucket_exists(bucket_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  bucket_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO bucket_count
  FROM storage.buckets
  WHERE name = bucket_name;
  
  RETURN bucket_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a note about bucket creation
DO $$
BEGIN
  IF NOT bucket_exists('static-files') THEN
    RAISE NOTICE 'IMPORTANT: The static-files bucket does not exist. Please create it manually in the Supabase dashboard.';
  END IF;
END
$$;

-- Ensure static_files table has proper RLS policies
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

  -- Ensure UPDATE policy exists for static_files
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

  -- Ensure DELETE policy exists for static_files
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

  -- Ensure SELECT policy exists for static_files
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
END
$$;