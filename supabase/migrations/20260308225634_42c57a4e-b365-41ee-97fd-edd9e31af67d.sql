
INSERT INTO cron_jobs (name, description, cron_expression, function_name, function_payload, enabled, status, job_type, created_by, tags)
VALUES 
  ('Täglicher Blogartikel (Morgen)', 'Generiert täglich um 07:00 UTC einen neuen Marianne-Stil Blogartikel mit auto-blog-post', '0 7 * * *', 'auto-blog-post', '{}', true, 'active', 'content_generation', 'ed1831e6-342f-4b1b-8fe9-5d4945a3646c', ARRAY['content', 'daily', 'blog']),
  ('Trend-basierter Artikel (Nachmittag)', 'Generiert täglich um 14:00 UTC einen trendbasierten Artikel mit daily-content-pipeline', '0 14 * * *', 'daily-content-pipeline', '{}', true, 'active', 'content_generation', 'ed1831e6-342f-4b1b-8fe9-5d4945a3646c', ARRAY['content', 'daily', 'trends']),
  ('Trend-Analyse', 'Ruft täglich um 06:00 UTC aktuelle Garten/Küchen-Trends ab', '0 6 * * *', 'fetch-current-trends', '{}', true, 'active', 'performance_analysis', 'ed1831e6-342f-4b1b-8fe9-5d4945a3646c', ARRAY['trends', 'daily', 'analysis']);

INSERT INTO pipeline_config (quality_threshold, auto_publish, batch_size, target_category)
SELECT 75, false, 2, 'Allgemein'
WHERE NOT EXISTS (SELECT 1 FROM pipeline_config LIMIT 1);
