class TopicSuggestionService {
  private static topicSuggestions: Record<string, string[]> = {
    'gaertnern': [
      'Hochbeet anlegen für Anfänger',
      'Kompost richtig anlegen',
      'Mischkultur Tipps',
      'Garten im Herbst vorbereiten',
      'Natürliche Schädlingsbekämpfung'
    ],
    'gartenkueche': [
      'Kräuter konservieren',
      'Fermentieren für Anfänger',
      'Zero Waste in der Küche',
      'Saisonaler Ernährungsplan',
      'Essbare Blüten verwenden'
    ],
    'diy-basteln': [
      'Upcycling Gartenmöbel',
      'Pflanzgefäße selber machen',
      'Gewächshaus DIY',
      'Gartenwerkzeug reparieren',
      'Kompostbehälter bauen'
    ],
    'nachhaltigkeit': [
      'Plastikfrei gärtnern',
      'Regenwasser sammeln',
      'Permakultur Grundlagen',
      'Naturdünger herstellen',
      'Klimafreundlich gärtnern'
    ],
    'indoor-gardening': [
      'Microgreens anbauen',
      'Zimmerpflanzen für Anfänger',
      'Hydroponik Setup',
      'Kräuter auf der Fensterbank',
      'Indoor Kompostierung'
    ],
    'saisonales': [
      'Frühlingsarbeiten im Garten',
      'Winterschutz für Pflanzen',
      'Herbsternte einlagern',
      'Sommergemüse anbauen',
      'Ganzjähriger Anbauplan'
    ],
    'lifestyle': [
      'Selbstversorgung beginnen',
      'Garten als Therapie',
      'Achtsames Gärtnern',
      'Work-Life-Balance durch Garten',
      'Minimalismus im Garten'
    ]
  };

  static generateMissingTopics(categoryId: string, currentCount: number): string[] {
    const suggestions = this.topicSuggestions[categoryId] || [];
    const suggestionCount = Math.max(3, Math.min(5, 8 - Math.floor(currentCount / 2)));
    return suggestions.slice(0, suggestionCount);
  }
}

export { TopicSuggestionService };
