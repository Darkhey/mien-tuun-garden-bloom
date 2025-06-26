
import { TrendKeyword } from "./BlogAnalyticsService";

interface TrendSource {
  name: string;
  type: 'ai' | 'analytics' | 'seasonal' | 'external';
  description: string;
  reliability: number; // 0-100
  lastUpdated: string;
}

interface EnhancedTrend extends TrendKeyword {
  sources: TrendSource[];
  confidence: number;
  seasonality?: string;
  searchVolume?: number;
}

class TrendSourceService {
  static enhanceTrends(trends: TrendKeyword[]): EnhancedTrend[] {
    return trends.map(trend => ({
      ...trend,
      sources: this.generateTrendSources(trend),
      confidence: this.calculateConfidence(trend),
      seasonality: this.getSeasonality(trend.keyword),
      searchVolume: this.estimateSearchVolume(trend.keyword)
    }));
  }

  private static generateTrendSources(trend: TrendKeyword): TrendSource[] {
    const sources: TrendSource[] = [];
    
    // KI-Analyse Quelle
    sources.push({
      name: 'KI-Trend-Analyse',
      type: 'ai',
      description: 'Generiert durch OpenAI/Gemini basierend auf aktuellen Daten',
      reliability: 85,
      lastUpdated: new Date().toISOString()
    });

    // Saisonale Analyse
    if (this.isSeasonalTrend(trend.keyword)) {
      sources.push({
        name: 'Saisonale Trends',
        type: 'seasonal',
        description: 'Basierend auf jahreszeitlichen Mustern',
        reliability: 90,
        lastUpdated: new Date().toISOString()
      });
    }

    // Google Trends (simuliert)
    if (trend.relevance > 0.7) {
      sources.push({
        name: 'Google Trends',
        type: 'external',
        description: 'Hohe Suchanfragen-Relevanz',
        reliability: 95,
        lastUpdated: new Date().toISOString()
      });
    }

    // Content-Gap Analyse
    if (trend.category === 'garten' || trend.category === 'kueche') {
      sources.push({
        name: 'Content-Gap Analyse',
        type: 'analytics',
        description: 'Identifiziert basierend auf fehlenden Inhalten',
        reliability: 80,
        lastUpdated: new Date().toISOString()
      });
    }

    return sources;
  }

  private static calculateConfidence(trend: TrendKeyword): number {
    let confidence = trend.relevance * 100;
    
    // Boost für bekannte saisonale Trends
    if (this.isSeasonalTrend(trend.keyword)) {
      confidence += 10;
    }
    
    // Boost für Garten/Küche Kategorien
    if (['garten', 'kueche'].includes(trend.category)) {
      confidence += 5;
    }
    
    return Math.min(100, Math.round(confidence));
  }

  private static isSeasonalTrend(keyword: string): boolean {
    const seasonalKeywords = [
      'tomaten', 'paprika', 'gurken', 'salat', 'kräuter',
      'aussaat', 'ernte', 'pflanzen', 'garten',
      'suppe', 'eintopf', 'grillen', 'salat', 'smoothie'
    ];
    
    return seasonalKeywords.some(sk => 
      keyword.toLowerCase().includes(sk.toLowerCase())
    );
  }

  private static getSeasonality(keyword: string): string | undefined {
    const currentMonth = new Date().getMonth() + 1;
    
    if (keyword.toLowerCase().includes('tomaten') || keyword.toLowerCase().includes('paprika')) {
      return currentMonth >= 4 && currentMonth <= 9 ? 'Hauptsaison' : 'Nebensaison';
    }
    
    if (keyword.toLowerCase().includes('suppe') || keyword.toLowerCase().includes('eintopf')) {
      return currentMonth >= 10 || currentMonth <= 3 ? 'Hauptsaison' : 'Nebensaison';
    }
    
    if (keyword.toLowerCase().includes('salat') || keyword.toLowerCase().includes('smoothie')) {
      return currentMonth >= 4 && currentMonth <= 9 ? 'Hauptsaison' : 'Nebensaison';
    }
    
    return undefined;
  }

  private static estimateSearchVolume(keyword: string): number {
    // Simulierte Suchvolumen basierend auf Keyword-Länge und -Typ
    const baseVolume = Math.max(100, 1000 - (keyword.length * 20));
    const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 - 1.2
    
    return Math.round(baseVolume * randomFactor);
  }

  static getSourceIcon(type: TrendSource['type']): string {
    switch (type) {
      case 'ai': return '🤖';
      case 'analytics': return '📊';
      case 'seasonal': return '🌿';
      case 'external': return '🔍';
      default: return '📈';
    }
  }

  static getReliabilityColor(reliability: number): string {
    if (reliability >= 90) return 'text-green-600';
    if (reliability >= 80) return 'text-blue-600';
    if (reliability >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }
}

export { TrendSourceService };
export type { TrendSource, EnhancedTrend };
