/*
  # Add function to increment download count

  1. New Functions
    - `increment_download_count(file_id uuid)` - Safely increments the download count for a file
    
  2. Security
    - Function is available to public (no authentication required)
    - Uses SECURITY DEFINER to allow updates even for anonymous users
    - Only updates download_count and last_accessed_at fields
    
  3. Changes
    - Creates a new function that can be called from the frontend
    - Ensures download tracking works for all users
*/

CREATE OR REPLACE FUNCTION increment_download_count(file_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE static_files
  SET 
    download_count = COALESCE(download_count, 0) + 1,
    last_accessed_at = now()
  WHERE id = file_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_download_count(uuid) TO anon, authenticated;
