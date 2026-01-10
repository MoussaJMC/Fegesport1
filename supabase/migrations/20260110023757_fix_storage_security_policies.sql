/*
  # Fix Storage Bucket Security Policies

  ## Issue
  The "Everyone can read files from static-files" policy allows reading ALL files
  from the storage bucket, including private files. This is a security vulnerability.

  ## Fix
  - REMOVE: "Everyone can read files from static-files" (overly permissive)
  - KEEP: "Public can view public files" (checks is_public flag in static_files table)
  - RESULT: Only files marked as public in the static_files table are accessible

  ## Security Impact
  - Private files are now protected from unauthorized access
  - Public files remain accessible as intended
  - Files must be explicitly marked as public to be viewable
*/

-- Remove the overly permissive storage policy
DROP POLICY IF EXISTS "Everyone can read files from static-files" ON storage.objects;

-- Keep the secure policy that checks the is_public flag
-- "Public can view public files" policy already exists and is correct

-- Add a policy for authenticated users to view their own uploaded files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can view own uploaded files'
  ) THEN
    CREATE POLICY "Users can view own uploaded files"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'static-files'
        AND (
          -- File is public
          (EXISTS (
            SELECT 1 FROM static_files
            WHERE static_files.file_url LIKE ('%' || objects.name || '%')
            AND static_files.is_public = true
          ))
          OR
          -- File is uploaded by current user
          (EXISTS (
            SELECT 1 FROM static_files
            WHERE static_files.file_url LIKE ('%' || objects.name || '%')
            AND static_files.uploaded_by = (select auth.uid())
          ))
          OR
          -- User is admin
          is_admin()
        )
      );
  END IF;
END $$;
