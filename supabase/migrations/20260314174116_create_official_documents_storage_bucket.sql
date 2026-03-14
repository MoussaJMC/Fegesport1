/*
  # Create Storage Bucket for Official Documents

  1. Storage Bucket
    - Create 'official-documents' bucket
    - Public bucket (files are publicly accessible)
    - Max file size: 20MB
    - Allowed MIME types: application/pdf

  2. Security Policies
    - Public can read all files
    - Only authenticated admins can upload/update/delete
*/

-- Create storage bucket for official documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'official-documents',
  'official-documents',
  true,
  20971520, -- 20MB in bytes
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view official documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload official documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update official documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete official documents" ON storage.objects;

-- Allow public to read files
CREATE POLICY "Public can view official documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'official-documents');

-- Allow authenticated admins to insert files
CREATE POLICY "Admins can upload official documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'official-documents'
    AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@fegesport224.org', 'contact@fegesport224.org'])
    )
  );

-- Allow authenticated admins to update files
CREATE POLICY "Admins can update official documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'official-documents'
    AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@fegesport224.org', 'contact@fegesport224.org'])
    )
  );

-- Allow authenticated admins to delete files
CREATE POLICY "Admins can delete official documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'official-documents'
    AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@fegesport224.org', 'contact@fegesport224.org'])
    )
  );
