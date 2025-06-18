/*
  # Content Automation Configuration Schema

  1. New Tables
    - `content_automation_configs` - Stores configuration for content automation
    - `content_automation_logs` - Logs actions and events for content automation

  2. Security
    - Enable RLS on both tables
    - Add policies for admin access
*/

-- Create content automation configuration table if it doesn't exist
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

-- Add RLS policies
ALTER TABLE public.content_automation_configs ENABLE ROW LEVEL SECURITY;

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

-- Create content automation logs table
CREATE TABLE IF NOT EXISTS public.content_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES public.content_automation_configs(id),
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.content_automation_logs ENABLE ROW LEVEL SECURITY;

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

-- Create updated_at trigger function if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_content_automation_configs_updated_at') THEN
    CREATE FUNCTION update_content_automation_configs_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END
$$;

-- Create trigger for content_automation_configs
DROP TRIGGER IF EXISTS update_content_automation_configs_updated_at ON public.content_automation_configs;
CREATE TRIGGER update_content_automation_configs_updated_at
BEFORE UPDATE ON public.content_automation_configs
FOR EACH ROW
EXECUTE FUNCTION update_content_automation_configs_updated_at();