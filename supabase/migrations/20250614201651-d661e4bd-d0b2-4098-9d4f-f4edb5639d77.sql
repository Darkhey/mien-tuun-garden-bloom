
-- Row Level Security für die profiles-Tabelle aktivieren
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder Nutzer darf das eigene Profil lesen
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Jeder Nutzer darf sein eigenes Profil ändern
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Jeder Nutzer darf genau ein Profil für sich selbst anlegen
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Optional: Profil für hallo@klexgetier.de explizit anlegen
-- Schritt 1: Im Dashboard die entsprechende UUID nachschauen (z.B. ...)
-- Schritt 2: Statement ausführen:
-- INSERT INTO public.profiles (id, display_name) VALUES ('USER-UUID-HIER', 'hallo');

