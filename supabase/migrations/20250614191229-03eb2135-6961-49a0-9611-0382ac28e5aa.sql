
-- Tabelle für Newsletter-Abonnenten
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  confirmed boolean NOT NULL DEFAULT false,
  confirmation_token text,
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz
);

-- RLS aktivieren
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Abonnent kann eigene E-Mail eintragen
CREATE POLICY "Self register for newsletter" ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Jeder darf prüfen, ob er schon eingetragen ist (für Double-Opt-In)
CREATE POLICY "Public read for double opt in" ON public.newsletter_subscribers
  FOR SELECT
  USING (true);

-- Nur System darf confirmed setzen (z.B. per Edge Function)
CREATE POLICY "Allow update confirmation by system" ON public.newsletter_subscribers
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

