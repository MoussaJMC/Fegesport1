/*
  # Fix Document Versions RLS Policies
  
  1. Changes
    - Remove duplicate SELECT policies causing conflicts
    - Simplify to a single public SELECT policy
    - Allow viewing active documents regardless of version status for proper querying
  
  2. Security
    - Public can view all active documents (current and historical versions)
    - Admins can view/manage all documents
*/

-- Drop the old conflicting policies
DROP POLICY IF EXISTS "Anyone can view active current version documents" ON official_documents;
DROP POLICY IF EXISTS "Anyone can view document versions" ON official_documents;

-- Create a single, clear policy for public document access
CREATE POLICY "Public can view active documents"
  ON official_documents
  FOR SELECT
  TO public
  USING (is_active = true);

-- Ensure RLS is enabled
ALTER TABLE official_documents ENABLE ROW LEVEL SECURITY;
