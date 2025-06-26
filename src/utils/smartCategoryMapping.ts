
// Smart Category Mapping basierend auf Tags
export const SMART_CATEGORIES = [
  {
    id: 'gaertnern',
    name: 'Gärtnern',
    icon: '🌱',
    keywords: [
      'garten', 'pflanzen', 'aussaat', 'ernte', 'pflege', 'beet', 'hochbeet',
      'kompost', 'düngen', 'gießen', 'schneiden', 'schädlinge', 'bodenpflege',
      'permakultur', 'mischkultur', 'mulchen', 'gewächshaus', 'balkon'
    ]
  },
  {
    id: 'gartenküche',
    name: 'Gartenküche',
    icon: '👩‍🍳',
    keywords: [
      'kochen', 'rezept', 'küche', 'ernte', 'einkochen', 'konservieren',
      'haltbarmachen', 'lagerung', 'kräuter', 'gewürze', 'saisonal',
      'frisch', 'gesund', 'regional', 'bio'
    ]
  },
  {
    id: 'diy-basteln',
    name: 'DIY & Basteln',
    icon: '🔨',
    keywords: [
      'diy', 'basteln', 'selbermachen', 'bauen', 'werkzeug', 'upcycling',
      'kreativ', 'handwerk', 'anleitung', 'projekt', 'reparieren',
      'gartenmöbel', 'dekoration', 'holz', 'recycling'
    ]
  },
  {
    id: 'nachhaltigkeit',
    name: 'Nachhaltigkeit',
    icon: '♻️',
    keywords: [
      'nachhaltig', 'umwelt', 'öko', 'bio', 'plastikfrei', 'zero waste',
      'klimaschutz', 'ressourcen', 'sparen', 'naturschutz', 'regenerativ',
      'kreislauf', 'energy', 'wassersparen', 'kompost'
    ]
  },
  {
    id: 'indoor-gardening',
    name: 'Indoor Gardening',
    icon: '🏠',
    keywords: [
      'indoor', 'zimmerpflanzen', 'innen', 'hydroponik', 'keimlinge',
      'sprossen', 'fensterbrett', 'grow light', 'topf', 'container',
      'microgreens', 'kräuter innen', 'wohnung'
    ]
  },
  {
    id: 'saisonales',
    name: 'Saisonales',
    icon: '🍂',
    keywords: [
      'saison', 'saisonal', 'frühling', 'sommer', 'herbst', 'winter',
      'jahreszeit', 'kalender', 'monat', 'zeit', 'wetter', 'klima',
      'erntezeit', 'aussaatzeit', 'pflanzzeit'
    ]
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    icon: '✨',
    keywords: [
      'lifestyle', 'leben', 'gesundheit', 'wellness', 'entspannung',
      'achtsamkeit', 'natur', 'philosophie', 'inspiration', 'tipps',
      'routine', 'balance', 'selbstversorgung', 'minimalismus'
    ]
  }
];

export const SEASONS = [
  { id: 'frühling', name: 'Frühling', icon: '🌸' },
  { id: 'sommer', name: 'Sommer', icon: '☀️' },
  { id: 'herbst', name: 'Herbst', icon: '🍂' },
  { id: 'winter', name: 'Winter', icon: '❄️' },
  { id: 'ganzjährig', name: 'Ganzjährig', icon: '🔄' }
];

export function assignSmartCategory(tags: string[], content: string = '', title: string = ''): string {
  const allText = `${title} ${content} ${tags.join(' ')}`.toLowerCase();
  
  let bestMatch = { category: 'lifestyle', score: 0 };
  
  SMART_CATEGORIES.forEach(category => {
    let score = 0;
    
    category.keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      
      // Exakte Tag-Matches bekommen höchste Punkte
      tags.forEach(tag => {
        if (tag.toLowerCase().includes(keywordLower) || keywordLower.includes(tag.toLowerCase())) {
          score += 10;
        }
      });
      
      // Title-Matches bekommen hohe Punkte
      if (title.toLowerCase().includes(keywordLower)) {
        score += 5;
      }
      
      // Content-Matches bekommen niedrigere Punkte
      const contentMatches = (allText.match(new RegExp(keywordLower, 'g')) || []).length;
      score += contentMatches * 2;
    });
    
    if (score > bestMatch.score) {
      bestMatch = { category: category.id, score };
    }
  });
  
  return bestMatch.category;
}

export function assignSmartSeason(tags: string[], content: string = '', publishedAt?: string): string {
  const allText = `${content} ${tags.join(' ')}`.toLowerCase();
  
  // Saisonale Keywords direkt aus Tags und Content
  const seasonKeywords = {
    'frühling': ['frühling', 'frühjahr', 'märz', 'april', 'mai', 'aussaat', 'keimen', 'sprossen'],
    'sommer': ['sommer', 'juni', 'juli', 'august', 'ernte', 'gießen', 'hitze', 'sonne'],
    'herbst': ['herbst', 'september', 'oktober', 'november', 'ernte', 'einlagern', 'blätter'],
    'winter': ['winter', 'dezember', 'januar', 'februar', 'ruhe', 'planung', 'indoor', 'kalt']
  };
  
  let bestSeason = { season: 'ganzjährig', score: 0 };
  
  Object.entries(seasonKeywords).forEach(([season, keywords]) => {
    let score = 0;
    
    keywords.forEach(keyword => {
      // Tag-Matches
      tags.forEach(tag => {
        if (tag.toLowerCase().includes(keyword) || keyword.includes(tag.toLowerCase())) {
          score += 5;
        }
      });
      
      // Content-Matches
      const matches = (allText.match(new RegExp(keyword, 'g')) || []).length;
      score += matches;
    });
    
    if (score > bestSeason.score) {
      bestSeason = { season, score };
    }
  });
  
  // Fallback auf Datum basierte Zuordnung
  if (bestSeason.score === 0 && publishedAt) {
    const month = new Date(publishedAt).getMonth() + 1;
    if (month >= 3 && month <= 5) bestSeason.season = 'frühling';
    else if (month >= 6 && month <= 8) bestSeason.season = 'sommer';
    else if (month >= 9 && month <= 11) bestSeason.season = 'herbst';
    else bestSeason.season = 'winter';
  }
  
  return bestSeason.season;
}
