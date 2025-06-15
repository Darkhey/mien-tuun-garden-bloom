
-- Aktiviere die benötigten Extensions (falls nicht bereits aktiv)
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Cronjob: Alle 6h soll automatisch ein KI-Artikel erzeugt und gespeichert werden
select
  cron.schedule(
    'invoke-auto-blog-post-every-6h',  -- Name des Jobs (individuell wählbar)
    '0 */6 * * *',  -- alle 6 Stunden (um Minute 0, Stunde 0/6/12/18)
    $$
      select
        net.http_post(
          url:='https://ublbxvpmoccmegtwaslh.supabase.co/functions/v1/auto-blog-post',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibGJ4dnBtb2NjbWVndHdhc2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjExNTksImV4cCI6MjA2NTQ5NzE1OX0.MHtBC8D73NtPBONH2Qg0-hBZsyUyfDTUYZgzB_HEHpQ"}'::jsonb,
          body:='{}'::jsonb   -- Kein Payload nötig; die Logik läuft serverseitig vollständig randomisiert
        ) as request_id;
    $$
  );

-- Optional: Den alten Cronjob auf "generate-blog-post" ggf. entfernen,
-- falls nicht mehr benötigt (ansonsten kann er bestehen bleiben oder inaktiv gesetzt werden)
