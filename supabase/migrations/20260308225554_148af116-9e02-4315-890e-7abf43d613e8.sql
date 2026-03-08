
-- Remove old cron jobs
SELECT cron.unschedule('invoke-generate-blog-post-every-6h');
SELECT cron.unschedule('invoke-auto-blog-post-every-6h');

-- Daily 07:00 UTC: auto-blog-post (Marianne-style article)
SELECT cron.schedule(
  'daily-auto-blog-post-morning',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url:='https://ublbxvpmoccmegtwaslh.supabase.co/functions/v1/auto-blog-post',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibGJ4dnBtb2NjbWVndHdhc2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjExNTksImV4cCI6MjA2NTQ5NzE1OX0.MHtBC8D73NtPBONH2Qg0-hBZsyUyfDTUYZgzB_HEHpQ"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Daily 14:00 UTC: daily-content-pipeline (trend-based article)
SELECT cron.schedule(
  'daily-content-pipeline-afternoon',
  '0 14 * * *',
  $$
  SELECT net.http_post(
    url:='https://ublbxvpmoccmegtwaslh.supabase.co/functions/v1/daily-content-pipeline',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibGJ4dnBtb2NjbWVndHdhc2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjExNTksImV4cCI6MjA2NTQ5NzE1OX0.MHtBC8D73NtPBONH2Qg0-hBZsyUyfDTUYZgzB_HEHpQ"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Daily 06:00 UTC: fetch-current-trends
SELECT cron.schedule(
  'daily-trend-analysis',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url:='https://ublbxvpmoccmegtwaslh.supabase.co/functions/v1/fetch-current-trends',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibGJ4dnBtb2NjbWVndHdhc2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjExNTksImV4cCI6MjA2NTQ5NzE1OX0.MHtBC8D73NtPBONH2Qg0-hBZsyUyfDTUYZgzB_HEHpQ"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
