
import { contextAnalyzer, TrendData, ContentGap } from "./ContextAnalyzer";
import { contentGenerationService } from "./ContentGenerationService";
import { blogAnalyticsService, TrendKeyword } from "./BlogAnalyticsService";

interface ContentStrategy {
  priority: number;
  category: string;
  season: string;
  suggestedTopics: string[];
  reasoning: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface ContentCalendarEntry {
  date: Date;
  title: string;
  category: string;
  priority: number;
  tags: string[];
  estimatedEngagement: number;
}

interface PersonalizationProfile {
  userId?: string;
  preferredCategories: string[];
  readingTime: number;
  engagementHistory: Record<string, number>;
  skillLevel: 'anfaenger' | 'fortgeschritten' | 'experte';
}

class ContentStrategyService {
  private strategicKeywords = {
    "garten-planung": ["Hochbeet", "Kompost", "Mischkultur", "Permakultur", "Aussaat", "Planung"],
    "pflanzenpflege": ["Gießen", "Düngen", "Schnitt", "Schädlinge", "Bodenpflege", "Kompost"],
    "ernte-kueche": ["Fermentieren", "Einkochen", "Kräuter", "Saisonal", "Zero Waste", "Lagerung"],
    "selbermachen-ausruestung": ["Upcycling", "Selbermachen", "Bauen", "Reparieren", "Werkzeug"],
    "nachhaltigkeit-umwelt": ["Plastikfrei", "Klimafreundlich", "Regenerativ", "Naturgarten", "Kreislauf"],
    "spezielle-gartenbereiche": ["Urban", "Balkon", "Indoor", "Hydroponik", "Gewächshaus"],
    "philosophie-lifestyle": ["Selbstversorgung", "Achtsamkeit", "Work-Life-Balance", "Minimalismus", "Wellness"]
  };

  async generateContentStrategy(context: {
    timeframe: number; // Wochen
    categories?: string[];
    targetAudience?: string[];
  }): Promise<ContentStrategy[]> {
    console.log("[ContentStrategy] Generating strategy for", context);

    try {
      const trends = contextAnalyzer.getCurrentTrends();
      const gaps = contextAnalyzer.analyzeContentGaps();

      let posts = [];
      let externalTrends = [];
      let keywordGaps = [];

      try {
        [posts, externalTrends] = await Promise.all([
          blogAnalyticsService.fetchBlogPosts(),
          blogAnalyticsService.fetchCurrentTrends()
        ]);
        const existingKeywords = blogAnalyticsService.extractKeywords(posts);
        keywordGaps = blogAnalyticsService.findKeywordGaps(externalTrends, existingKeywords);
      } catch (error) {
        console.warn("[ContentStrategy] Error fetching analytics data:", error);
        // Continue with local data only
      }

      const strategies: ContentStrategy[] = [];
      
      // Kategorie-spezifische Strategien
      const categoryStrategies = this.generateCategorySpecificStrategies();
      strategies.push(...categoryStrategies);
      
      // Saisonale Strategien
      const seasonalStrategy = this.generateSeasonalStrategy(trends, gaps);
      strategies.push(...seasonalStrategy);
      
      // Trend-basierte Strategien
      const trendStrategy = this.generateTrendBasedStrategy(trends);
      strategies.push(...trendStrategy);

      // Gap-Analysis Strategien
      const gapStrategy = this.generateGapFillingStrategy(gaps);
      strategies.push(...gapStrategy);

      // Keyword-Gap Strategien basierend auf externen Trends
      if (keywordGaps.length > 0) {
        const kwGapStrategy = this.generateKeywordGapStrategy(keywordGaps);
        strategies.push(...kwGapStrategy);
      }

      return strategies.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      console.error("[ContentStrategy] Error generating strategy:", error);
      // Return some fallback strategies
      return this.getFallbackStrategies();
    }
  }

  private generateCategorySpecificStrategies(): ContentStrategy[] {
    const strategies: ContentStrategy[] = [];
    const currentSeason = this.getCurrentSeason();
    
    // Prioritäten für verschiedene Kategorien
    const categoryPriorities = {
      "garten-planung": 95,
      "pflanzenpflege": 90,
      "ernte-kueche": 90,
      "nachhaltigkeit-umwelt": 85,
      "spezielle-gartenbereiche": 80,
      "selbermachen-ausruestung": 75,
      "philosophie-lifestyle": 65
    };

    Object.entries(this.strategicKeywords).forEach(([category, keywords]) => {
      const priority = categoryPriorities[category as keyof typeof categoryPriorities] || 60;
      
      strategies.push({
        priority,
        category,
        season: currentSeason,
        suggestedTopics: [
          `${keywords[0]} für Anfänger - Marianne's Tipps`,
          `${keywords[1]} Schritt-für-Schritt Anleitung`,
          `Häufige Fehler bei ${keywords[2]} vermeiden`,
          `${keywords[0]} und ${keywords[1]} perfekt kombinieren`,
          `${currentSeason} ist perfekt für ${keywords[0]}`
        ],
        reasoning: `${category} ist eine Kernkategorie mit hoher Leser-Nachfrage. Marianne's persönlicher Stil passt perfekt zu praktischen ${category}-Themen.`,
        urgency: priority > 85 ? 'high' : priority > 75 ? 'medium' : 'low'
      });
    });

    return strategies;
  }

  private getFallbackStrategies(): ContentStrategy[] {
    const currentSeason = this.getCurrentSeason();
    return [
      {
        priority: 90,
        category: "garten-planung",
        season: currentSeason,
        suggestedTopics: [
          "Hochbeet optimal nutzen - Marianne's bewährte Methoden",
          "Gartenprojekte für Anfänger mit Erfolgsgarantie",
          "Nachhaltige Gartenplanung leicht gemacht"
        ],
        reasoning: "Gärtnern ist unsere Kernkategorie mit der höchsten Leser-Engagement",
        urgency: 'medium'
      },
      {
        priority: 85,
        category: "ernte-kueche",
        season: currentSeason,
        suggestedTopics: [
          "Saisonale Rezepte direkt aus dem Garten",
          "Erntefrische Gerichte - einfach und lecker",
          "Konservieren leicht gemacht - Marianne's Geheimnisse"
        ],
        reasoning: "Gartenküche verbindet Garten und Küche perfekt - sehr beliebt bei unseren Lesern",
        urgency: 'medium'
      }
    ];
  }

  private generateSeasonalStrategy(trends: TrendData[], gaps: ContentGap[]): ContentStrategy[] {
    const currentSeason = this.getCurrentSeason();
    const strategies: ContentStrategy[] = [];
    
    const seasonalTrends = trends.filter(t => t.season === currentSeason);
    
    for (const trend of seasonalTrends.slice(0, 3)) {
      strategies.push({
        priority: trend.relevance * 100,
        category: trend.category,
        season: currentSeason,
        suggestedTopics: [
          `${trend.keyword} für ${currentSeason} - Marianne's Erfahrungen`,
          `${trend.keyword} Tipps direkt aus der Praxis`,
          `Anfänger-Guide: ${trend.keyword} erfolgreich meistern`,
          `${trend.keyword} Fehler, die ich nie wieder mache`
        ],
        reasoning: `Hohe saisonale Relevanz für ${trend.keyword} in ${currentSeason}. Marianne's persönliche Geschichten machen das Thema authentisch und nahbar.`,
        urgency: trend.relevance > 0.8 ? 'high' : 'medium'
      });
    }
    
    return strategies;
  }

  private generateTrendBasedStrategy(trends: TrendData[]): ContentStrategy[] {
    const strategies: ContentStrategy[] = [];
    
    // Top Trends kategorieübergreifend
    const topTrends = trends.slice(0, 5);
    
    for (const trend of topTrends) {
      const keywords = this.strategicKeywords[trend.category as keyof typeof this.strategicKeywords] || [];
      
      strategies.push({
        priority: trend.relevance * 80,
        category: trend.category,
        season: trend.season,
        suggestedTopics: [
          `${trend.keyword} kombiniert mit ${keywords[0] || 'Nachhaltigkeit'}`,
          `Moderne ${trend.keyword} Ansätze`,
          `${trend.keyword} Fehler vermeiden`,
          `${trend.keyword} vs. traditionelle Methoden`
        ],
        reasoning: `Trending Topic mit ${Math.round(trend.relevance * 100)}% Relevanz`,
        urgency: trend.relevance > 0.9 ? 'critical' : 'medium'
      });
    }
    
    return strategies;
  }

  private generateGapFillingStrategy(gaps: ContentGap[]): ContentStrategy[] {
    return gaps.map(gap => ({
      priority: gap.urgency * 60,
      category: gap.category,
      season: 'ganzjährig',
      suggestedTopics: [
        `${gap.topic} Grundlagen`,
        `${gap.topic} häufige Fragen`,
        `${gap.topic} Schritt für Schritt`,
        `${gap.topic} Troubleshooting`
      ],
      reasoning: gap.reason,
      urgency: gap.urgency > 0.8 ? 'high' : 'low'
    }));
  }

  private generateKeywordGapStrategy(gaps: TrendKeyword[]): ContentStrategy[] {
    return gaps.map(gap => ({
      priority: gap.relevance * 120,
      category: gap.category,
      season: 'aktuell',
      suggestedTopics: [
        `${gap.keyword} Trends 2024`,
        `${gap.keyword} Ideen`,
        `${gap.keyword} richtig nutzen`
      ],
      reasoning: `Trend '${gap.keyword}' ist kaum abgedeckt`,
      urgency: 'high'
    }));
  }

  async generateContentCalendar(strategies: ContentStrategy[], weeks: number = 4): Promise<ContentCalendarEntry[]> {
    console.log("[ContentStrategy] Generating calendar for", weeks, "weeks");
    
    const calendar: ContentCalendarEntry[] = [];
    const startDate = new Date();
    
    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < 7; day += 2) { // Jeden 2. Tag
        const date = new Date(startDate);
        date.setDate(date.getDate() + (week * 7) + day);
        
        // Strategie basierend auf Wochentag auswählen
        const strategy = this.selectStrategyForDay(strategies, date.getDay());
        
        if (strategy) {
          const topic = strategy.suggestedTopics[Math.floor(Math.random() * strategy.suggestedTopics.length)];
          
          calendar.push({
            date,
            title: topic,
            category: strategy.category,
            priority: strategy.priority,
            tags: this.generateTagsForTopic(topic, strategy.category),
            estimatedEngagement: this.estimateEngagement(strategy, date.getDay())
          });
        }
      }
    }
    
    return calendar.sort((a, b) => b.priority - a.priority);
  }

  private selectStrategyForDay(strategies: ContentStrategy[], dayOfWeek: number): ContentStrategy | null {
    if (strategies.length === 0) return null;
    
    // Montag/Dienstag: Hohe Priorität
    if (dayOfWeek <= 2) {
      return strategies.find(s => s.urgency === 'critical' || s.urgency === 'high') || strategies[0];
    }
    
    // Mittwoch/Donnerstag: Medium Priorität
    if (dayOfWeek <= 4) {
      return strategies.find(s => s.urgency === 'medium') || strategies[1] || strategies[0];
    }
    
    // Wochenende: Entspannte Themen
    return strategies.find(s => s.urgency === 'low') || strategies[strategies.length - 1];
  }

  private generateTagsForTopic(topic: string, category: string): string[] {
    const baseTags = this.strategicKeywords[category as keyof typeof this.strategicKeywords] || [];
    const topicTags = [];
    
    // Intelligente Tag-Extraktion
    if (topic.toLowerCase().includes('anfänger')) topicTags.push('Anfänger');
    if (topic.toLowerCase().includes('schritt')) topicTags.push('Step-by-Step');
    if (topic.toLowerCase().includes('tipps')) topicTags.push('Tipps');
    if (topic.toLowerCase().includes('fehler')) topicTags.push('Troubleshooting');
    
    return [...baseTags.slice(0, 2), ...topicTags].slice(0, 5);
  }

  private estimateEngagement(strategy: ContentStrategy, dayOfWeek: number): number {
    let baseScore = strategy.priority;
    
    // Wochentag-Boost
    if (dayOfWeek === 1 || dayOfWeek === 2) baseScore *= 1.2; // Montag/Dienstag
    if (dayOfWeek === 0 || dayOfWeek === 6) baseScore *= 0.8; // Wochenende
    
    // Urgency-Boost
    const urgencyMultiplier = {
      'critical': 1.5,
      'high': 1.2,
      'medium': 1.0,
      'low': 0.8
    };
    
    return Math.round(baseScore * urgencyMultiplier[strategy.urgency]);
  }

  async personalizeContent(basePrompt: string, profile: PersonalizationProfile): Promise<string> {
    let personalizedPrompt = basePrompt;
    
    // Skill Level Anpassung
    const skillInstructions = {
      'anfaenger': 'Erkläre alle Grundlagen und verwende einfache Sprache. Füge Definitionen für Fachbegriffe hinzu.',
      'fortgeschritten': 'Gehe auf Details ein und erkläre die Wissenschaft dahinter. Verwende Fachsprache.',
      'experte': 'Fokussiere auf fortgeschrittene Techniken und neue Entwicklungen. Kurze, präzise Erklärungen.'
    };
    
    personalizedPrompt += ` ${skillInstructions[profile.skillLevel]}`;
    
    // Präferierte Kategorien
    if (profile.preferredCategories.length > 0) {
      personalizedPrompt += ` Verbinde das Thema wenn möglich mit: ${profile.preferredCategories.join(', ')}.`;
    }
    
    // Lesezeit-Anpassung
    if (profile.readingTime < 3) {
      personalizedPrompt += ' Halte den Artikel kurz und prägnant (max. 500 Wörter).';
    } else if (profile.readingTime > 10) {
      personalizedPrompt += ' Schreibe einen ausführlichen, detaillierten Artikel (1000+ Wörter).';
    }
    
    return personalizedPrompt;
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "frühling";
    if (month >= 6 && month <= 8) return "sommer";
    if (month >= 9 && month <= 11) return "herbst";
    return "winter";
  }
}

export const contentStrategyService = new ContentStrategyService();
export type { ContentStrategy, ContentCalendarEntry, PersonalizationProfile };
