
-- Schritt 1: Enum für Rollen anlegen
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Schritt 2: user_roles-Tabelle für explizite Rollenzuweisung
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Schritt 3: RLS aktivieren
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Schritt 4: SECURITY DEFINER Helper zum Rollencheck
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

-- Schritt 5: RLS-Policy zum Lesen der user_roles NUR für Admins
CREATE POLICY "admins can read user_roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
