
-- Tabelle für alle jemals generierten/artikulierter Themen (für Dubletten- & Diversitäts-Tracking):
CREATE TABLE IF NOT EXISTS public.blog_topic_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL,
  title text NOT NULL,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  used_in_post text, -- blog_posts.slug des tatsächlich veröffentlichten Artikels (optional)
  reason text,       -- z.B. "duplicate", "used", "blacklisted"
  try_count int DEFAULT 1,
  context jsonb      -- Optionale Zusatzinfos (z.B. Prompt, KI-Antwort, Kategorie)
);

-- Index für performante Nachschlagen nach Slug und Titel:
CREATE INDEX IF NOT EXISTS idx_blog_topic_history_slug ON public.blog_topic_history(slug);
CREATE INDEX IF NOT EXISTS idx_blog_topic_history_title ON public.blog_topic_history(title);

-- Optional: Index/Performance für partial matching (fuzzy search), falls später nötig
-- CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;
-- CREATE INDEX IF NOT EXISTS idx_blog_topic_history_title_trgm ON public.blog_topic_history USING GIN (title gin_trgm_ops);

