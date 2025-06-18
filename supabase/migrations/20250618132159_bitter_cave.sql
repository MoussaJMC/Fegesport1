/*
  # Static Files Management System

  1. New Tables
    - `file_categories` - Categories for organizing files (images, documents, videos, etc.)
    - `static_files` - Main table for storing file metadata and URLs
    - `file_usage` - Track where files are being used across the system

  2. Security
    - Enable RLS on all new tables
    - Add policies for admin access and public read access for published files
    - Add policies for tracking file usage

  3. Features
    - File categorization and tagging
    - Usage tracking across different content types
    - File metadata (size, type, dimensions for images)
    - SEO-friendly alt text and descriptions
*/

-- Create file categories table
CREATE TABLE IF NOT EXISTS file_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text, -- Lucide icon name
  color text DEFAULT '#6B7280', -- Hex color for UI
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create static files table
CREATE TABLE IF NOT EXISTS static_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  original_filename text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL, -- MIME type
  file_size bigint, -- Size in bytes
  category_id uuid REFERENCES file_categories(id) ON DELETE SET NULL,
  
  -- Metadata
  title text,
  alt_text text, -- For images
  description text,
  tags text[], -- Array of tags for searching
  
  -- Image specific metadata
  width integer, -- For images
  height integer, -- For images
  
  -- Status and organization
  is_public boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  
  -- SEO
  seo_title text,
  seo_description text,
  
  -- Tracking
  download_count integer DEFAULT 0,
  last_accessed_at timestamptz,
  
  -- Audit
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create file usage tracking table
CREATE TABLE IF NOT EXISTS file_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid REFERENCES static_files(id) ON DELETE CASCADE,
  content_type text NOT NULL, -- 'news', 'events', 'partners', 'pages', etc.
  content_id uuid NOT NULL, -- ID of the content using this file
  usage_type text NOT NULL, -- 'featured_image', 'gallery', 'attachment', 'logo', etc.
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_static_files_category ON static_files(category_id);
CREATE INDEX IF NOT EXISTS idx_static_files_type ON static_files(file_type);
CREATE INDEX IF NOT EXISTS idx_static_files_public ON static_files(is_public);
CREATE INDEX IF NOT EXISTS idx_static_files_featured ON static_files(is_featured);
CREATE INDEX IF NOT EXISTS idx_static_files_tags ON static_files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_file_usage_file ON file_usage(file_id);
CREATE INDEX IF NOT EXISTS idx_file_usage_content ON file_usage(content_type, content_id);

-- Enable RLS
ALTER TABLE file_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE static_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_usage ENABLE ROW LEVEL SECURITY;

-- File Categories Policies
CREATE POLICY "Enable read access for all users on file_categories" ON file_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin has full access to file_categories" ON file_categories
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- Static Files Policies
CREATE POLICY "Enable read access for public files" ON static_files
  FOR SELECT USING (is_public = true);

CREATE POLICY "Enable read access for authenticated users" ON static_files
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin has full access to static_files" ON static_files
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- File Usage Policies
CREATE POLICY "Enable read access for authenticated users on file_usage" ON file_usage
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin has full access to file_usage" ON file_usage
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- Insert default file categories
INSERT INTO file_categories (name, description, icon, color) VALUES
  ('Images', 'Photos, graphics, and visual content', 'Image', '#10B981'),
  ('Documents', 'PDFs, Word docs, and text files', 'FileText', '#3B82F6'),
  ('Videos', 'Video files and multimedia content', 'Video', '#8B5CF6'),
  ('Audio', 'Audio files and sound content', 'Music', '#F59E0B'),
  ('Logos', 'Brand logos and identity assets', 'Shield', '#EF4444'),
  ('Banners', 'Website banners and promotional images', 'Layout', '#06B6D4'),
  ('Avatars', 'Profile pictures and user avatars', 'User', '#84CC16'),
  ('Archives', 'ZIP files and compressed content', 'Archive', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- Function to update file usage tracking
CREATE OR REPLACE FUNCTION update_file_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_accessed_at when file is accessed
  UPDATE static_files 
  SET last_accessed_at = now()
  WHERE id = NEW.file_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update file access tracking
CREATE TRIGGER trigger_update_file_usage
  AFTER INSERT ON file_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_file_usage();

-- Function to clean up unused files (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_unused_files()
RETURNS TABLE(file_id uuid, filename text, file_url text) AS $$
BEGIN
  RETURN QUERY
  SELECT sf.id, sf.filename, sf.file_url
  FROM static_files sf
  LEFT JOIN file_usage fu ON sf.id = fu.file_id
  WHERE fu.file_id IS NULL
    AND sf.created_at < now() - interval '30 days'
    AND sf.is_featured = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get file statistics
CREATE OR REPLACE FUNCTION get_file_statistics()
RETURNS TABLE(
  total_files bigint,
  total_size bigint,
  files_by_category jsonb,
  most_used_files jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT count(*) FROM static_files)::bigint as total_files,
    (SELECT COALESCE(sum(file_size), 0) FROM static_files)::bigint as total_size,
    (
      SELECT jsonb_object_agg(fc.name, file_counts.count)
      FROM file_categories fc
      LEFT JOIN (
        SELECT category_id, count(*) as count
        FROM static_files
        GROUP BY category_id
      ) file_counts ON fc.id = file_counts.category_id
    ) as files_by_category,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', sf.id,
          'filename', sf.filename,
          'title', sf.title,
          'usage_count', usage_counts.count
        )
      )
      FROM static_files sf
      INNER JOIN (
        SELECT file_id, count(*) as count
        FROM file_usage
        GROUP BY file_id
        ORDER BY count DESC
        LIMIT 10
      ) usage_counts ON sf.id = usage_counts.file_id
    ) as most_used_files;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION cleanup_unused_files() TO authenticated;
GRANT EXECUTE ON FUNCTION get_file_statistics() TO authenticated;