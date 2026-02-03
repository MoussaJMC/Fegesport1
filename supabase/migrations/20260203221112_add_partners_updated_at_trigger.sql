/*
  # Add updated_at trigger for partners table

  1. Changes
    - Create a function to update updated_at timestamp
    - Add trigger to automatically update updated_at on row updates
  
  2. Purpose
    - Ensures updated_at is automatically set on every update
    - Maintains data integrity without manual intervention
*/

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to partners table
DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;

CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
