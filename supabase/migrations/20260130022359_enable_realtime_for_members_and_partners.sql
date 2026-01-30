/*
  # Enable Realtime for Members and Partners Tables
  
  1. Changes
    - Enable realtime replication for the members table
    - Enable realtime replication for the partners table
    - This allows clients to subscribe to changes in these tables
  
  2. Purpose
    - Allow community stats to update automatically when new members join
    - Provide real-time updates to the UI without manual refresh
*/

-- Enable realtime for members table
ALTER PUBLICATION supabase_realtime ADD TABLE members;

-- Enable realtime for partners table  
ALTER PUBLICATION supabase_realtime ADD TABLE partners;

-- Add comment for documentation
COMMENT ON TABLE members IS 'Members table with realtime enabled for automatic stats updates';
COMMENT ON TABLE partners IS 'Partners table with realtime enabled for automatic stats updates';
