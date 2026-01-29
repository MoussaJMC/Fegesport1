/*
  # Create Admin News Function
  
  ## Purpose
  Create a server-side function that bypasses RLS for news creation
  This function runs with SECURITY DEFINER which means it runs with the privileges
  of the function owner (postgres) rather than the caller.
  
  ## Security
  - Only allows admin@fegesport.org email
  - Validates all required fields
  - Returns detailed error messages for debugging
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_news_as_admin;

-- Create function that bypasses RLS for admin operations
CREATE OR REPLACE FUNCTION create_news_as_admin(
  p_title text,
  p_excerpt text,
  p_content text,
  p_category text,
  p_image_url text DEFAULT NULL,
  p_published boolean DEFAULT false
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_email text;
  v_new_news json;
BEGIN
  -- Get the email of the current user
  v_user_email := auth.jwt()->>'email';
  
  -- Check if user is admin
  IF v_user_email != 'admin@fegesport.org' THEN
    RAISE EXCEPTION 'Accès refusé: seul admin@fegesport.org peut créer des actualités';
  END IF;
  
  -- Validate required fields
  IF p_title IS NULL OR trim(p_title) = '' THEN
    RAISE EXCEPTION 'Le titre est requis';
  END IF;
  
  IF p_excerpt IS NULL OR trim(p_excerpt) = '' THEN
    RAISE EXCEPTION 'Le résumé est requis';
  END IF;
  
  IF p_content IS NULL OR trim(p_content) = '' THEN
    RAISE EXCEPTION 'Le contenu est requis';
  END IF;
  
  IF p_category IS NULL OR trim(p_category) = '' THEN
    RAISE EXCEPTION 'La catégorie est requise';
  END IF;
  
  -- Insert the news (bypassing RLS because of SECURITY DEFINER)
  INSERT INTO news (title, excerpt, content, category, image_url, published)
  VALUES (p_title, p_excerpt, p_content, p_category, p_image_url, p_published)
  RETURNING json_build_object(
    'id', id,
    'title', title,
    'excerpt', excerpt,
    'content', content,
    'category', category,
    'image_url', image_url,
    'published', published,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_new_news;
  
  RETURN v_new_news;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_news_as_admin TO authenticated;

-- Create similar function for updates
CREATE OR REPLACE FUNCTION update_news_as_admin(
  p_id uuid,
  p_title text,
  p_excerpt text,
  p_content text,
  p_category text,
  p_image_url text DEFAULT NULL,
  p_published boolean DEFAULT false
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_email text;
  v_updated_news json;
BEGIN
  -- Get the email of the current user
  v_user_email := auth.jwt()->>'email';
  
  -- Check if user is admin
  IF v_user_email != 'admin@fegesport.org' THEN
    RAISE EXCEPTION 'Accès refusé: seul admin@fegesport.org peut modifier des actualités';
  END IF;
  
  -- Update the news (bypassing RLS because of SECURITY DEFINER)
  UPDATE news 
  SET 
    title = p_title,
    excerpt = p_excerpt,
    content = p_content,
    category = p_category,
    image_url = p_image_url,
    published = p_published,
    updated_at = now()
  WHERE id = p_id
  RETURNING json_build_object(
    'id', id,
    'title', title,
    'excerpt', excerpt,
    'content', content,
    'category', category,
    'image_url', image_url,
    'published', published,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_updated_news;
  
  IF v_updated_news IS NULL THEN
    RAISE EXCEPTION 'Actualité non trouvée avec l''ID: %', p_id;
  END IF;
  
  RETURN v_updated_news;
END;
$$;

GRANT EXECUTE ON FUNCTION update_news_as_admin TO authenticated;