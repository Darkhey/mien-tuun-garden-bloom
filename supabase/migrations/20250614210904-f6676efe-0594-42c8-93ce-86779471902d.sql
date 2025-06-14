
-- Stelle sicher, dass die Erweiterungen aktiviert sind
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Cronjob alle 6 Stunden (at minute 0, hour 0/6/12/18)
select
  cron.schedule(
    'invoke-generate-blog-post-every-6h',
    '0 */6 * * *',  -- alle 6 Stunden
    $$
      select
        net.http_post(
          url:='https://ublbxvpmoccmegtwaslh.supabase.co/functions/v1/generate-blog-post',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibGJ4dnBtb2NjbWVndHdhc2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjExNTksImV4cCI6MjA2NTQ5NzE1OX0.MHtBC8D73NtPBONH2Qg0-hBZsyUyfDTUYZgzB_HEHpQ"}'::jsonb,
          body:='{"prompt":"Schreibe einen neuen inspirierenden Garten- oder Küchenblogartikel inklusive saisonalem Bezug, Trends und Tipps."}'::jsonb
        ) as request_id;
    $$
  );
