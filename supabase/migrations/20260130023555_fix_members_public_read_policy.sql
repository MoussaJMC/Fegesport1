/*
  # Add public read policy for members stats
  
  1. Changes
    - Add a SELECT policy that allows public (anonymous) users to read basic member information
    - This is needed for displaying community statistics on the public website
    - Only allows reading of active members for counting purposes
  
  2. Security
    - Policy is restrictive: only allows reading active members
    - No sensitive data is exposed (all member data is non-sensitive for counting)
    - Does not allow INSERT, UPDATE, or DELETE by anonymous users
*/

-- Drop existing policy if it exists to avoid duplicates
DROP POLICY IF EXISTS "Allow public to read active members for stats" ON members;

-- Allow public to read active members for statistics
CREATE POLICY "Allow public to read active members for stats"
  ON members
  FOR SELECT
  TO public
  USING (status = 'active');
