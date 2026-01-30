/*
  # Fix Members Table RLS Policies
  
  1. Problem
    - The members table has RLS enabled but no policies defined
    - This prevents anyone from inserting, updating, or reading member data
    - Registration form fails when trying to insert new members
  
  2. Solution - Add RLS Policies
    - Allow anonymous users to insert their own member registration
    - Allow authenticated users to read their own member data
    - Allow administrators to manage all members (CRUD operations)
  
  3. Security
    - Anonymous users can only INSERT (for registration)
    - Users can only read their own data
    - Only admins can update/delete member records
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anonymous member registration" ON members;
DROP POLICY IF EXISTS "Allow users to read own member data" ON members;
DROP POLICY IF EXISTS "Allow admins to read all members" ON members;
DROP POLICY IF EXISTS "Allow admins to insert members" ON members;
DROP POLICY IF EXISTS "Allow admins to update members" ON members;
DROP POLICY IF EXISTS "Allow admins to delete members" ON members;

-- Allow anonymous users to insert their own member registration
CREATE POLICY "Allow anonymous member registration"
  ON members
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read their own member data
CREATE POLICY "Allow users to read own member data"
  ON members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR email = auth.jwt()->>'email');

-- Allow admins to read all members
CREATE POLICY "Allow admins to read all members"
  ON members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'admin@fegesport.com',
        'contact@fegesport.org'
      )
    )
  );

-- Allow admins to insert members
CREATE POLICY "Allow admins to insert members"
  ON members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'admin@fegesport.com',
        'contact@fegesport.org'
      )
    )
  );

-- Allow admins to update members
CREATE POLICY "Allow admins to update members"
  ON members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'admin@fegesport.com',
        'contact@fegesport.org'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'admin@fegesport.com',
        'contact@fegesport.org'
      )
    )
  );

-- Allow admins to delete members
CREATE POLICY "Allow admins to delete members"
  ON members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'test@example.com',
        'admin@fegesport.org',
        'admin@fegesport.com',
        'contact@fegesport.org'
      )
    )
  );
