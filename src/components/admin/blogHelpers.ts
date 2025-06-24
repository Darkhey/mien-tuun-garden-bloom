/**
 * Hilfsfunktionen für KI Blog Creator Workflows
 */

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

// Aktualisierte Trend-Tags passend zu den neuen Kategorien
const TREND_TAGS = {
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

export function getTrendTags(category: string, season: string) {
  const catTags = TREND_TAGS[category as keyof typeof TREND_TAGS] || TREND_TAGS.default;
  const seasonTag = season ? [season.charAt(0).toUpperCase() + season.slice(1)] : [];
  return Array.from(new Set([...catTags, ...seasonTag]));
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
  
  // Kombiniere Thema/Input mit Kontext und mache Kategorien zur Pflicht
  return [topicInput || input, ...contextParts].filter(Boolean).join(" ");
}
