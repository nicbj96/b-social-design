-- Migration: 20260405_003_comments_place_id_and_rls.sql
-- Add place_id column + full RLS to comments table

-- 1. Add place_id foreign key (if missing)
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS place_id uuid REFERENCES public.places(id) ON DELETE CASCADE;

-- 2. Enable RLS (idempotent)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 3. Policies (drop first so re-running is safe)
DROP POLICY IF EXISTS "comments_select_all"  ON public.comments;
DROP POLICY IF EXISTS "comments_insert_auth" ON public.comments;
DROP POLICY IF EXISTS "comments_delete_own"  ON public.comments;

CREATE POLICY "comments_select_all"
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "comments_insert_auth"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_delete_own"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_comments_event_id  ON public.comments (event_id)  WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_place_id  ON public.comments (place_id)  WHERE place_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_user_id   ON public.comments (user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created   ON public.comments (created_at DESC);
