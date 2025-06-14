
-- Schritt 1: Füge neue Spalten zur recipes-Tabelle hinzu, um mehr Details zu speichern
ALTER TABLE public.recipes
  ADD COLUMN prep_time_minutes INTEGER,
  ADD COLUMN cook_time_minutes INTEGER,
  ADD COLUMN servings INTEGER,
  ADD COLUMN difficulty TEXT CHECK (difficulty IN ('einfach', 'mittel', 'schwer')),
  ADD COLUMN category TEXT,
  ADD COLUMN season TEXT CHECK (season IN ('frühling', 'sommer', 'herbst', 'winter', 'ganzjährig')),
  ADD COLUMN tags TEXT[],
  ADD COLUMN author TEXT;

-- Schritt 2: Aktualisiere das bestehende Holunderblütensirup-Rezept mit den neuen Daten
UPDATE public.recipes
SET
  prep_time_minutes = 15,
  cook_time_minutes = 10,
  servings = 4,
  difficulty = 'einfach',
  category = 'Konservieren',
  season = 'frühling',
  tags = '{"Sirup", "Holunder", "Getränk", "Geschenk"}',
  author = 'Mien Tuun'
WHERE
  slug = 'holunderbluetensirup-selber-machen';
