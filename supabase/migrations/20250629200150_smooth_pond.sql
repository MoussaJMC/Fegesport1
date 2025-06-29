/*
  # Static Files Table Setup
  
  1. New Tables
    - `static_files` - Stores metadata for uploaded files
      - `id` (uuid, primary key)
      - `filename` (text)
      - `original_filename` (text)
      - `file_url` (text)
      - `file_type` (text)
      - `file_size` (bigint)
      - `category_id` (uuid, foreign key to file_categories)
      - Various metadata fields (title, alt_text, description, etc.)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `static_files` table
    - Add admin access policy
*/

-- Create static_files table if it doesn't exist
CREATE TABLE IF NOT EXISTS static_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  original_filename text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  category_id uuid REFERENCES file_categories(id) ON DELETE SET NULL,
  title text,
  alt_text text,
  description text,
  tags text[],
  width integer,
  height integer,
  is_public boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  seo_title text,
  seo_description text,
  download_count integer DEFAULT 0,
  last_accessed_at timestamptz,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create useful indexes
CREATE INDEX IF NOT EXISTS idx_static_files_category ON static_files(category_id);
CREATE INDEX IF NOT EXISTS idx_static_files_type ON static_files(file_type);
CREATE INDEX IF NOT EXISTS idx_static_files_public ON static_files(is_public);
CREATE INDEX IF NOT EXISTS idx_static_files_featured ON static_files(is_featured);
CREATE INDEX IF NOT EXISTS idx_static_files_tags ON static_files USING gin(tags);

-- Enable RLS
ALTER TABLE static_files ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Admin has full access to static_files' 
    AND polrelid = 'static_files'::regclass
  ) THEN
    CREATE POLICY "Admin has full access to static_files" ON static_files
      FOR ALL USING (is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Public can view public files' 
    AND polrelid = 'static_files'::regclass
  ) THEN
    CREATE POLICY "Public can view public files" ON static_files
      FOR SELECT USING (is_public = true);
  END IF;
END
$$;

-- Create trigger to update updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_static_files_updated_at' 
    AND tgrelid = 'static_files'::regclass
  ) THEN
    CREATE TRIGGER update_static_files_updated_at BEFORE UPDATE ON static_files
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Create file_usage table to track where files are used
CREATE TABLE IF NOT EXISTS file_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid REFERENCES static_files(id) ON DELETE CASCADE,
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  usage_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for file_usage
CREATE INDEX IF NOT EXISTS idx_file_usage_file ON file_usage(file_id);
CREATE INDEX IF NOT EXISTS idx_file_usage_content ON file_usage(content_type, content_id);

-- Enable RLS on file_usage
ALTER TABLE file_usage ENABLE ROW LEVEL SECURITY;

-- Create function to update file usage count
CREATE OR REPLACE FUNCTION update_file_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment download_count for the file
  UPDATE static_files
  SET download_count = download_count + 1,
      last_accessed_at = now()
  WHERE id = NEW.file_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for file_usage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_update_file_usage' 
    AND tgrelid = 'file_usage'::regclass
  ) THEN
    CREATE TRIGGER trigger_update_file_usage
      AFTER INSERT ON file_usage
      FOR EACH ROW
      EXECUTE FUNCTION update_file_usage();
  END IF;
END
$$;