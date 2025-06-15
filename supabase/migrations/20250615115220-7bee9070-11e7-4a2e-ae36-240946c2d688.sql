
-- Create enum for cron job status
CREATE TYPE cron_job_status AS ENUM ('active', 'inactive', 'paused', 'error');

-- Create enum for job execution status
CREATE TYPE job_execution_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- Create enum for job types
CREATE TYPE job_type AS ENUM ('content_generation', 'seo_optimization', 'performance_analysis', 'cleanup', 'backup', 'custom');

-- Create cron_jobs table
CREATE TABLE public.cron_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cron_expression TEXT NOT NULL,
  job_type job_type NOT NULL DEFAULT 'custom',
  function_name TEXT NOT NULL,
  function_payload JSONB DEFAULT '{}',
  status cron_job_status NOT NULL DEFAULT 'inactive',
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER NOT NULL DEFAULT 3,
  timeout_seconds INTEGER NOT NULL DEFAULT 300,
  enabled BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  dependencies UUID[] DEFAULT '{}',
  conditions JSONB DEFAULT '{}'
);

-- Create job_execution_logs table
CREATE TABLE public.job_execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cron_job_id UUID REFERENCES public.cron_jobs(id) ON DELETE CASCADE NOT NULL,
  execution_id TEXT NOT NULL,
  status job_execution_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  output JSONB,
  error_message TEXT,
  retry_attempt INTEGER NOT NULL DEFAULT 0,
  resource_usage JSONB DEFAULT '{}',
  triggered_by TEXT DEFAULT 'cron'
);

-- Create scheduled_tasks table for one-time or specific scheduling
CREATE TABLE public.scheduled_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  function_name TEXT NOT NULL,
  function_payload JSONB DEFAULT '{}',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status job_execution_status NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE,
  result JSONB,
  error_message TEXT,
  priority INTEGER NOT NULL DEFAULT 0
);

-- Create job_templates table
CREATE TABLE public.job_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  job_type job_type NOT NULL,
  default_cron_expression TEXT NOT NULL,
  function_name TEXT NOT NULL,
  default_payload JSONB DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'general',
  is_system_template BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  usage_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE public.cron_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cron_jobs (Admin only)
CREATE POLICY "Admins can manage all cron jobs" 
  ON public.cron_jobs 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for job_execution_logs (Admin only)
CREATE POLICY "Admins can view all job logs" 
  ON public.job_execution_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for scheduled_tasks (Admin only)
CREATE POLICY "Admins can manage all scheduled tasks" 
  ON public.scheduled_tasks 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for job_templates (Admin can manage, others can view system templates)
CREATE POLICY "Admins can manage all job templates" 
  ON public.job_templates 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view system job templates" 
  ON public.job_templates 
  FOR SELECT 
  USING (is_system_template = true);

-- Create indexes for performance
CREATE INDEX idx_cron_jobs_status ON public.cron_jobs(status);
CREATE INDEX idx_cron_jobs_next_run ON public.cron_jobs(next_run_at) WHERE enabled = true;
CREATE INDEX idx_cron_jobs_type ON public.cron_jobs(job_type);
CREATE INDEX idx_job_logs_cron_job_id ON public.job_execution_logs(cron_job_id);
CREATE INDEX idx_job_logs_status ON public.job_execution_logs(status);
CREATE INDEX idx_job_logs_started_at ON public.job_execution_logs(started_at);
CREATE INDEX idx_scheduled_tasks_scheduled_for ON public.scheduled_tasks(scheduled_for);
CREATE INDEX idx_scheduled_tasks_status ON public.scheduled_tasks(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for cron_jobs updated_at
CREATE TRIGGER update_cron_jobs_updated_at 
  BEFORE UPDATE ON public.cron_jobs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default job templates
INSERT INTO public.job_templates (name, description, job_type, default_cron_expression, function_name, default_payload, category, is_system_template) VALUES
('Tägliche Content-Generierung', 'Automatische Erstellung von Blog-Artikeln jeden Tag um 9 Uhr', 'content_generation', '0 9 * * *', 'auto-blog-post', '{"category": "auto", "count": 1}', 'Content', true),
('Wöchentlicher SEO-Report', 'Wöchentliche SEO-Analyse und Optimierungsvorschläge', 'seo_optimization', '0 8 * * 1', 'seo-analysis', '{"type": "weekly_report"}', 'SEO', true),
('Monatliche Performance-Analyse', 'Monatlicher Bericht über Website-Performance', 'performance_analysis', '0 7 1 * *', 'performance-analysis', '{"type": "monthly_report"}', 'Analytics', true),
('Tägliche Datenbereinigung', 'Bereinigung alter Logs und temporärer Daten', 'cleanup', '0 2 * * *', 'cleanup-old-data', '{"days_to_keep": 30}', 'Maintenance', true),
('Wöchentliches Backup', 'Backup wichtiger Daten jeden Sonntag', 'backup', '0 3 * * 0', 'backup-data', '{"backup_type": "full"}', 'Backup', true);
