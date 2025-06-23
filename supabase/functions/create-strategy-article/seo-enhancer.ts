
export interface SEOEnhancedData {
  title: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  category: string;
  tags: string[];
  structuredData: any;
}

export function enhanceTitle(originalTitle: string, category: string, season: string): string {
  const titleEnhancements = {
    garten: [
      "Ultimative Anleitung:", "Profi-Tipps für", "Schritt-für-Schritt:", 
      "Gartenexperte verrät:", "Geheimtipps für", "Erfolgsrezept für"
    ],
    küche: [
      "Küchenprofi zeigt:", "Geniale Tricks für", "Meisterrezept:", 
      "Küchenzauber:", "Perfekte Anleitung für", "Geheimrezept:"
    ],
    nachhaltigkeit: [
      "Nachhaltig leben:", "Umweltbewusst:", "Grüne Alternative:", 
      "Öko-Tipps für", "Nachhaltige Lösung:", "Umweltfreundlich:"
    ]
  };

  const seasonalWords = {
    'Frühling': ['Frühjahr', 'Saisonstart', 'Neubeginn'],
    'Sommer': ['Sommersaison', 'Hochsaison', 'warme Tage'],
    'Herbst': ['Herbstzeit', 'Erntezeit', 'goldene Saison'],
    'Winter': ['Winterzeit', 'kalte Jahreszeit', 'Wintersaison']
  };

  const enhancements = titleEnhancements[category] || titleEnhancements.garten;
  const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
  
  let enhancedTitle = `${randomEnhancement} ${originalTitle}`;
  
  // Füge saisonale Wörter hinzu wenn passend
  if (season && seasonalWords[season]) {
    const seasonalWord = seasonalWords[season][Math.floor(Math.random() * seasonalWords[season].length)];
    enhancedTitle += ` im ${seasonalWord}`;
  }
  
  // Füge emotionale Trigger hinzu
  const emotionalTriggers = [
    "- So geht's richtig!",
    "- Einfach erklärt",
    "- Praktische Tipps",
    "- Mit Erfolgsgarantie",
    "- Schritt für Schritt"
  ];
  
  if (Math.random() > 0.3) {
    const trigger = emotionalTriggers[Math.floor(Math.random() * emotionalTriggers.length)];
    enhancedTitle += ` ${trigger}`;
  }
  
  return enhancedTitle;
}

export function validateAndFixCategory(topic: string, currentCategory: string): string {
  const topicLower = topic.toLowerCase();
  
  // Erweiterte Kategoriezuordnung
  const categoryMappings = {
    garten: [
      'pflanzen', 'garten', 'gemüse', 'blumen', 'baum', 'bäume', 'saat', 
      'säen', 'ernten', 'kompost', 'dünger', 'beet', 'hochbeet', 'balkon',
      'terrasse', 'gewächshaus', 'kräuter', 'obstbaum', 'rasen', 'unkraut',
      'schädling', 'gießen', 'mulch', 'permaculture', 'vertikal', 'indoor'
    ],
    küche: [
      'kochen', 'backen', 'rezept', 'küche', 'essen', 'zubereitung',
      'gericht', 'mahlzeit', 'zutaten', 'gewürz', 'sauce', 'suppe',
      'salat', 'brot', 'kuchen', 'dessert', 'getränk', 'smoothie',
      'konservieren', 'einmachen', 'fermentieren', 'meal prep', 'zero waste'
    ],
    nachhaltigkeit: [
      'nachhaltig', 'umwelt', 'bio', 'öko', 'recycling', 'upcycling',
      'zero waste', 'plastikfrei', 'klimaschutz', 'energie sparen',
      'ressourcen', 'ökologisch', 'grün', 'umweltfreundlich',
      'natürlich', 'biologisch', 'fair trade', 'regional', 'saisonal'
    ],
    haushalt: [
      'haushalt', 'putzen', 'reinigen', 'ordnung', 'aufräumen',
      'organisation', 'dekoration', 'diy', 'basteln', 'reparatur',
      'werkzeug', 'möbel', 'einrichten', 'wohnen', 'feng shui'
    ]
  };
  
  // Finde beste Kategorie basierend auf Topic
  let bestCategory = currentCategory;
  let maxMatches = 0;
  
  for (const [category, keywords] of Object.entries(categoryMappings)) {
    const matches = keywords.filter(keyword => topicLower.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category;
    }
  }
  
  return bestCategory || 'garten'; // Fallback
}

export function generateComprehensiveSEO(title: string, content: string, category: string, season: string): SEOEnhancedData {
  const keywordSets = {
    garten: [
      'garten tipps', 'pflanzen pflege', 'gartenpflege', 'hobbygärtner',
      'gartenarbeit', 'garten ratgeber', 'pflanzen guide', 'garten anleitung',
      'gartentricks', 'pflanzenpflege tipps', 'garten saison', 'gartenpraxis'
    ],
    küche: [
      'kochentipps', 'küchentricks', 'rezept ideen', 'kochen lernen',
      'küchen ratgeber', 'kochtechniken', 'zubereitung tipps', 'küchen guide',
      'kochen einfach', 'hausmannskost', 'küchen hacks', 'kochen praktisch'
    ],
    nachhaltigkeit: [
      'nachhaltig leben', 'umwelt tipps', 'öko lifestyle', 'grün leben',
      'nachhaltige tipps', 'umweltschutz', 'bio tipps', 'zero waste tipps',
      'ökologisch leben', 'nachhaltige küche', 'umweltbewusst', 'grüner alltag'
    ]
  };

  const baseKeywords = keywordSets[category] || keywordSets.garten;
  
  // Extrahiere Keywords aus Content
  const contentWords = content.toLowerCase()
    .replace(/[^\wäöüß\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4)
    .filter((word, index, arr) => arr.indexOf(word) === index)
    .slice(0, 20);

  const seasonalKeywords = season ? [
    `${season.toLowerCase()} garten`,
    `${season.toLowerCase()} tipps`,
    `saisonale arbeit`,
    `${season.toLowerCase()}zeit`
  ] : [];

  const allKeywords = [
    ...baseKeywords.slice(0, 8),
    ...contentWords.slice(0, 12),
    ...seasonalKeywords,
    'marianne tipps',
    'praktische anleitung',
    'schritt für schritt'
  ];

  // SEO Description
  const seoDescription = `${title} ✓ Praktische Tipps von Marianne ✓ Schritt-für-Schritt Anleitung ✓ Bewährte Methoden für ${category} ✓ Jetzt lesen und erfolgreich umsetzen!`;

  // Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": seoDescription,
    "author": {
      "@type": "Person",
      "name": "Marianne",
      "description": "Erfahrene Garten- und Küchenexpertin mit 15 Jahren Praxis"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Mien Tuun",
      "logo": "https://mien-tuun.de/logo.png"
    },
    "articleSection": category,
    "keywords": allKeywords.join(", "),
    "inLanguage": "de-DE",
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString()
  };

  // Tags generieren
  const categoryTags = {
    garten: ['Gartentipps', 'Pflanzen', 'Hobbygarten', 'Grün'],
    küche: ['Kochtipps', 'Rezepte', 'Küchentricks', 'Hausmannskost'],
    nachhaltigkeit: ['Nachhaltigkeit', 'Umwelt', 'Bio', 'Öko'],
    haushalt: ['Haushalt', 'DIY', 'Organisation', 'Ordnung']
  };

  const tags = [
    ...(categoryTags[category] || categoryTags.garten).slice(0, 3),
    season || 'Ganzjährig',
    'Marianne',
    'Anleitung'
  ];

  return {
    title,
    seoTitle: `${title} | Mariannes ${category.charAt(0).toUpperCase() + category.slice(1)}-Tipps`,
    seoDescription: seoDescription.substring(0, 156),
    seoKeywords: allKeywords,
    category,
    tags,
    structuredData
  };
}
