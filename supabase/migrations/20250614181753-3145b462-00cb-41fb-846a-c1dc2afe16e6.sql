
-- Tabelle für Rezept-Bewertungen
CREATE TABLE public.recipe_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Nur 1 Bewertung pro User pro Rezept zulassen
CREATE UNIQUE INDEX unique_rating_per_user_per_recipe ON public.recipe_ratings (recipe_id, user_id);

-- Tabelle für Rezept-Kommentare
CREATE TABLE public.recipe_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabelle für Blog-Bewertungen
CREATE TABLE public.blog_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_slug TEXT NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Nur 1 Bewertung pro User pro Blogartikel zulassen
CREATE UNIQUE INDEX unique_rating_per_user_per_blog ON public.blog_ratings (blog_slug, user_id);

-- Tabelle für Blog-Kommentare
CREATE TABLE public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_slug TEXT NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Security praktisch: Nur eigene Kommentare und Bewertungen anzeigen / schreiben
ALTER TABLE public.recipe_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow user insert/select their ratings" ON public.recipe_ratings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.recipe_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow user insert/select their comments" ON public.recipe_comments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.blog_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow user insert/select their ratings" ON public.blog_ratings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow user insert/select their comments" ON public.blog_comments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
