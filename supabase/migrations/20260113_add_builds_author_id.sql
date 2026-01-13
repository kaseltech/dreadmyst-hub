-- Add author_id to builds table for edit permissions
ALTER TABLE public.builds ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_builds_author_id ON public.builds(author_id);

-- Add UPDATE policy for build authors OR admins
CREATE POLICY "builds_update" ON public.builds FOR UPDATE
  USING (
    author_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND is_admin = true
    )
  );

-- Add DELETE policy for build authors OR admins
CREATE POLICY "builds_delete" ON public.builds FOR DELETE
  USING (
    author_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND is_admin = true
    )
  );
