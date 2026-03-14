/*
  # Update Official Documents Structure

  1. Changes
    - Add `icon` column for document emoji icon
    - Add `lang` column for document language (FR, EN, FR/EN)
    - Add `group_name` column for grouping documents
    - Update `document_type` CHECK constraint to support new types
    - Update existing data with proper icons, languages and groups

  2. New document types
    - statuts-fr: Statuts de la Fédération (FR)
    - statuts-en: Federation Statutes (EN)
    - reglement-fr: Règlement Intérieur (FR)
    - reglement-en: Internal Regulations (EN)
    - rapport-annuel: Rapport Annuel (FR)
    - plan-strategique: Plan Stratégique (FR)
    - programme-jeunes: Programme Développement Jeunes (FR/EN)

  3. Groups
    - "Textes Fondateurs": statuts-fr, statuts-en, reglement-fr, reglement-en
    - "Rapports & Plans": rapport-annuel, plan-strategique, programme-jeunes
*/

-- Add new columns
ALTER TABLE official_documents
ADD COLUMN IF NOT EXISTS icon text DEFAULT '📋',
ADD COLUMN IF NOT EXISTS lang text DEFAULT 'FR',
ADD COLUMN IF NOT EXISTS group_name text DEFAULT 'Textes Fondateurs';

-- Drop existing CHECK constraint on document_type
ALTER TABLE official_documents
DROP CONSTRAINT IF EXISTS official_documents_document_type_check;

-- Add new CHECK constraint with updated types
ALTER TABLE official_documents
ADD CONSTRAINT official_documents_document_type_check
CHECK (document_type IN (
  'statuts-fr', 'statuts-en',
  'reglement-fr', 'reglement-en',
  'rapport-annuel', 'plan-strategique', 'programme-jeunes',
  -- Keep old types for backward compatibility
  'statuts', 'reglement', 'other'
));

-- Update existing documents to use new structure
UPDATE official_documents
SET
  document_type = CASE
    WHEN document_type = 'statuts' THEN 'statuts-fr'
    WHEN document_type = 'reglement' THEN 'reglement-fr'
    ELSE document_type
  END,
  icon = CASE
    WHEN document_type = 'statuts' THEN '📋'
    WHEN document_type = 'reglement' THEN '📜'
    ELSE '📋'
  END,
  lang = 'FR',
  group_name = 'Textes Fondateurs'
WHERE document_type IN ('statuts', 'reglement');

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_official_documents_lang ON official_documents(lang);
CREATE INDEX IF NOT EXISTS idx_official_documents_group ON official_documents(group_name);
