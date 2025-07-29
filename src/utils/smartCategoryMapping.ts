
// Smart Category Mapping basierend auf Tags
export const SMART_CATEGORIES = [
  {
    id: 'garten-planung',
    name: 'Garten & Planung',
    icon: '🌱',
    keywords: [
      'garten', 'planung', 'aussaat', 'beet', 'hochbeet', 'permakultur',
      'kompost', 'bodenpflege', 'mischkultur', 'gewächshaus', 'balkon'
    ]
  },
  {
    id: 'pflanzenpflege',
    name: 'Pflanzenpflege',
    icon: '🌿',
    keywords: [
      'gießen', 'düngen', 'schneiden', 'schädlinge', 'krankheiten',
      'pflegetipps', 'kompost', 'boden'
    ]
  },
  {
    id: 'ernte-kueche',
    name: 'Ernte & Küche',
    icon: '🍅',
    keywords: [
      'kochen', 'rezept', 'ernte', 'einkochen', 'konservieren',
      'haltbarmachen', 'lagerung', 'kräuter', 'saisonal', 'regional'
    ]
  },
  {
    id: 'selbermachen-ausruestung',
    name: 'Selbermachen & Ausrüstung',
    icon: '🔨',
    keywords: [
      'diy', 'basteln', 'selbermachen', 'bauen', 'werkzeug',
      'upcycling', 'projekt', 'reparieren', 'gartenmöbel'
    ]
  },
  {
    id: 'nachhaltigkeit-umwelt',
    name: 'Nachhaltigkeit & Umwelt',
    icon: '♻️',
    keywords: [
      'nachhaltig', 'umwelt', 'bio', 'plastikfrei', 'zero waste',
      'klimaschutz', 'ressourcen', 'regenerativ', 'kreislauf', 'wassersparen'
    ]
  },
  {
    id: 'spezielle-gartenbereiche',
    name: 'Spezielle Gartenbereiche',
    icon: '🏡',
    keywords: [
      'urban', 'balkon', 'indoor', 'hydroponik', 'gewächshaus',
      'container', 'microgreens'
    ]
  },
  {
    id: 'philosophie-lifestyle',
    name: 'Philosophie & Lifestyle',
    icon: '✨',
    keywords: [
      'lifestyle', 'gesundheit', 'wellness', 'entspannung', 'achtsamkeit',
      'philosophie', 'inspiration', 'selbstversorgung', 'minimalismus'
    ]
  },
  {
    id: 'allgemein',
    name: 'Allgemein',
    icon: '📚',
    keywords: [
      'tipps', 'tricks', 'grundlagen', 'ratgeber', 'praxis'
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
  
  let bestMatch = { category: 'philosophie-lifestyle', score: 0 };
  
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
