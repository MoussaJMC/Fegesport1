/*
  # Fix Leadership Team RLS Policies

  1. Changes
    - Drop existing incomplete policies
    - Add proper policies for INSERT, UPDATE, and DELETE operations
    - Ensure authenticated admins can manage leadership team members
    - Keep public read access for active members

  2. Security
    - Public users can only SELECT active members
    - Authenticated admins can perform all operations (INSERT, UPDATE, DELETE)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "leadership_select_policy" ON leadership_team;
DROP POLICY IF EXISTS "Enable read access for all users" ON leadership_team;
DROP POLICY IF EXISTS "Admin has full access to leadership_team" ON leadership_team;

-- Create comprehensive policies

-- Public can read active members
CREATE POLICY "Public users can view active leadership members"
  ON leadership_team
  FOR SELECT
  USING (is_active = true);

-- Authenticated users can view all members
CREATE POLICY "Authenticated users can view all leadership members"
  ON leadership_team
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins can insert new members
CREATE POLICY "Admins can insert leadership members"
  ON leadership_team
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Admins can update members
CREATE POLICY "Admins can update leadership members"
  ON leadership_team
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete members
CREATE POLICY "Admins can delete leadership members"
  ON leadership_team
  FOR DELETE
  TO authenticated
  USING (is_admin());
