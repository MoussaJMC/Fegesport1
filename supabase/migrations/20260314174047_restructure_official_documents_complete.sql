/*
  # Restructure Official Documents Table

  1. Changes
    - Drop and recreate official_documents with new optimized structure
    - Add fields: id (text primary key), label_fr, label_en, description
    - Add fields: icon, lang, group_name, sort_order
    - Add fields: file_url, file_name, file_size, is_published
    - Add fields: uploaded_at, created_at
    - Remove old fields: title, title_en, document_type, version, etc.

  2. Security
    - Enable RLS
    - Public can only read published documents
    - Authenticated users (admins) have full access

  3. Initial Data
    - Insert 7 documents with proper structure
    - All marked as unpublished (is_published = false)
*/

-- Drop existing table and recreate with new structure
DROP TABLE IF EXISTS official_documents CASCADE;

CREATE TABLE official_documents (
  id TEXT PRIMARY KEY,
  label_fr TEXT NOT NULL,
  label_en TEXT,
  description TEXT,
  icon TEXT DEFAULT '📄',
  lang TEXT DEFAULT 'FR',
  group_name TEXT,
  sort_order INTEGER DEFAULT 0,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  is_published BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE official_documents ENABLE ROW LEVEL SECURITY;

-- Public can only READ published documents
CREATE POLICY "Public read published docs"
  ON official_documents FOR SELECT
  USING (is_published = true);

-- Authenticated users (admins) can do everything
CREATE POLICY "Admin full access"
  ON official_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@fegesport224.org', 'contact@fegesport224.org'])
    )
  );

-- Insert the 7 documents as initial rows
INSERT INTO official_documents 
  (id, label_fr, label_en, icon, lang, group_name, sort_order, is_published)
VALUES
  ('statuts-fr', 'Statuts de la Fédération', 'Federation Statutes', '📋', 'FR', 'Textes Fondateurs', 1, false),
  ('statuts-en', 'Federation Statutes', 'Federation Statutes', '📋', 'EN', 'Textes Fondateurs', 2, false),
  ('reglement-fr', 'Règlement Intérieur', 'Internal Regulations', '📜', 'FR', 'Textes Fondateurs', 3, false),
  ('reglement-en', 'Internal Regulations', 'Internal Regulations', '📜', 'EN', 'Textes Fondateurs', 4, false),
  ('rapport-annuel', 'Rapport Annuel', 'Annual Report', '📊', 'FR', 'Rapports & Plans', 5, false),
  ('plan-strategique', 'Plan Stratégique', 'Strategic Plan', '🎯', 'FR', 'Rapports & Plans', 6, false),
  ('programme-jeunes', 'Programme Développement Jeunes', 'Youth Development Programme', '🌍', 'FR/EN', 'Rapports & Plans', 7, false);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_official_documents_published ON official_documents(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_official_documents_group ON official_documents(group_name);
