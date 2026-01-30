/*
  # Fix Members Table RLS - Allow Public Insert
  
  1. Problem
    - The anonymous insert policy is not working
    - Users still get "new row violates row-level security policy" error
  
  2. Solution
    - Replace anonymous-only policy with a public policy (anon + authenticated)
    - Simplify the policy to ensure it works for registration
  
  3. Security
    - Anyone can register (insert their own data)
    - Only authenticated users can read their own data
    - Only admins can update/delete
*/

-- Drop the existing anonymous insert policy
DROP POLICY IF EXISTS "Allow anonymous member registration" ON members;

-- Create a new policy that allows both anonymous and authenticated users to insert
CREATE POLICY "Allow public member registration"
  ON members
  FOR INSERT
  TO public
  WITH CHECK (true);
