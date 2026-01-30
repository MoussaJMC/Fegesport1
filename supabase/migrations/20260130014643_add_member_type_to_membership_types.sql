/*
  # Add member_type column to membership_types table
  
  1. Problem
    - membership_types table uses UUIDs as IDs
    - members table expects 'player', 'club', or 'partner' in member_type field
    - Need explicit mapping between membership_types and valid member_type values
  
  2. Changes
    - Add member_type column to membership_types table
    - Update existing records with correct member_type values
    - Add CHECK constraint to ensure valid values
  
  3. Security
    - No RLS changes needed
    - Maintains data integrity with CHECK constraint
*/

-- Add member_type column to membership_types if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_types' AND column_name = 'member_type'
  ) THEN
    ALTER TABLE membership_types 
    ADD COLUMN member_type text NOT NULL DEFAULT 'player'
    CHECK (member_type IN ('player', 'club', 'partner'));
  END IF;
END $$;

-- Update existing records with correct member_type based on their names
UPDATE membership_types
SET member_type = CASE
  WHEN LOWER(name) LIKE '%joueur%' OR LOWER(name) LIKE '%player%' THEN 'player'
  WHEN LOWER(name) LIKE '%club%' THEN 'club'
  WHEN LOWER(name) LIKE '%partenaire%' OR LOWER(name) LIKE '%partner%' THEN 'partner'
  ELSE 'player'
END
WHERE member_type IS NULL OR member_type = 'player';

-- Add comment for documentation
COMMENT ON COLUMN membership_types.member_type IS 'Type of member this membership creates: player, club, or partner';
