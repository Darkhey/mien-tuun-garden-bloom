
-- Slug-Spalte ergänzen, unique & nicht-null, leere vorhandene durch fallback slug aus title (vereinfachtes Beispiel)
ALTER TABLE public.recipes ADD COLUMN slug text;

-- Füge einfache Slugs für existierende Einträge basierend auf title hinzu (vereinfachtes German-Slugging)
UPDATE public.recipes SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;

-- Setze slug als UNIQUE (duplikate müssen ggf. manuell bereinigt werden, falls es Überschneidungen gibt)
ALTER TABLE public.recipes ADD CONSTRAINT recipes_slug_unique UNIQUE (slug);

-- Slug darf nicht null sein (ab sofort für neue Einträge)
ALTER TABLE public.recipes ALTER COLUMN slug SET NOT NULL;
