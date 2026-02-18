/*
  # Cleanup Redundant Events SELECT Policy
  
  ## Changes
  Remove the redundant "Admin can view all events" policy since the 
  "Authenticated users can view all events" policy already covers all 
  authenticated users including admins.
  
  ## Security
  - Authenticated users (including admin) can view all events
  - Public users can view non-cancelled events
*/

-- Drop the redundant admin SELECT policy
DROP POLICY IF EXISTS "Admin can view all events" ON events;
