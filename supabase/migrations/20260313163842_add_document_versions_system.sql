/*
  # Add Document Versions System
  
  1. Changes
    - Add `parent_document_id` to track document relationships
    - Add `is_current_version` to mark the active version
    - Add `version_number` for easier tracking
    - Add `published_at` for version release date
    - Update indexes for better query performance
    - Update RLS policies to handle versioning
  
  2. Description
    This migration adds a versioning system to official documents, allowing:
    - Multiple versions of the same document
    - One active/current version displayed by default
    - Historical versions accessible
    - Version comparison and rollback capabilities
*/

-- Add new columns for versioning
ALTER TABLE official_documents 
ADD COLUMN IF NOT EXISTS parent_document_id uuid REFERENCES official_documents(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_current_version boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS version_number text DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS published_at timestamptz DEFAULT now();

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'official_documents_parent_document_id_fkey'
    AND table_name = 'official_documents'
  ) THEN
    ALTER TABLE official_documents
    ADD CONSTRAINT official_documents_parent_document_id_fkey 
    FOREIGN KEY (parent_document_id) REFERENCES official_documents(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_official_documents_parent_id ON official_documents(parent_document_id);
CREATE INDEX IF NOT EXISTS idx_official_documents_current_version ON official_documents(is_current_version) WHERE is_current_version = true;
CREATE INDEX IF NOT EXISTS idx_official_documents_published ON official_documents(published_at DESC);

-- Update existing documents to set them as current versions
UPDATE official_documents 
SET is_current_version = true, version_number = version, published_at = created_at
WHERE parent_document_id IS NULL AND is_current_version IS NULL;

-- Create a function to get all versions of a document
CREATE OR REPLACE FUNCTION get_document_versions(doc_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  title_en text,
  version_number text,
  is_current_version boolean,
  published_at timestamptz,
  file_url text,
  file_size integer
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Get the parent document ID
  DECLARE
    parent_id uuid;
  BEGIN
    SELECT COALESCE(parent_document_id, id) INTO parent_id
    FROM official_documents
    WHERE official_documents.id = doc_id;
    
    -- Return all versions (including the parent)
    RETURN QUERY
    SELECT 
      d.id,
      d.title,
      d.title_en,
      d.version_number,
      d.is_current_version,
      d.published_at,
      d.file_url,
      d.file_size
    FROM official_documents d
    WHERE d.id = parent_id OR d.parent_document_id = parent_id
    ORDER BY d.published_at DESC;
  END;
END;
$$;

-- Create a function to set current version
CREATE OR REPLACE FUNCTION set_current_document_version(doc_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  parent_id uuid;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email = ANY(ARRAY['admin@fegesport224.org', 'contact@fegesport224.org'])
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Get the parent document ID
  SELECT COALESCE(parent_document_id, id) INTO parent_id
  FROM official_documents
  WHERE id = doc_id;
  
  -- Set all versions to not current
  UPDATE official_documents
  SET is_current_version = false
  WHERE id = parent_id OR parent_document_id = parent_id;
  
  -- Set the selected version as current
  UPDATE official_documents
  SET is_current_version = true
  WHERE id = doc_id;
END;
$$;

-- Update public read policy to show current versions by default
DROP POLICY IF EXISTS "Anyone can view active documents" ON official_documents;

CREATE POLICY "Anyone can view active current version documents"
  ON official_documents
  FOR SELECT
  USING (is_active = true AND is_current_version = true);

-- Allow public to view all versions of a document if parent is active
CREATE POLICY "Anyone can view document versions"
  ON official_documents
  FOR SELECT
  USING (
    is_active = true 
    OR 
    EXISTS (
      SELECT 1 FROM official_documents parent
      WHERE parent.id = official_documents.parent_document_id
      AND parent.is_active = true
    )
  );

-- Comment for clarity
COMMENT ON COLUMN official_documents.parent_document_id IS 'Links to the original document if this is a new version';
COMMENT ON COLUMN official_documents.is_current_version IS 'Marks the currently active/displayed version';
COMMENT ON COLUMN official_documents.version_number IS 'Version identifier (e.g., 1.0, 2.0, 2025, 2026)';
COMMENT ON COLUMN official_documents.published_at IS 'When this version was published/released';
