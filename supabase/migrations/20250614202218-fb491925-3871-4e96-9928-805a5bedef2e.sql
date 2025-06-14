
-- Admin-Rolle an hallo@klexgetier.de vergeben:

-- Schritt 1: Ermittle die User-UUID für die angegebene E-Mail-Adresse
-- (im Supabase Dashboard /auth/users einsehbar, ansonsten kann man sie so im SQL ermitteln:)
DO $$
DECLARE
  user_uuid uuid;
BEGIN
  SELECT id INTO user_uuid FROM auth.users WHERE email = 'hallo@klexgetier.de';
  IF user_uuid IS NOT NULL THEN
    -- Schritt 2: Admin-Rolle setzen, falls noch nicht vorhanden
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_uuid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;
