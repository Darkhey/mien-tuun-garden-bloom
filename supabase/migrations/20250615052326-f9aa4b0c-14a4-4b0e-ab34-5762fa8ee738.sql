
CREATE TABLE public.blog_topic_blacklist (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    topic TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notes TEXT
);

COMMENT ON TABLE public.blog_topic_blacklist IS 'Enthält Themen oder Schlüsselwörter, um zu verhindern, dass die KI Artikel darüber generiert.';
COMMENT ON COLUMN public.blog_topic_blacklist.topic IS 'Das gesperrte Thema oder Schlüsselwort (wird case-insensitive geprüft).';
COMMENT ON COLUMN public.blog_topic_blacklist.notes IS 'Optionale Notizen, warum dieses Thema gesperrt ist.';

-- RLS aktivieren
ALTER TABLE public.blog_topic_blacklist ENABLE ROW LEVEL SECURITY;

-- Öffentlichen Lesezugriff erlauben, da die Edge Function ihn benötigt
CREATE POLICY "Allow public read-only access"
ON public.blog_topic_blacklist
FOR SELECT
USING (true);

-- Administratoren vollen Zugriff gewähren
CREATE POLICY "Allow admin full access"
ON public.blog_topic_blacklist
FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role))
WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role));

