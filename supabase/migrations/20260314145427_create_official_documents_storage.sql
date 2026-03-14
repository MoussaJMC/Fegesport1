/*
  # Create Storage Bucket for Official Documents

  1. Storage
    - Create a dedicated bucket 'official-documents' for PDF files
    - Public bucket for easy access (documents are already public on About page)
    - Set file size limit to 50MB
    - Accept only PDF files

  2. Security
    - Enable RLS on storage.objects
    - Admins can upload, update, delete files
    - Public can read files
*/

-- Create the official-documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'official-documents',
  'official-documents',
  true,
  52428800, -- 50MB in bytes
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view official documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload official documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update official documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete official documents" ON storage.objects;

-- Allow public to read/download documents
CREATE POLICY "Public can view official documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'official-documents');

-- Allow authenticated admins to upload documents
CREATE POLICY "Admins can upload official documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'official-documents' AND
  public.is_admin()
);

-- Allow authenticated admins to update documents
CREATE POLICY "Admins can update official documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'official-documents' AND
  public.is_admin()
)
WITH CHECK (
  bucket_id = 'official-documents' AND
  public.is_admin()
);

-- Allow authenticated admins to delete documents
CREATE POLICY "Admins can delete official documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'official-documents' AND
  public.is_admin()
);
