/*
  # Storage Bucket Setup
  
  1. Create Storage Buckets
    - `static-files` - For storing uploaded files
  
  2. Security
    - Set up RLS policies for the bucket
*/

-- Create storage bucket for static files if it doesn't exist
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  -- Check if the bucket already exists
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'static-files'
  ) INTO bucket_exists;
  
  -- Create the bucket if it doesn't exist
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('static-files', 'static-files', true);
  END IF;
END
$$;

-- Set up storage policies for the static-files bucket
DO $$
BEGIN
  -- Policy for authenticated users to upload files
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Authenticated users can upload files' 
    AND bucket_id = 'static-files'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'Authenticated users can upload files',
      'static-files',
      'INSERT',
      '(auth.role() = ''authenticated'')'
    );
  END IF;
  
  -- Policy for authenticated users to update files
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Authenticated users can update files' 
    AND bucket_id = 'static-files'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'Authenticated users can update files',
      'static-files',
      'UPDATE',
      '(auth.role() = ''authenticated'')'
    );
  END IF;
  
  -- Policy for authenticated users to delete files
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Authenticated users can delete files' 
    AND bucket_id = 'static-files'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'Authenticated users can delete files',
      'static-files',
      'DELETE',
      '(auth.role() = ''authenticated'')'
    );
  END IF;
  
  -- Policy for everyone to read public files
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Everyone can read public files' 
    AND bucket_id = 'static-files'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'Everyone can read public files',
      'static-files',
      'SELECT',
      'true'
    );
  END IF;
END
$$;