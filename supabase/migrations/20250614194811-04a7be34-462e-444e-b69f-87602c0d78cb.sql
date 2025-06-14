
-- Schritt 1: Erlaube, dass Rezepte keinen zugeordneten Benutzer haben (z.B. für offizielle Rezepte der Seite)
ALTER TABLE public.recipes ALTER COLUMN user_id DROP NOT NULL;

-- Schritt 2: Entferne die alte Sicherheitsregel, die immer einen Benutzer erforderte
DROP POLICY "recipes: only own" ON public.recipes;

-- Schritt 3: Neue Regel, damit jeder alle Rezepte ansehen kann
CREATE POLICY "Public recipes are viewable by everyone."
  ON public.recipes FOR SELECT
  USING (true);

-- Schritt 4: Neue Regel, damit eingeloggte Benutzer ihre eigenen Rezepte erstellen können
CREATE POLICY "Users can insert their own recipes."
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Schritt 5: Neue Regel, damit Benutzer ihre eigenen Rezepte aktualisieren können
CREATE POLICY "Users can update their own recipes."
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Schritt 6: Neue Regel, damit Benutzer ihre eigenen Rezepte löschen können
CREATE POLICY "Users can delete their own recipes."
  ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);
