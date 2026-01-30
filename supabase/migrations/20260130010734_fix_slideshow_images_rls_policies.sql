/*
  # Fix Slideshow Images RLS Policies
  
  1. Issues
    - Current policy is too restrictive and blocks admin inserts
    - The "FOR ALL" policy with "TO authenticated" prevents proper operation
    
  2. Changes
    - Drop existing policies
    - Create separate policies for each operation type:
      - SELECT: Public can view active slides OR admins can view all
      - INSERT: Only admins can insert
      - UPDATE: Only admins can update
      - DELETE: Only admins can delete
    
  3. Security
    - Public users can only SELECT active slides
    - All modifications require admin role
*/

-- Drop existing policies
DROP POLICY IF EXISTS "slideshow_images_select_policy" ON public.slideshow_images;
DROP POLICY IF EXISTS "slideshow_images_modify_policy" ON public.slideshow_images;

-- Allow public to view active slides, admins to view all
CREATE POLICY "slideshow_images_select_policy"
  ON public.slideshow_images
  FOR SELECT
  USING (is_active = true OR public.is_admin());

-- Only admins can insert
CREATE POLICY "slideshow_images_insert_policy"
  ON public.slideshow_images
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only admins can update
CREATE POLICY "slideshow_images_update_policy"
  ON public.slideshow_images
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete
CREATE POLICY "slideshow_images_delete_policy"
  ON public.slideshow_images
  FOR DELETE
  TO authenticated
  USING (public.is_admin());