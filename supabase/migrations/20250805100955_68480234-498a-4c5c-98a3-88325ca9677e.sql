-- Create job templates for automated content creation
INSERT INTO job_templates (name, description, job_type, function_name, default_cron_expression, category, default_payload) VALUES
('Daily Blog Post', 'Automatische tägliche Blog-Artikel Generierung', 'content_generation', 'auto-blog-post', '0 9 * * *', 'content', '{"prompt": "Schreibe einen neuen inspirierenden Garten- oder Küchenblogartikel inklusive saisonalem Bezug, Trends und Tipps."}'),
('SEO Article Generator', 'SEO-optimierte Artikel 3x pro Woche', 'content_generation', 'create-strategy-article', '0 10 * * 1,3,5', 'seo', '{"topic": "Gartentipps", "category": "garten", "urgency": "medium"}'),
('Seasonal Content', 'Wöchentliche saisonale Inhalte', 'content_generation', 'create-strategy-article', '0 11 * * 1', 'seasonal', '{"topic": "Saisonale Gartentipps", "category": "garten", "season": "current"}'),
('Instagram Post Generator', 'Tägliche Instagram Posts um 18:00 Uhr', 'social_media', 'instagram-post', '0 18 * * *', 'social', '{"type": "garden_tip", "template": "daily"}'),
('Recipe of the Week', 'Wöchentliche Rezept-Artikel', 'content_generation', 'generate-recipe', '0 8 * * 2', 'recipe', '{"type": "seasonal", "category": "hauptgericht"}')
ON CONFLICT (name) DO NOTHING;

-- Create default cron jobs for automated content
INSERT INTO cron_jobs (name, description, cron_expression, job_type, function_name, function_payload, enabled, created_by, retry_count, timeout_seconds, tags, status) VALUES
('Daily Blog Auto-Generator', 'Generiert täglich automatisch neue Blog-Artikel', '0 9 * * *', 'content_generation', 'auto-blog-post', '{"prompt": "Schreibe einen neuen inspirierenden Garten- oder Küchenblogartikel inklusive saisonalem Bezug, Trends und Tipps."}', true, '00000000-0000-0000-0000-000000000000', 3, 600, ARRAY['blog', 'auto', 'daily'], 'active'),
('SEO Article Generator', 'Erstellt SEO-optimierte Artikel Mo/Mi/Fr', '0 10 * * 1,3,5', 'content_generation', 'create-strategy-article', '{"topic": "Gartentipps", "category": "garten", "urgency": "medium"}', true, '00000000-0000-0000-0000-000000000000', 2, 450, ARRAY['seo', 'article', 'weekly'], 'active'),
('Weekly Recipe Generator', 'Wöchentliche Rezept-Generierung', '0 8 * * 2', 'content_generation', 'generate-recipe', '{"type": "seasonal", "category": "hauptgericht"}', true, '00000000-0000-0000-0000-000000000000', 2, 300, ARRAY['recipe', 'weekly'], 'active'),
('Instagram Daily Post', 'Tägliche Instagram Posts', '0 18 * * *', 'social_media', 'instagram-post', '{"type": "garden_tip", "template": "daily"}', true, '00000000-0000-0000-0000-000000000000', 2, 180, ARRAY['instagram', 'social', 'daily'], 'active')
ON CONFLICT (name) DO NOTHING;

-- Update next_run_at for all active jobs
UPDATE cron_jobs 
SET next_run_at = calculate_next_run_time(cron_expression) 
WHERE enabled = true AND next_run_at IS NULL;