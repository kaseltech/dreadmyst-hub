-- Update builds_update policy to allow admins
-- Run this if you already ran the previous migration

DROP POLICY IF EXISTS "builds_update" ON public.builds;

CREATE POLICY "builds_update" ON public.builds FOR UPDATE
  USING (
    author_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND is_admin = true
    )
  );
