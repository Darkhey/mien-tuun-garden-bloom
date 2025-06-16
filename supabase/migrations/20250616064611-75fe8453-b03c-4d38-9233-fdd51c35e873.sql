
-- Create tables for pipeline management and automation
CREATE TABLE public.automation_pipelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('blog_creation', 'recipe_generation', 'seo_optimization', 'content_analysis')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'paused', 'error')),
  throughput INTEGER NOT NULL DEFAULT 0,
  efficiency INTEGER NOT NULL DEFAULT 0,
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  config JSONB DEFAULT '{}',
  stages JSONB DEFAULT '[]'
);

-- Create table for pipeline executions
CREATE TABLE public.pipeline_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pipeline_id UUID REFERENCES public.automation_pipelines(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  stages_progress JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  error_message TEXT,
  created_by UUID REFERENCES auth.users
);

-- Create table for pipeline configuration
CREATE TABLE public.pipeline_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_size INTEGER NOT NULL DEFAULT 5,
  quality_threshold INTEGER NOT NULL DEFAULT 80,
  auto_publish BOOLEAN NOT NULL DEFAULT false,
  target_category TEXT NOT NULL DEFAULT 'kochen',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.automation_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin only)
CREATE POLICY "Admins can manage all pipelines" 
  ON public.automation_pipelines 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all pipeline executions" 
  ON public.pipeline_executions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage pipeline config" 
  ON public.pipeline_config 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default pipelines
INSERT INTO public.automation_pipelines (name, type, throughput, efficiency, stages) VALUES
('Automatische Blog-Erstellung', 'blog_creation', 12, 87, '[
  {"id": "trend_analysis", "name": "Trend-Analyse", "status": "idle", "progress": 0, "duration": 30},
  {"id": "topic_generation", "name": "Themen-Generierung", "status": "idle", "progress": 0, "duration": 45},
  {"id": "content_creation", "name": "Content-Erstellung", "status": "idle", "progress": 0, "duration": 120},
  {"id": "quality_check", "name": "Qualitätsprüfung", "status": "idle", "progress": 0, "duration": 60},
  {"id": "seo_optimization", "name": "SEO-Optimierung", "status": "idle", "progress": 0, "duration": 45},
  {"id": "publishing", "name": "Veröffentlichung", "status": "idle", "progress": 0, "duration": 15}
]'),
('Automatische Rezept-Generierung', 'recipe_generation', 8, 92, '[
  {"id": "ingredient_analysis", "name": "Zutaten-Analyse", "status": "idle", "progress": 0, "duration": 20},
  {"id": "recipe_creation", "name": "Rezept-Erstellung", "status": "idle", "progress": 0, "duration": 90},
  {"id": "nutrition_calc", "name": "Nährwert-Berechnung", "status": "idle", "progress": 0, "duration": 30},
  {"id": "image_generation", "name": "Bild-Generierung", "status": "idle", "progress": 0, "duration": 60},
  {"id": "final_review", "name": "Finale Überprüfung", "status": "idle", "progress": 0, "duration": 40}
]'),
('SEO-Optimierungs-Pipeline', 'seo_optimization', 20, 94, '[
  {"id": "keyword_research", "name": "Keyword-Recherche", "status": "idle", "progress": 0, "duration": 25},
  {"id": "content_analysis", "name": "Content-Analyse", "status": "idle", "progress": 0, "duration": 35},
  {"id": "meta_optimization", "name": "Meta-Optimierung", "status": "idle", "progress": 0, "duration": 20},
  {"id": "internal_linking", "name": "Interne Verlinkung", "status": "idle", "progress": 0, "duration": 30}
]'),
('Content-Performance-Analyse', 'content_analysis', 50, 98, '[
  {"id": "data_collection", "name": "Daten-Sammlung", "status": "idle", "progress": 0, "duration": 15},
  {"id": "performance_analysis", "name": "Performance-Analyse", "status": "idle", "progress": 0, "duration": 40},
  {"id": "insight_generation", "name": "Insight-Generierung", "status": "idle", "progress": 0, "duration": 25},
  {"id": "recommendation", "name": "Empfehlungen", "status": "idle", "progress": 0, "duration": 20}
]');

-- Insert default config
INSERT INTO public.pipeline_config (batch_size, quality_threshold, auto_publish, target_category) 
VALUES (5, 80, false, 'kochen');

-- Create indexes for performance
CREATE INDEX idx_automation_pipelines_type ON public.automation_pipelines(type);
CREATE INDEX idx_automation_pipelines_status ON public.automation_pipelines(status);
CREATE INDEX idx_pipeline_executions_pipeline_id ON public.pipeline_executions(pipeline_id);
CREATE INDEX idx_pipeline_executions_status ON public.pipeline_executions(status);
CREATE INDEX idx_pipeline_executions_started_at ON public.pipeline_executions(started_at);

-- Create trigger for updated_at
CREATE TRIGGER update_automation_pipelines_updated_at 
  BEFORE UPDATE ON public.automation_pipelines 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipeline_config_updated_at 
  BEFORE UPDATE ON public.pipeline_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
