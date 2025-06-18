/*
  # Blog Posts Automation Fields

  1. Updates
    - Add automation-related fields to blog_posts table
    - Add automation_config_id foreign key
    - Add quality_score and engagement_score fields
*/

-- Add automation fields to blog_posts table if they don't exist
DO $$
BEGIN
  -- Add automation_config_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_posts' 
    AND column_name = 'automation_config_id'
  ) THEN
    ALTER TABLE public.blog_posts 
    ADD COLUMN automation_config_id UUID REFERENCES public.content_automation_configs(id);
  END IF;

  -- Add quality_score if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_posts' 
    AND column_name = 'quality_score'
  ) THEN
    ALTER TABLE public.blog_posts 
    ADD COLUMN quality_score INTEGER;
  END IF;

  -- Add engagement_score if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_posts' 
    AND column_name = 'engagement_score'
  ) THEN
    ALTER TABLE public.blog_posts 
    ADD COLUMN engagement_score INTEGER DEFAULT 0;
  END IF;
END
$$;