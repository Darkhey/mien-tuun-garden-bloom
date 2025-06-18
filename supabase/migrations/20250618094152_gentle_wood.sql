-- Create content automation tables

-- Configuration table
CREATE TABLE IF NOT EXISTS content_automation_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  yaml_config TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Logs table
CREATE TABLE IF NOT EXISTS content_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES content_automation_configs(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add automation_config_id to blog_posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS automation_config_id UUID REFERENCES content_automation_configs(id);

-- Add quality_score to blog_posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS quality_score INTEGER;

-- Add engagement_score to blog_posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS engagement_score INTEGER;

-- Create updated_at trigger for content_automation_configs
CREATE OR REPLACE FUNCTION update_content_automation_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_automation_configs_updated_at
  BEFORE UPDATE ON content_automation_configs
  FOR EACH ROW EXECUTE FUNCTION update_content_automation_configs_updated_at();

-- Add RLS policies
ALTER TABLE content_automation_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_automation_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can manage content automation configs
CREATE POLICY "Admins can manage content automation configs"
  ON content_automation_configs
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  ));

-- Only admins can view content automation logs
CREATE POLICY "Admins can view content automation logs"
  ON content_automation_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  ));