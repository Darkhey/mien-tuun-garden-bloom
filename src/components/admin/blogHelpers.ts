
/**
 * Hilfsfunktionen für KI Blog Creator Workflows
 */

export const BLOG_CATEGORIES = [
  { value: "gartenplanung", label: "Gartenplanung" },
  { value: "saisonale-kueche", label: "Saisonale Küche" },
  { value: "nachhaltigkeit", label: "Nachhaltigkeit" },
  { value: "diY-projekte", label: "DIY Projekte" },
  { value: "ernte", label: "Ernte" },
  { value: "selbstversorgung", label: "Selbstversorgung" },
  { value: "tipps-tricks", label: "Tipps & Tricks" },
  { value: "sonstiges", label: "Sonstiges" },
];

export const SEASONS = [
  { value: "frühling", label: "Frühling" },
  { value: "sommer", label: "Sommer" },
  { value: "herbst", label: "Herbst" },
  { value: "winter", label: "Winter" },
  { value: "ganzjährig", label: "Ganzjährig" },
];

// Trend-Tags
const TREND_TAGS = {
  gartenplanung: ["Permakultur", "No-Dig", "Biogarten", "Hochbeet"],
  "saisonale-kueche": ["Meal Prep", "Zero Waste", "Fermentieren", "One Pot"],
  nachhaltig: ["Plastikfrei", "Regenerativ", "Naturgarten"],
  "diY-projekte": ["Upcycling", "Balkonideen"],
  ernte: ["Haltbarmachen", "Kräutergarten", "Vorrat"],
  selbstversorgung: ["Unabhängigkeit", "Microgreens", "Wildkräuter"],
  "tipps-tricks": ["Tool Hacks", "Schädlingskontrolle"],
  sonstiges: ["Inspiration"],
  default: ["Nachhaltig", "DIY", "Tipps"]
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
    "Bitte nur knackige, inspirierende Titel zurückgeben."
  ];
  return [topicInput || input, ...contextParts].filter(Boolean).join(" ");
}
