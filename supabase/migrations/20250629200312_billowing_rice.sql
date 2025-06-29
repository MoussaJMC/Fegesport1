/*
  # Storage Bucket Setup for Static Files
  
  1. New Storage Bucket
    - Creates a storage bucket named 'static-files' for storing uploaded files
  
  2. Security
    - Sets the bucket to be publicly accessible
    - Note: Access control is handled through RLS policies on the static_files table
*/

-- Create storage bucket for static files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('static-files', 'static-files', true)
ON CONFLICT (id) DO NOTHING;

-- Note: Storage policies are managed through the Supabase dashboard
-- or through the Storage Management API, not directly through SQL
-- The bucket is set to public, but access control is handled through
-- the static_files table RLS policies