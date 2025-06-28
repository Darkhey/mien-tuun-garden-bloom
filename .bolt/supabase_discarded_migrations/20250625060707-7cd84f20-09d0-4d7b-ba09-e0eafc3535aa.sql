
-- Erstelle Storage Bucket für Podcasts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('podcasts', 'podcasts', true);

-- Storage Policies für Podcasts
CREATE POLICY "Anyone can view podcast files" ON storage.objects
FOR SELECT USING (bucket_id = 'podcasts');

CREATE POLICY "Authenticated users can upload podcast files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'podcasts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update podcast files" ON storage.objects
FOR UPDATE USING (bucket_id = 'podcasts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete podcast files" ON storage.objects
FOR DELETE USING (bucket_id = 'podcasts' AND auth.role() = 'authenticated');

-- Erstelle blog_podcasts Tabelle
CREATE TABLE public.blog_podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  script_content TEXT NOT NULL,
  audio_url TEXT,
  duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating_script', 'generating_audio', 'ready', 'error')),
  error_message TEXT,
  eleven_labs_id TEXT,
  voice_settings JSONB DEFAULT '{"voice_id": "21m00Tcm4TlvDq8ikWAM", "stability": 0.5, "similarity_boost": 0.8, "style": 0.2}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies für blog_podcasts
ALTER TABLE public.blog_podcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published podcasts" ON public.blog_podcasts
FOR SELECT USING (status = 'ready');

CREATE POLICY "Authenticated users can manage their podcasts" ON public.blog_podcasts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.blog_posts bp 
    WHERE bp.id = blog_post_id 
    AND (bp.user_id = auth.uid() OR auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    ))
  )
);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_blog_podcasts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_podcasts_updated_at_trigger
  BEFORE UPDATE ON public.blog_podcasts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_podcasts_updated_at();

-- Index für bessere Performance
CREATE INDEX idx_blog_podcasts_blog_post_id ON public.blog_podcasts(blog_post_id);
CREATE INDEX idx_blog_podcasts_status ON public.blog_podcasts(status);
