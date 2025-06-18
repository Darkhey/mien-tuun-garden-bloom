-- Add season column to blog_posts
ALTER TABLE public.blog_posts
  ADD COLUMN season TEXT NOT NULL DEFAULT 'ganzjährig'
    CHECK (season IN ('frühling', 'sommer', 'herbst', 'winter', 'ganzjährig'));

-- Backfill existing rows with default
UPDATE public.blog_posts SET season = 'ganzjährig' WHERE season IS NULL;
