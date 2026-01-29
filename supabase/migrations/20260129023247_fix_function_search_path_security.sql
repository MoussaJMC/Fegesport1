/*
  # Fix Function Search Path Security Issues
  
  ## Security Issue
  Functions with SECURITY DEFINER and mutable search_path can be exploited
  to execute malicious code by manipulating the search path.
  
  ## Changes
  Set explicit search_path for all SECURITY DEFINER functions:
  - update_file_usage
  - bucket_exists
  - cleanup_unused_files
  - get_file_statistics
  
  ## Security
  Setting search_path to 'public', 'pg_temp' prevents search path injection attacks
*/

-- Fix update_file_usage trigger function
CREATE OR REPLACE FUNCTION public.update_file_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  UPDATE public.static_files
  SET download_count = download_count + 1,
      last_accessed_at = now()
  WHERE id = NEW.file_id;
  
  RETURN NEW;
END;
$function$;

-- Fix bucket_exists function
CREATE OR REPLACE FUNCTION public.bucket_exists(bucket_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'storage', 'pg_temp'
AS $function$
DECLARE
  bucket_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO bucket_count
  FROM storage.buckets
  WHERE name = bucket_name;
  
  RETURN bucket_count > 0;
END;
$function$;

-- Fix cleanup_unused_files function
CREATE OR REPLACE FUNCTION public.cleanup_unused_files()
RETURNS TABLE(file_id uuid, filename text, file_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  SELECT sf.id, sf.filename, sf.file_url
  FROM public.static_files sf
  LEFT JOIN public.file_usage fu ON sf.id = fu.file_id
  WHERE fu.file_id IS NULL
    AND sf.created_at < now() - interval '30 days'
    AND sf.is_featured = false;
END;
$function$;

-- Fix get_file_statistics function
CREATE OR REPLACE FUNCTION public.get_file_statistics()
RETURNS TABLE(total_files bigint, total_size bigint, files_by_category jsonb, most_used_files jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT count(*) FROM public.static_files)::bigint as total_files,
    (SELECT COALESCE(sum(file_size), 0) FROM public.static_files)::bigint as total_size,
    (
      SELECT jsonb_object_agg(fc.name, file_counts.count)
      FROM public.file_categories fc
      LEFT JOIN (
        SELECT category_id, count(*) as count
        FROM public.static_files
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
      FROM public.static_files sf
      INNER JOIN (
        SELECT file_id, count(*) as count
        FROM public.file_usage
        GROUP BY file_id
        ORDER BY count DESC
        LIMIT 10
      ) usage_counts ON sf.id = usage_counts.file_id
    ) as most_used_files;
END;
$function$;