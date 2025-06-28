-- Add parent_id columns for nested comments
ALTER TABLE public.blog_comments
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.blog_comments(id) ON DELETE CASCADE;

ALTER TABLE public.recipe_comments
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.recipe_comments(id) ON DELETE CASCADE;
