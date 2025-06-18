-- Create content automation configuration tables

-- Check if the table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_automation_configs') THEN
    CREATE TABLE public.content_automation_configs (
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
    CREATE TABLE public.content_automation_logs (
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
  END IF;
END
$$;