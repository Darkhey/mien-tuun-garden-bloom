/**
 * Zentrale Blog-Konfiguration für einheitliche Kategorien und Mariannes Stil
 */

// Einheitliche Kategorien für Frontend und Backend
export const BLOG_CATEGORIES = [
  { value: "Garten & Planung", label: "Garten & Planung" },
  { value: "Pflanzenpflege", label: "Pflanzenpflege" },
  { value: "Ernte & Küche", label: "Ernte & Küche" },
  { value: "Nachhaltigkeit & Umwelt", label: "Nachhaltigkeit & Umwelt" },
  { value: "Spezielle Gartenbereiche", label: "Spezielle Gartenbereiche" },
  { value: "Selbermachen & Ausrüstung", label: "Selbermachen & Ausrüstung" },
  { value: "Philosophie & Lifestyle", label: "Philosophie & Lifestyle" },
  { value: "Allgemein", label: "Allgemein" },
];

export const SEASONS = [
  { value: "Frühling", label: "Frühling" },
  { value: "Sommer", label: "Sommer" },
  { value: "Herbst", label: "Herbst" },
  { value: "Winter", label: "Winter" },
  { value: "Ganzjährig", label: "Ganzjährig" },
];

// Vereinfachte Hauptkategorien für schnelle Filteransichten
export const MAIN_CATEGORIES = [
  { id: "garten-planung", name: "Garten", icon: "\uD83C\uDF31" },
  { id: "ernte-kueche", name: "Küche", icon: "\uD83C\uDF45" },
  { id: "selbermachen-ausruestung", name: "DIY", icon: "\uD83D\uDD28" },
  { id: "nachhaltigkeit-umwelt", name: "Nachhaltig", icon: "\u267B\uFE0F" },
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

// Kategorie-spezifische Trend-Tags
export const TREND_TAGS = {
  "Garten & Planung": ["Beetgestaltung", "Aussaat", "Hochbeet", "Mischkultur", "Permakultur"],
  "Pflanzenpflege": ["Gießen", "Düngen", "Schneiden", "Schädlingsfrei", "Kompost"],
  "Ernte & Küche": ["Saisonal", "Rezepte", "Haltbarmachen", "Lagern", "Küchentipps"],
  "Nachhaltigkeit & Umwelt": ["Plastikfrei", "Regenerativ", "Naturgarten", "Kreislauf", "Upcycling"],
  "Spezielle Gartenbereiche": ["Urban Gardening", "Balkon", "Indoor", "Gewächshaus", "Wassersparen"],
  "Selbermachen & Ausrüstung": ["DIY", "Werkzeuge", "Upcycling", "Bauanleitungen", "Gartenmöbel"],
  "Philosophie & Lifestyle": ["Selbstversorgung", "Minimalismus", "Gartenwissen", "Lebensstil", "Inspiration"],
  "Allgemein": ["Tipps", "Inspiration", "Ratgeber", "Wissen", "Grundlagen"],
  default: ["Nachhaltig", "DIY", "Tipps", "Garten", "Natürlich"]
};

// Mariannes charakteristischer Schreibstil
export const MARIANNE_STYLE = {
  greeting: "Moin moin ihr Lieben",
  farewell: "bis zum nächsten Mal meine Lieben",
  
  // Charakteristische Formulierungen
  phrases: {
    experience: [
      "aus meiner langjährigen Erfahrung kann ich euch sagen",
      "nach all den Jahren im Garten habe ich gelernt",
      "ich habe schon so manches ausprobiert und",
      "in meinem Garten hat sich bewährt"
    ],
    encouragement: [
      "lasst euch nicht entmutigen",
      "ihr schafft das bestimmt",
      "mit ein bisschen Geduld klappt das",
      "probiert es einfach mal aus"
    ],
    personal: [
      "bei mir im Garten",
      "in meiner Küche",
      "aus eigener Erfahrung",
      "ich schwöre darauf"
    ],
    regional: [
      "hier im Norden",
      "bei uns an der Küste",
      "in unseren Breiten",
      "wie wir Norddeutschen sagen"
    ]
  },
  
  // Struktur-Vorgaben
  structure: {
    minWordCount: 1200,
    maxWordCount: 1400,
    targetReadingTime: 7, // Minuten
    requiredSections: [
      "Persönliche Einleitung",
      "Praktische Anleitungen", 
      "Tipps aus der Erfahrung",
      "Häufige Fehler vermeiden",
      "Saisonale Hinweise",
      "Persönlicher Abschluss"
    ]
  },
  
  // Ton und Stil
  tone: {
    address: "ihr", // Nie "Sie"
    style: "herzlich, persönlich, authentisch",
    expertise: "15 Jahre Garten- und Kochblogging",
    personality: "norddeutsche Gemütlichkeit, ermutigend, praktisch"
  }
};

// Hilfsfunktionen
export function getTrendTags(category: string, season: string): string[] {
  const catTags = TREND_TAGS[category as keyof typeof TREND_TAGS] || TREND_TAGS.default;
  const seasonTag = season ? [season.charAt(0).toUpperCase() + season.slice(1)] : [];
  return Array.from(new Set([...catTags, ...seasonTag]));
}

export function buildMariannePrompt(topic: string, category: string, season?: string): string {
  const currentSeason = season || getCurrentSeason();
  
  return `Du bist Marianne, eine erfahrene deutsche Garten- und Küchenbloggerin mit 15 Jahren Erfahrung.

WICHTIG: Schreibe einen vollständigen, ausführlichen Blogartikel von mindestens 1200 Wörtern über "${topic}".

ERÖFFNUNG: Beginne IMMER mit "${MARIANNE_STYLE.greeting}"
ABSCHLUSS: Beende IMMER mit "${MARIANNE_STYLE.farewell}"

STIL & PERSÖNLICHKEIT:
- Herzlich, persönlich und authentisch (verwende "ihr" und "euch", nie "Sie")
- Teile persönliche Erfahrungen und Geschichten aus deinem eigenen Garten/deiner Küche
- Verwende norddeutsche Ausdrücke und regionale Bezüge
- Ermutigend und praktisch orientiert
- Sage Dinge wie: "aus meiner langjährigen Erfahrung", "bei mir im Garten", "hier im Norden"

STRUKTUR (SEHR WICHTIG):
1. H1 Hauptüberschrift: Eingängig und SEO-optimiert
2. Persönliche Einleitung (2-3 Absätze mit "${MARIANNE_STYLE.greeting}" und persönlicher Geschichte)
3. 4-6 Hauptabschnitte mit H2-Überschriften
4. Detaillierte Schritt-für-Schritt Anleitungen
5. Persönliche Tipps und Tricks in Listen
6. Häufige Fehler und wie man sie vermeidet
7. Saisonale Hinweise für ${currentSeason}
8. Abschluss mit Ermutigung und "${MARIANNE_STYLE.farewell}"

INHALT ANFORDERUNGEN:
- Mindestens 1200 Wörter (sehr wichtig!)
- Praxisnahe, umsetzbare Tipps
- Deutsche Pflanzennamen und regionale Bezüge
- Wissenschaftliche Fakten einfach erklärt
- Konkrete Zeitangaben und Mengenangaben
- Verweise auf eigene Erfahrungen ("Bei mir hat sich bewährt...", "Ich schwöre darauf...")

KATEGORIE: ${category}
SAISON: ${currentSeason}
THEMA: ${topic}

Schreibe jetzt den vollständigen Artikel im Markdown-Format:`;
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "Frühling";
  if (month >= 6 && month <= 8) return "Sommer";
  if (month >= 9 && month <= 11) return "Herbst";
  return "Winter";
}

export function buildContextFromMeta({
  topicInput, input, category, season, audiences, contentType, tags, excerpt, imageUrl,
}: {
  topicInput?: string,
  input?: string,
  category?: string,
  season?: string,
  audiences?: string[],
  contentType?: string[],
  tags?: string[],
  excerpt?: string,
  imageUrl?: string,
}) {
  const contextParts = [
    category ? `Kategorie: ${BLOG_CATEGORIES.find(c => c.value === category)?.label ?? category} (PFLICHT: Artikel muss in diese Kategorie gehören).` : "",
    season ? `Saison: ${SEASONS.find(s => s.value === season)?.label ?? season} (PFLICHT: Artikel muss saisonalen Bezug haben).` : "",
    audiences && audiences.length ? `Zielgruppe: ${audiences.join(", ")} (PFLICHT: Artikel muss für diese Zielgruppe geschrieben sein).` : "",
    contentType && contentType.length ? `Artikel-Typ/Format: ${contentType.join(", ")} (PFLICHT: Artikel muss diesem Format entsprechen).` : "",
    tags && tags.length ? `Tags: ${tags.join(", ")} (PFLICHT: Diese Tags müssen relevant im Artikel behandelt werden).` : "",
    excerpt ? `Kurzbeschreibung/Teaser: ${excerpt} (PFLICHT: Artikel muss diesen Inhalt abdecken)` : "",
    imageUrl ? `Bild: ${imageUrl}` : "",
    "WICHTIG: Alle angegebenen Kategorien, Saisons, Tags und Zielgruppen sind PFLICHTANGABEN und müssen im generierten Artikel berücksichtigt werden!"
  ];
  
  return [topicInput || input, ...contextParts].filter(Boolean).join(" ");
}