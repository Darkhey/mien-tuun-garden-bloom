-- Insert example job configurations
INSERT INTO scheduled_jobs.job_configs (
  name,
  description,
  schedule_pattern,
  schedule_type,
  target_table,
  template_data,
  is_active
) VALUES (
  'Täglicher Blog-Beitrag',
  'Erstellt automatisch einen Blog-Beitrag-Entwurf jeden Tag um 9 Uhr',
  '0 9 * * *',
  'daily',
  'blog_posts',
  '{
    "title": "Automatisch generierter Beitrag vom {{date}}",
    "content": "Dieser Beitrag wurde automatisch durch einen geplanten Job erstellt.",
    "excerpt": "Automatisch generierter Beitrag",
    "category": "Automatisierung",
    "status": "entwurf",
    "published": false,
    "tags": ["automatisch", "geplant"],
    "author": "System"
  }',
  false
), (
  'Wöchentliches Rezept',
  'Erstellt automatisch ein Rezept jeden Montag um 10 Uhr',
  '0 10 * * 1',
  'weekly',
  'recipes',
  '{
    "title": "Wochenrezept: {{date}}",
    "description": "Automatisch generiertes Wochenrezept",
    "ingredients": [{"name": "Beispielzutat", "amount": 100, "unit": "g"}],
    "instructions": ["Schritt 1: Dies ist ein automatisch generiertes Rezept"],
    "status": "entwurf",
    "author": "System"
  }',
  false
), (
  'Monatlicher Saisonaler Beitrag',
  'Erstellt einen saisonalen Blog-Beitrag am ersten Tag jedes Monats',
  '0 8 1 * *',
  'monthly',
  'blog_posts',
  '{
    "title": "Saisonale Tipps für {{month}}",
    "content": "Hier sind die saisonalen Tipps für diesen Monat...",
    "excerpt": "Monatliche saisonale Tipps",
    "category": "Saisonal",
    "status": "entwurf",
    "published": false,
    "tags": ["saisonal", "monatlich", "tipps"],
    "author": "System"
  }',
  false
);