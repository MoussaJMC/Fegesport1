/*
  # Create Official Documents Table
  
  1. New Tables
    - `official_documents`
      - `id` (uuid, primary key)
      - `title` (text) - Document title (e.g., "Statuts de la Fédération")
      - `title_en` (text) - English title
      - `description` (text) - Short description in French
      - `description_en` (text) - Short description in English
      - `document_type` (text) - Type: 'statuts', 'reglement', 'other'
      - `file_url` (text) - URL to PDF file in storage
      - `file_size` (integer) - File size in bytes
      - `is_active` (boolean) - Whether document is visible
      - `display_order` (integer) - Display order
      - `version` (text) - Document version (e.g., "v1.0 - 2025")
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `official_documents` table
    - Public can read active documents
    - Only admins can create/update/delete documents
*/

CREATE TABLE IF NOT EXISTS official_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_en text NOT NULL,
  description text DEFAULT '',
  description_en text DEFAULT '',
  document_type text NOT NULL CHECK (document_type IN ('statuts', 'reglement', 'other')),
  file_url text NOT NULL,
  file_size integer DEFAULT 0,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  version text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE official_documents ENABLE ROW LEVEL SECURITY;

-- Public can read active documents
CREATE POLICY "Anyone can view active documents"
  ON official_documents
  FOR SELECT
  USING (is_active = true);

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
  ON official_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@fegesport224.org', 'contact@fegesport224.org'])
    )
  );

-- Admins can insert documents
CREATE POLICY "Admins can insert documents"
  ON official_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@fegesport224.org', 'contact@fegesport224.org'])
    )
  );

-- Admins can update documents
CREATE POLICY "Admins can update documents"
  ON official_documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@fegesport224.org', 'contact@fegesport224.org'])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@fegesport224.org', 'contact@fegesport224.org'])
    )
  );

-- Admins can delete documents
CREATE POLICY "Admins can delete documents"
  ON official_documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@fegesport224.org', 'contact@fegesport224.org'])
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_official_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER update_official_documents_timestamp
  BEFORE UPDATE ON official_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_official_documents_updated_at();

-- Insert default documents (placeholders)
INSERT INTO official_documents (title, title_en, description, description_en, document_type, file_url, display_order, version)
VALUES 
  (
    'Statuts de la Fédération',
    'Federation Statutes',
    'Consulter les statuts officiels de la FEGESPORT',
    'View the official statutes of FEGESPORT',
    'statuts',
    '/media/documents/statuts-fegesport.pdf',
    1,
    'Version 2025'
  ),
  (
    'Règlement Intérieur',
    'Internal Regulations',
    'Consulter le règlement intérieur de la FEGESPORT',
    'View the internal regulations of FEGESPORT',
    'reglement',
    '/media/documents/reglement-interieur-fegesport.pdf',
    2,
    'Version 2025'
  )
ON CONFLICT DO NOTHING;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_official_documents_active ON official_documents(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_official_documents_type ON official_documents(document_type);
