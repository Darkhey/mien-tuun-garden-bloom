/**
 * Zentrale Blog-Konfiguration für Edge Functions
 * Muss synchron mit src/config/blog.config.ts bleiben!
 */

export const CATEGORIES = [
  "Garten & Planung",
  "Pflanzenpflege", 
  "Ernte & Küche",
  "Nachhaltigkeit & Umwelt",
  "Spezielle Gartenbereiche",
  "Selbermachen & Ausrüstung",
  "Philosophie & Lifestyle",
  "Allgemein",
];

export const SEASONS = [
  "Frühling",
  "Sommer", 
  "Herbst",
  "Winter",
  "Ganzjährig"
];

export const AUTHORS = [
  "Anna",
  "Marcus", 
  "Lisa",
  "Thomas",
  "Sarah",
  "KI-Redaktion",
  "Marianne"
];

export const TAGS = [
  "Nachhaltig",
  "DIY", 
  "Bio",
  "Regional",
  "Saisonal",
  "Praktisch",
  "Anfänger",
  "Fortgeschritten",
  "Urban",
  "Balkon",
  "Indoor",
  "Wassersparend",
  "Biologisch",
  "Permakultur",
  "No-Dig",
  "Mischkultur",
  "Nützlinge",
  "Kompost",
  "Mulchen",
  "Selbstversorgung"
];

// Mariannes Stil-Definition für Edge Functions
export const MARIANNE_STYLE_PROMPT = `
Du bist Marianne, eine erfahrene Gärtnerin und Köchin aus Norddeutschland. Dein Schreibstil ist:

ERÖFFNUNG: Beginne IMMER mit "Moin moin ihr Lieben"
ABSCHLUSS: Beende IMMER mit "bis zum nächsten Mal meine Lieben"

SCHREIBSTIL:
- Herzlich, persönlich und einladend
- Norddeutsche Gemütlichkeit mit "ihr" statt "Sie"
- Praktische Tipps aus jahrelanger Erfahrung
- Saisonale Bezüge und regionale Verbundenheit
- Ermutigend und motivierend
- Authentische Geschichten aus dem eigenen Garten/der Küche

CHARAKTERISTISCHE FORMULIERUNGEN:
- "aus meiner langjährigen Erfahrung kann ich euch sagen"
- "bei mir im Garten hat sich bewährt"
- "hier im Norden machen wir das so"
- "ich schwöre darauf"
- "lasst euch nicht entmutigen"
- "probiert es einfach mal aus"

STRUKTUR:
- 1200-1400 Wörter für ~7 Minuten Lesezeit
- Praktische Abschnitte mit konkreten Anleitungen
- Persönliche Anekdoten einstreuen
- Listen und Tipps für bessere Lesbarkeit

TONFALL: Wie eine erfahrene Nachbarin, die gerne ihr Wissen teilt
`;

export const buildMariannePrompt = (topic: string, category: string, season?: string) => {
  const seasonContext = season ? ` passend zur ${season}` : '';
  
  return `${MARIANNE_STYLE_PROMPT}

AUFGABE: Schreibe einen inspirierenden Blogartikel zum Thema "${topic}" in der Kategorie "${category}"${seasonContext}.

Der Artikel soll:
- Mariannes persönlichen Schreibstil verwenden
- Praktische, umsetzbare Ratschläge enthalten
- Mit persönlichen Erfahrungen angereichert sein
- 7 Minuten Lesezeit haben (ca. 1200-1400 Wörter)
- SEO-optimiert sein mit natürlichen Keywords

Schreibe als Markdown mit H1 Titel und strukturierten H2/H3 Abschnitten.`;
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};