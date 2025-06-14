
-- Table anlegen
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_url text,
  is_premium boolean NOT NULL DEFAULT false,
  custom_role text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: User kann nur sein eigenes Profil sehen
CREATE POLICY "User can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: User kann nur sein eigenes Profil bearbeiten
CREATE POLICY "User can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);
