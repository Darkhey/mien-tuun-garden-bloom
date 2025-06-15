
-- 1. Status-Spalte zu recipes & blog_posts (Default: 'entwurf')
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'entwurf';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'entwurf';

-- 2. Recipe Versions-Tabelle
CREATE TABLE IF NOT EXISTS public.recipe_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  image_url text,
  description text,
  ingredients jsonb,
  instructions jsonb,
  category text,
  season text,
  tags text[],
  author text,
  prep_time_minutes integer,
  cook_time_minutes integer,
  servings integer,
  difficulty text,
  status text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES public.recipes (id) ON DELETE CASCADE
);

-- 3. Blog Post Versions-Tabelle
CREATE TABLE IF NOT EXISTS public.blog_post_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  content text,
  excerpt text,
  category text,
  tags text[],
  content_types text[],
  season text,
  audiences text[],
  featured_image text,
  og_image text,
  seo_title text,
  seo_description text,
  seo_keywords text[],
  status text,
  published boolean,
  featured boolean,
  reading_time integer,
  author text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  FOREIGN KEY (blog_post_id) REFERENCES public.blog_posts (id) ON DELETE CASCADE
);

-- 4. Optional: Indexe für schnelles Abfragen der Versionen
CREATE INDEX IF NOT EXISTS idx_recipe_versions_recipe_id ON public.recipe_versions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_versions_blog_post_id ON public.blog_post_versions(blog_post_id);

-- 5. RLS für Versionierung: Nur Eigentümer/Admin darf Versionen erzeugen/sehen
ALTER TABLE public.recipe_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own or admin can select recipe_versions"
  ON public.recipe_versions
  FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Own or admin can insert recipe_versions"
  ON public.recipe_versions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.blog_post_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own or admin can select blog_post_versions"
  ON public.blog_post_versions
  FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Own or admin can insert blog_post_versions"
  ON public.blog_post_versions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
