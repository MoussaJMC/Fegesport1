/*
  # Fix Official Documents Admin Access

  1. Changes
    - Drop existing admin policy that may not work correctly
    - Create new admin policies using the is_admin() function
    - Ensure admins can read ALL documents (published or not)

  2. Security
    - Admins can read all documents
    - Public can only read published documents
*/

-- Drop existing admin policy
DROP POLICY IF EXISTS "Admin full access" ON official_documents;

-- Create separate policies for admins
CREATE POLICY "Admins can read all documents"
  ON official_documents
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert documents"
  ON official_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update documents"
  ON official_documents
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete documents"
  ON official_documents
  FOR DELETE
  TO authenticated
  USING (is_admin());
