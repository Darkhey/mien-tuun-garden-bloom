
-- Add "audiences" (string array) column to blog_posts for Zielgruppe
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS audiences text[] NOT NULL DEFAULT '{}';

-- Add "content_types" (string array) column to blog_posts for Artikeltyp/Format
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS content_types text[] NOT NULL DEFAULT '{}';
