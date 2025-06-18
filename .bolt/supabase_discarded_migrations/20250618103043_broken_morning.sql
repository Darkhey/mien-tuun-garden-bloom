/*
  # Content Automation Schema

  1. New Tables
    - content_automation_configs: Stores automation configuration details
    - content_automation_logs: Tracks automation actions and results

  2. Schema Updates
    - Adds quality_score and engagement_score to blog_posts
    - Adds automation_config_id to blog_posts for tracking

  3. Functions
    - update_content_automation_configs_updated_at: Trigger function for updated_at
*/

-- Add columns to blog_posts table for automation tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'automation_config_id'
  ) THEN
    ALTER TABLE public.blog_posts ADD COLUMN automation_config_id UUID REFERENCES public.content_automation_configs(id);
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'quality_score'
  ) THEN
    ALTER TABLE public.blog_posts ADD COLUMN quality_score INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'engagement_score'
  ) THEN
    ALTER TABLE public.blog_posts ADD COLUMN engagement_score INTEGER DEFAULT 0;
  END IF;
END
$$;

-- Create content_automation_configs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.content_automation_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  yaml_config TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create content_automation_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.content_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES public.content_automation_configs(id),
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create updated_at trigger for content_automation_configs
CREATE OR REPLACE FUNCTION update_content_automation_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_automation_configs_updated_at
BEFORE UPDATE ON public.content_automation_configs
FOR EACH ROW
EXECUTE FUNCTION update_content_automation_configs_updated_at();

-- Add RLS policies
ALTER TABLE public.content_automation_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_automation_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can manage content automation configs
CREATE POLICY "Admins can manage content automation configs"
  ON public.content_automation_configs
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  ));

-- Only admins can view content automation logs
CREATE POLICY "Admins can view content automation logs"
  ON public.content_automation_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  ));