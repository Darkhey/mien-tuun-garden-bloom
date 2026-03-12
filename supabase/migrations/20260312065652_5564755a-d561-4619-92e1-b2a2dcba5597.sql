-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Update pipeline_config to auto-publish
UPDATE pipeline_config SET auto_publish = true, quality_threshold = 60 WHERE id = 'f75f9651-d342-4639-9b41-8942090a2bd9';

-- Activate content automation config
UPDATE content_automation_configs SET is_active = true WHERE id = '66dafb79-0055-46b7-8568-2223fbced1ac';