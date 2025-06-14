
-- Schritt 1: Rezepte-Tabelle für gespeicherte Rezepte im „Rezeptebuch“
CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  image_url text,
  description text,
  ingredients jsonb,  -- Array von Zutaten, inkl. Menge etc.
  instructions jsonb, -- Array von Schritten
  source_blog_slug text, -- Von welchem Blogartikel abgeleitet, ggf. null
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Schritt 2: RLS aktivieren
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Schritt 3: RLS-Policies
CREATE POLICY "recipes: only own" ON public.recipes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
