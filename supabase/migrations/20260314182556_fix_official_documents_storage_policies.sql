/*
  # Fix Official Documents Storage Policies

  1. Changes
    - Drop old hardcoded email policies for official-documents storage
    - Create new policies using is_admin() function for consistency
    - Ensure authenticated admins can upload, update, and delete
    - Ensure public can read/view documents

  2. Security
    - Uses is_admin() function for all admin checks
    - Maintains public read access for published documents
*/

-- Drop old policies
DROP POLICY IF EXISTS "Admins can upload official documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update official documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete official documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can view official documents" ON storage.objects;

-- Create new policies using is_admin()
CREATE POLICY "Admin upload official-documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'official-documents' 
  AND is_admin()
);

CREATE POLICY "Admin update official-documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'official-documents' 
  AND is_admin()
)
WITH CHECK (
  bucket_id = 'official-documents' 
  AND is_admin()
);

CREATE POLICY "Admin delete official-documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'official-documents' 
  AND is_admin()
);

CREATE POLICY "Public read official-documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'official-documents');
