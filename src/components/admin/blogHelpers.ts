
/**
 * Hilfsfunktionen für KI Blog Creator Workflows
 */

export const BLOG_CATEGORIES = [
  { value: "Gartenplanung", label: "Gartenplanung" },
  { value: "Aussaat & Pflanzung", label: "Aussaat & Pflanzung" },
  { value: "Pflanzenpflege", label: "Pflanzenpflege" },
  { value: "Schädlingsbekämpfung", label: "Schädlingsbekämpfung" },
  { value: "Kompostierung", label: "Kompostierung" },
  { value: "Saisonale Küche", label: "Saisonale Küche" },
  { value: "Konservieren & Haltbarmachen", label: "Konservieren & Haltbarmachen" },
  { value: "Kräuter & Heilpflanzen", label: "Kräuter & Heilpflanzen" },
  { value: "Nachhaltigkeit", label: "Nachhaltigkeit" },
  { value: "Wassersparen & Bewässerung", label: "Wassersparen & Bewässerung" },
  { value: "DIY Projekte", label: "DIY Projekte" },
  { value: "Gartengeräte & Werkzeuge", label: "Gartengeräte & Werkzeuge" },
  { value: "Ernte", label: "Ernte" },
  { value: "Lagerung & Vorratshaltung", label: "Lagerung & Vorratshaltung" },
  { value: "Selbstversorgung", label: "Selbstversorgung" },
  { value: "Permakultur", label: "Permakultur" },
  { value: "Urban Gardening", label: "Urban Gardening" },
  { value: "Balkon & Terrasse", label: "Balkon & Terrasse" },
  { value: "Indoor Gardening", label: "Indoor Gardening" },
  { value: "Tipps & Tricks", label: "Tipps & Tricks" },
  { value: "Jahreszeitliche Arbeiten", label: "Jahreszeitliche Arbeiten" },
  { value: "Bodenpflege", label: "Bodenpflege" },
  { value: "Sonstiges", label: "Sonstiges" },
];

export const SEASONS = [
  { value: "Frühling", label: "Frühling" },
  { value: "Sommer", label: "Sommer" },
  { value: "Herbst", label: "Herbst" },
  { value: "Winter", label: "Winter" },
  { value: "Ganzjährig", label: "Ganzjährig" },
];

// Erweiterte Trend-Tags passend zu den neuen Kategorien
const TREND_TAGS = {
  "Gartenplanung": ["Permakultur", "No-Dig", "Biogarten", "Hochbeet", "Mischkultur"],
  "Aussaat & Pflanzung": ["Direktsaat", "Vorkultur", "Jungpflanzen", "Saatgut", "Mondkalender"],
  "Pflanzenpflege": ["Biologisch", "Naturdünger", "Mulchen", "Schnitt", "Pflanzenstärkung"],
  "Schädlingsbekämpfung": ["Nützlinge", "Hausmittel", "Biologisch", "Präventiv", "Natürlich"],
  "Kompostierung": ["Wurmkompost", "Bokashi", "Thermokomposter", "Gründüngung"],
  "Saisonale Küche": ["Meal Prep", "Zero Waste", "Fermentieren", "One Pot", "Regional"],
  "Konservieren & Haltbarmachen": ["Einkochen", "Fermentieren", "Trocknen", "Einfrieren", "Einlegen"],
  "Kräuter & Heilpflanzen": ["Heilkräuter", "Tee", "Naturmedizin", "Aromatherapie", "Kräutergarten"],
  "Nachhaltigkeit": ["Plastikfrei", "Regenerativ", "Naturgarten", "Kreislaufwirtschaft", "Upcycling"],
  "Wassersparen & Bewässerung": ["Regenwasser", "Tröpfchenbewässerung", "Mulchen", "Wasserspeicher"],
  "DIY Projekte": ["Upcycling", "Balkonideen", "Selbstgebaut", "Recycling", "Kreativ"],
  "Gartengeräte & Werkzeuge": ["Pflege", "Auswahl", "Selbstbau", "Reparatur", "Ergonomisch"],
  "Ernte": ["Haltbarmachen", "Kräutergarten", "Vorrat", "Timing", "Lagerung"],
  "Lagerung & Vorratshaltung": ["Kellerlagerung", "Mieten", "Konservierung", "Haltbarkeit"],
  "Selbstversorgung": ["Unabhängigkeit", "Microgreens", "Wildkräuter", "Autarkie", "Planung"],
  "Permakultur": ["Nachhaltigkeit", "Kreisläufe", "Zonierung", "Mischkultur", "Wassermanagement"],
  "Urban Gardening": ["Stadtgarten", "Gemeinschaftsgarten", "Guerilla Gardening", "Kleinfläche"],
  "Balkon & Terrasse": ["Topfgarten", "Platzsparend", "Mobilität", "Windschutz", "Bewässerung"],
  "Indoor Gardening": ["Hydroponik", "LED-Beleuchtung", "Microgreens", "Zimmerpflanzen"],
  "Tipps & Tricks": ["Tool Hacks", "Schädlingskontrolle", "Lifehacks", "Profi-Tipps"],
  "Jahreszeitliche Arbeiten": ["Saisonkalender", "Gartenarbeiten", "Timing", "Planung"],
  "Bodenpflege": ["Bodenanalyse", "Humusaufbau", "Gründüngung", "Lebendigkeit", "pH-Wert"],
  "Sonstiges": ["Inspiration", "Allgemein", "Verschiedenes"],
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
