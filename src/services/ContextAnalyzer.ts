
interface TrendData {
  keyword: string;
  relevance: number;
  season: string;
  category: string;
}

interface ContentGap {
  topic: string;
  urgency: number;
  category: string;
  reason: string;
}

interface UserPreference {
  userId?: string;
  preferredCategories: string[];
  engagement: Record<string, number>;
  readingTime: number;
}

class ContextAnalyzer {
  private seasonalTrends: Record<string, string[]> = {
    "fruehling": ["Aussaat", "Frühlingsputz", "Osterbrunch", "Spargel", "Rhabarber", "Gartenvorbereitung"],
    "sommer": ["Grillen", "Beeren", "Ernte", "Konservieren", "Urlaubsküche", "Sommersalate"],
    "herbst": ["Kürbis", "Pilze", "Erntedank", "Wintervorräte", "Marmelade", "Einkochen"],
    "winter": ["Weihnachten", "Glühwein", "Wintergemüse", "Comfort Food", "Indoor Gardening", "Kohl"]
  };

  private categoryTrends: Record<string, string[]> = {
    "kochen": ["Low Carb", "One Pot", "Meal Prep", "Vegan", "Regional", "Schnell"],
    "garten": ["Nachhaltigkeit", "Permacultur", "Urban Gardening", "Bio", "Selbstversorgung"],
    "haushalt": ["Zero Waste", "DIY", "Minimalismus", "Nachhaltigkeit", "Organisation"]
  };

  getCurrentTrends(category?: string, season?: string): TrendData[] {
    const trends: TrendData[] = [];
    
    // Saisonale Trends
    if (season && this.seasonalTrends[season]) {
      this.seasonalTrends[season].forEach(keyword => {
        trends.push({
          keyword,
          relevance: this.calculateSeasonalRelevance(season),
          season,
          category: category || "allgemein"
        });
      });
    }
    
    // Kategorie-Trends
    if (category && this.categoryTrends[category]) {
      this.categoryTrends[category].forEach(keyword => {
        trends.push({
          keyword,
          relevance: 0.8,
          season: season || "ganzjährig",
          category
        });
      });
    }
    
    // Zeitbasierte Trends (Wochentag, Tageszeit)
    const dayTrends = this.getDayBasedTrends();
    trends.push(...dayTrends);
    
    return trends.sort((a, b) => b.relevance - a.relevance);
  }

  analyzeContentGaps(): ContentGap[] {
    const gaps: ContentGap[] = [];
    
    // Saisonale Lücken
    const currentSeason = this.getCurrentSeason();
    const missingSeasonalContent = this.findMissingSeasonalContent(currentSeason);
    
    missingSeasonalContent.forEach(topic => {
      gaps.push({
        topic,
        urgency: this.calculateSeasonalUrgency(currentSeason),
        category: "saisonal",
        reason: `Fehlende ${currentSeason}-Inhalte`
      });
    });
    
    // Kategorie-Lücken basierend auf User-Engagement
    const categoryGaps = this.analyzeCategoryGaps();
    gaps.push(...categoryGaps);
    
    return gaps.sort((a, b) => b.urgency - a.urgency);
  }

  optimizePrompt(basePrompt: string, context: {
    category?: string;
    season?: string;
    audience?: string[];
    trends?: TrendData[];
  }): string {
    let optimizedPrompt = basePrompt;
    
    // Trend-Keywords einbauen
    if (context.trends && context.trends.length > 0) {
      const topTrends = context.trends.slice(0, 3).map(t => t.keyword);
      optimizedPrompt += ` Berücksichtige aktuelle Trends: ${topTrends.join(", ")}.`;
    }
    
    // Saisonale Optimierung
    if (context.season) {
      const seasonalContext = this.getSeasonalContext(context.season);
      optimizedPrompt += ` ${seasonalContext}`;
    }
    
    // Zielgruppen-Anpassung
    if (context.audience && context.audience.length > 0) {
      const audienceContext = this.getAudienceContext(context.audience);
      optimizedPrompt += ` ${audienceContext}`;
    }
    
    // SEO und Engagement Optimierung
    optimizedPrompt += " Schreibe SEO-optimiert mit ansprechenden Überschriften und praktischen Tipps.";
    
    return optimizedPrompt;
  }

  private calculateSeasonalRelevance(season: string): number {
    const currentSeason = this.getCurrentSeason();
    if (season === currentSeason) return 1.0;
    
    // Vor-/Nachsaison hat auch Relevanz
    const seasonOrder = ["winter", "fruehling", "sommer", "herbst"];
    const currentIndex = seasonOrder.indexOf(currentSeason);
    const seasonIndex = seasonOrder.indexOf(season);
    
    const distance = Math.min(
      Math.abs(currentIndex - seasonIndex),
      4 - Math.abs(currentIndex - seasonIndex)
    );
    
    return Math.max(0.3, 1 - (distance * 0.3));
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "fruehling";
    if (month >= 6 && month <= 8) return "sommer";
    if (month >= 9 && month <= 11) return "herbst";
    return "winter";
  }

  private getDayBasedTrends(): TrendData[] {
    const day = new Date().getDay();
    const hour = new Date().getHours();
    
    const trends: TrendData[] = [];
    
    // Wochenende = mehr Zeit für aufwendige Rezepte
    if (day === 0 || day === 6) {
      trends.push({
        keyword: "Wochenendprojekt",
        relevance: 0.7,
        season: "ganzjährig",
        category: "kochen"
      });
    }
    
    // Montagmorgen = schnelle Lösungen
    if (day === 1 && hour < 12) {
      trends.push({
        keyword: "Schnell",
        relevance: 0.8,
        season: "ganzjährig",
        category: "kochen"
      });
    }
    
    return trends;
  }

  private findMissingSeasonalContent(season: string): string[] {
    // Simuliert Analyse bestehender Inhalte
    const seasonalTopics = this.seasonalTrends[season] || [];
    // In echter Implementierung würde hier die Datenbank abgefragt
    return seasonalTopics.slice(0, 3); // Top 3 fehlende Themen
  }

  private calculateSeasonalUrgency(season: string): number {
    const currentSeason = this.getCurrentSeason();
    return season === currentSeason ? 0.9 : 0.4;
  }

  private analyzeCategoryGaps(): ContentGap[] {
    // Simuliert User-Engagement Analyse
    return [
      {
        topic: "Vegetarische Hauptgerichte",
        urgency: 0.8,
        category: "kochen",
        reason: "Hohe User-Nachfrage, wenig Content"
      },
      {
        topic: "Balkongarten Anfänger",
        urgency: 0.7,
        category: "garten",
        reason: "Saisonale Relevanz, Content-Lücke"
      }
    ];
  }

  private getSeasonalContext(season: string): string {
    const contexts = {
      "fruehling": "Betone Frische, Neubeginn und Gartenvorbereitung.",
      "sommer": "Fokus auf frische Zutaten, Outdoor-Aktivitäten und leichte Küche.",
      "herbst": "Ernte, Haltbarmachung und gemütliche Atmosphäre hervorheben.",
      "winter": "Comfort Food, Indoor-Projekte und festliche Stimmung einbeziehen."
    };
    return contexts[season] || "";
  }

  private getAudienceContext(audiences: string[]): string {
    if (audiences.includes("Anfänger")) {
      return "Erkläre Basics und verwende einfache Sprache.";
    }
    if (audiences.includes("Experten")) {
      return "Verwende Fachbegriffe und fortgeschrittene Techniken.";
    }
    if (audiences.includes("Familien")) {
      return "Betone familienfreundliche Aspekte und einfache Umsetzung.";
    }
    return "";
  }
}

export const contextAnalyzer = new ContextAnalyzer();
export type { TrendData, ContentGap, UserPreference };
