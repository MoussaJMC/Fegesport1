/*
  # Fix Foreign Key Indexes and Remove Unused Indexes
  
  ## Performance Improvements
  1. Add indexes for foreign keys without covering indexes
     - event_registrations.member_id
     - members.user_id
     - news.author_id
     - static_files.uploaded_by
  
  ## Cleanup
  2. Remove unused indexes
     - idx_file_usage_file_id
     - idx_profiles_user_id_new
  
  ## Impact
  - Improved query performance for joins and foreign key lookups
  - Reduced index maintenance overhead by removing unused indexes
*/

-- Add missing foreign key indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_member_id 
  ON public.event_registrations(member_id);

CREATE INDEX IF NOT EXISTS idx_members_user_id 
  ON public.members(user_id);

CREATE INDEX IF NOT EXISTS idx_news_author_id 
  ON public.news(author_id);

CREATE INDEX IF NOT EXISTS idx_static_files_uploaded_by 
  ON public.static_files(uploaded_by);

-- Remove unused indexes to reduce maintenance overhead
DROP INDEX IF EXISTS public.idx_file_usage_file_id;
DROP INDEX IF EXISTS public.idx_profiles_user_id_new;