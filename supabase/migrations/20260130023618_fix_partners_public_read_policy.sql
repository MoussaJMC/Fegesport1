/*
  # Add public read policy for partners
  
  1. Changes
    - Add a SELECT policy that allows public (anonymous) users to read active partners
    - This is needed for displaying partners on the public website and for statistics
  
  2. Security
    - Policy is restrictive: only allows reading active partners
    - Partners information is meant to be public for display on the website
    - Does not allow INSERT, UPDATE, or DELETE by anonymous users
*/

-- Allow public to read active partners
CREATE POLICY "Allow public to read active partners"
  ON partners
  FOR SELECT
  TO public
  USING (status = 'active');

-- Allow admins to manage partners
CREATE POLICY "Allow admins to insert partners"
  ON partners
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.email IN ('test@example.com', 'admin@fegesport.org', 'admin@fegesport.com', 'contact@fegesport.org')
    )
  );

CREATE POLICY "Allow admins to update partners"
  ON partners
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.email IN ('test@example.com', 'admin@fegesport.org', 'admin@fegesport.com', 'contact@fegesport.org')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.email IN ('test@example.com', 'admin@fegesport.org', 'admin@fegesport.com', 'contact@fegesport.org')
    )
  );

CREATE POLICY "Allow admins to delete partners"
  ON partners
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.email IN ('test@example.com', 'admin@fegesport.org', 'admin@fegesport.com', 'contact@fegesport.org')
    )
  );
