/*
  # Secure Storage Bucket Policies

  ## Overview
  This migration adds comprehensive security policies for the storage bucket to prevent unauthorized file access and manipulation.

  ## Security Improvements

  ### 1. **File Upload Restrictions**
  - Only authenticated admin users can upload files
  - File size limits enforced (50MB max)
  - MIME type validation at storage level

  ### 2. **File Access Control**
  - Public read access only for files marked as public in static_files table
  - Admin users can access all files
  - Authenticated users have limited access

  ### 3. **File Deletion Protection**
  - Only admin users can delete files
  - Prevents accidental or malicious file deletion

  ### 4. **File Update Security**
  - Only admin users can update file metadata
  - Prevents unauthorized file replacement

  ## Changes Applied

  1. Create storage policies for objects table
  2. Implement file upload restrictions
  3. Add file access controls based on RLS
  4. Protect against unauthorized deletion
  5. Secure file updates to admin only
*/

-- ============================================================================
-- STORAGE BUCKET SECURITY POLICIES
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admin can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view public files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view files" ON storage.objects;

-- ============================================================================
-- 1. FILE UPLOAD POLICY - Admin Only
-- ============================================================================

CREATE POLICY "Admin can upload files to static-files bucket"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (
    bucket_id = 'static-files'
    AND is_admin()
    -- Additional file size check is enforced at application level
  );

-- ============================================================================
-- 2. FILE READ POLICIES - Tiered Access
-- ============================================================================

-- Public can view files that are marked as public in static_files table
CREATE POLICY "Public can view public files"
  ON storage.objects FOR SELECT
  TO public
  USING (
    bucket_id = 'static-files'
    AND (
      -- Check if file is marked as public in static_files table
      EXISTS (
        SELECT 1 FROM public.static_files
        WHERE static_files.file_url LIKE '%' || storage.objects.name || '%'
        AND static_files.is_public = true
      )
      OR is_admin() -- Admins can see all files
    )
  );

-- ============================================================================
-- 3. FILE UPDATE POLICY - Admin Only
-- ============================================================================

CREATE POLICY "Admin can update files"
  ON storage.objects FOR UPDATE
  TO public
  USING (
    bucket_id = 'static-files'
    AND is_admin()
  )
  WITH CHECK (
    bucket_id = 'static-files'
    AND is_admin()
  );

-- ============================================================================
-- 4. FILE DELETE POLICY - Admin Only
-- ============================================================================

CREATE POLICY "Admin can delete files"
  ON storage.objects FOR DELETE
  TO public
  USING (
    bucket_id = 'static-files'
    AND is_admin()
  );

-- ============================================================================
-- 5. BUCKET CONFIGURATION - Enforce Limits
-- ============================================================================

-- Update bucket to enforce file size and MIME type restrictions
UPDATE storage.buckets
SET 
  file_size_limit = 52428800, -- 50MB in bytes
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'text/plain',
    'text/csv',
    'application/json'
  ]
WHERE id = 'static-files';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- To verify storage policies:
-- SELECT schemaname, tablename, policyname, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'storage'
-- ORDER BY tablename, policyname;
