
/**
 * Hilfsfunktionen für KI Blog Creator Workflows
 */

export const BLOG_CATEGORIES = [
  { value: "gartenplanung", label: "Gartenplanung" },
  { value: "aussaat-pflanzung", label: "Aussaat & Pflanzung" },
  { value: "pflanzenpflege", label: "Pflanzenpflege" },
  { value: "schaedlingsbekaempfung", label: "Schädlingsbekämpfung" },
  { value: "kompostierung", label: "Kompostierung" },
  { value: "saisonale-kueche", label: "Saisonale Küche" },
  { value: "konservieren-haltbarmachen", label: "Konservieren & Haltbarmachen" },
  { value: "kraeuter-heilpflanzen", label: "Kräuter & Heilpflanzen" },
  { value: "nachhaltigkeit", label: "Nachhaltigkeit" },
  { value: "wassersparen-bewaesserung", label: "Wassersparen & Bewässerung" },
  { value: "diY-projekte", label: "DIY Projekte" },
  { value: "gartengeraete-werkzeuge", label: "Gartengeräte & Werkzeuge" },
  { value: "ernte", label: "Ernte" },
  { value: "lagerung-vorratshaltung", label: "Lagerung & Vorratshaltung" },
  { value: "selbstversorgung", label: "Selbstversorgung" },
  { value: "permakultur", label: "Permakultur" },
  { value: "urban-gardening", label: "Urban Gardening" },
  { value: "balkon-terrasse", label: "Balkon & Terrasse" },
  { value: "indoor-gardening", label: "Indoor Gardening" },
  { value: "tipps-tricks", label: "Tipps & Tricks" },
  { value: "jahreszeitliche-arbeiten", label: "Jahreszeitliche Arbeiten" },
  { value: "bodenpflege", label: "Bodenpflege" },
  { value: "sonstiges", label: "Sonstiges" },
];

export const SEASONS = [
  { value: "frühling", label: "Frühling" },
  { value: "sommer", label: "Sommer" },
  { value: "herbst", label: "Herbst" },
  { value: "winter", label: "Winter" },
  { value: "ganzjährig", label: "Ganzjährig" },
];

// Erweiterte Trend-Tags passend zu den neuen Kategorien
const TREND_TAGS = {
  gartenplanung: ["Permakultur", "No-Dig", "Biogarten", "Hochbeet", "Mischkultur"],
  "aussaat-pflanzung": ["Direktsaat", "Vorkultur", "Jungpflanzen", "Saatgut", "Mondkalender"],
  pflanzenpflege: ["Biologisch", "Naturdünger", "Mulchen", "Schnitt", "Pflanzenstärkung"],
  schaedlingsbekaempfung: ["Nützlinge", "Hausmittel", "Biologisch", "Präventiv", "Natürlich"],
  kompostierung: ["Wurmkompost", "Bokashi", "Thermokomposter", "Gründüngung"],
  "saisonale-kueche": ["Meal Prep", "Zero Waste", "Fermentieren", "One Pot", "Regional"],
  "konservieren-haltbarmachen": ["Einkochen", "Fermentieren", "Trocknen", "Einfrieren", "Einlegen"],
  "kraeuter-heilpflanzen": ["Heilkräuter", "Tee", "Naturmedizin", "Aromatherapie", "Kräutergarten"],
  nachhaltigkeit: ["Plastikfrei", "Regenerativ", "Naturgarten", "Kreislaufwirtschaft", "Upcycling"],
  "wassersparen-bewaesserung": ["Regenwasser", "Tröpfchenbewässerung", "Mulchen", "Wasserspeicher"],
  "diY-projekte": ["Upcycling", "Balkonideen", "Selbstgebaut", "Recycling", "Kreativ"],
  "gartengeraete-werkzeuge": ["Pflege", "Auswahl", "Selbstbau", "Reparatur", "Ergonomisch"],
  ernte: ["Haltbarmachen", "Kräutergarten", "Vorrat", "Timing", "Lagerung"],
  "lagerung-vorratshaltung": ["Kellerlagerung", "Mieten", "Konservierung", "Haltbarkeit"],
  selbstversorgung: ["Unabhängigkeit", "Microgreens", "Wildkräuter", "Autarkie", "Planung"],
  permakultur: ["Nachhaltigkeit", "Kreisläufe", "Zonierung", "Mischkultur", "Wassermanagement"],
  "urban-gardening": ["Stadtgarten", "Gemeinschaftsgarten", "Guerilla Gardening", "Kleinfläche"],
  "balkon-terrasse": ["Topfgarten", "Platzsparend", "Mobilität", "Windschutz", "Bewässerung"],
  "indoor-gardening": ["Hydroponik", "LED-Beleuchtung", "Microgreens", "Zimmerpflanzen"],
  "tipps-tricks": ["Tool Hacks", "Schädlingskontrolle", "Lifehacks", "Profi-Tipps"],
  "jahreszeitliche-arbeiten": ["Saisonkalender", "Gartenarbeiten", "Timing", "Planung"],
  bodenpflege: ["Bodenanalyse", "Humusaufbau", "Gründüngung", "Lebendigkeit", "pH-Wert"],
  sonstiges: ["Inspiration", "Allgemein", "Verschiedenes"],
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
    category ? `Kategorie: ${BLOG_CATEGORIES.find(c => c.value === category)?.label ?? category}.` : "",
    season ? `Saison: ${SEASONS.find(s => s.value === season)?.label ?? season}.` : "",
    audiences && audiences.length ? `Zielgruppe: ${audiences.join(", ")}.` : "",
    contentType && contentType.length ? `Artikel-Typ/Format: ${contentType.join(", ")}.` : "",
    tags && tags.length ? `Tags: ${tags.join(", ")}.` : "",
    excerpt ? `Kurzbeschreibung/Teaser: ${excerpt}` : "",
    imageUrl ? `Bild: ${imageUrl}` : "",
  ];
  
  // Kombiniere Thema/Input mit Kontext, aber ohne die Systemanweisung
  return [topicInput || input, ...contextParts].filter(Boolean).join(" ");
}
