
import { generateSlug, generateMetaTitle, generateMetaDescription } from '@/utils/blogSeo';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedSEOAnalysis {
  overallScore: number;
  factors: {
    titleOptimization: { score: number; feedback: string };
    contentLength: { score: number; feedback: string };
    readability: { score: number; feedback: string };
    keywordUsage: { score: number; feedback: string };
    metaDescription: { score: number; feedback: string };
    headingStructure: { score: number; feedback: string };
    internalLinks: { score: number; feedback: string };
    imageOptimization: { score: number; feedback: string };
    semanticKeywords: { score: number; feedback: string };
    contentFreshness: { score: number; feedback: string };
  };
  recommendations: string[];
  keywords: string[];
  relatedTopics: string[];
  competitorAnalysis?: {
    suggestedKeywords: string[];
    contentGaps: string[];
  };
}

export class EnhancedSEOService {
  private static instance: EnhancedSEOService;

  public static getInstance(): EnhancedSEOService {
    if (!EnhancedSEOService.instance) {
      EnhancedSEOService.instance = new EnhancedSEOService();
    }
    return EnhancedSEOService.instance;
  }

  async analyzeContentSEO(data: {
    title: string;
    content: string;
    excerpt?: string;
    category?: string;
    featuredImage?: string;
    keywords?: string[];
  }): Promise<EnhancedSEOAnalysis> {
    
    const factors = {
      titleOptimization: this.analyzeTitleOptimization(data.title),
      contentLength: this.analyzeContentLength(data.content),
      readability: this.analyzeReadability(data.content),
      keywordUsage: this.analyzeKeywordUsage(data.content, data.title, data.keywords),
      metaDescription: this.analyzeMetaDescription(data.excerpt),
      headingStructure: this.analyzeHeadingStructure(data.content),
      internalLinks: this.analyzeInternalLinks(data.content),
      imageOptimization: this.analyzeImageOptimization(data.featuredImage, data.content),
      semanticKeywords: this.analyzeSemanticKeywords(data.content, data.category),
      contentFreshness: this.analyzeContentFreshness(data.content)
    };

    const overallScore = this.calculateOverallScore(factors);
    const recommendations = this.generateRecommendations(factors);
    const keywords = this.extractKeywords(data.content, data.title);
    const relatedTopics = await this.suggestRelatedTopics(data.category, keywords);

    return {
      overallScore,
      factors,
      recommendations,
      keywords,
      relatedTopics
    };
  }

  private analyzeTitleOptimization(title: string) {
    let score = 0;
    let feedback = "";

    const length = title.length;
    const wordCount = title.split(' ').length;
    const hasNumbers = /\d/.test(title);
    const hasEmotionalWords = /\b(erstaunlich|unglaublich|geheim|ultimativ|perfekt|einfach|schnell)\b/i.test(title);

    if (length >= 30 && length <= 60) {
      score += 30;
      feedback += "Titel-Länge optimal. ";
    } else if (length < 30) {
      score += 15;
      feedback += "Titel könnte länger sein (30-60 Zeichen). ";
    } else {
      score += 20;
      feedback += "Titel ist zu lang (max. 60 Zeichen). ";
    }

    if (wordCount >= 6 && wordCount <= 12) {
      score += 20;
      feedback += "Wort-Anzahl ideal. ";
    } else {
      score += 10;
      feedback += "6-12 Wörter sind optimal. ";
    }

    if (hasNumbers) {
      score += 15;
      feedback += "Zahlen verbessern Klickrate. ";
    } else {
      feedback += "Zahlen im Titel erhöhen Aufmerksamkeit. ";
    }

    if (hasEmotionalWords) {
      score += 15;
      feedback += "Emotionale Wörter erkannt. ";
    } else {
      feedback += "Emotionale Wörter können Klickrate steigern. ";
    }

    return { score: Math.min(100, score), feedback };
  }

  private analyzeContentLength(content: string) {
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    let score = 0;
    let feedback = "";

    if (wordCount >= 1000 && wordCount <= 2500) {
      score = 100;
      feedback = `Optimale Länge: ${wordCount} Wörter.`;
    } else if (wordCount >= 600 && wordCount < 1000) {
      score = 80;
      feedback = `Gute Länge: ${wordCount} Wörter. Für besseres Ranking 1000+ Wörter empfohlen.`;
    } else if (wordCount >= 300 && wordCount < 600) {
      score = 60;
      feedback = `Ausreichend: ${wordCount} Wörter. Mindestens 600 Wörter für bessere SEO.`;
    } else if (wordCount < 300) {
      score = 30;
      feedback = `Zu kurz: ${wordCount} Wörter. Mindestens 300 Wörter erforderlich.`;
    } else {
      score = 70;
      feedback = `Sehr lang: ${wordCount} Wörter. Struktur und Lesbarkeit prüfen.`;
    }

    return { score, feedback };
  }

  private analyzeReadability(content: string) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(Boolean);
    const avgWordsPerSentence = words.length / (sentences.length || 1);
    
    // Silben-Schätzung für deutsche Texte
    const avgSyllablesPerWord = this.estimateGermanSyllables(words);
    
    // Flesch Reading Ease für Deutsch (angepasst)
    const fleschScore = 180 - avgWordsPerSentence - (58.5 * avgSyllablesPerWord);
    const normalizedScore = Math.max(0, Math.min(100, fleschScore));

    let feedback = "";
    if (normalizedScore >= 80) {
      feedback = "Sehr gut lesbar.";
    } else if (normalizedScore >= 60) {
      feedback = "Gut lesbar. Kürzere Sätze könnten helfen.";
    } else if (normalizedScore >= 40) {
      feedback = "Mittelmäßig lesbar. Sätze kürzen und einfachere Wörter verwenden.";
    } else {
      feedback = "Schwer lesbar. Deutlich kürzere Sätze und einfachere Sprache empfohlen.";
    }

    return { score: Math.round(normalizedScore), feedback };
  }

  private analyzeKeywordUsage(content: string, title: string, keywords?: string[]) {
    if (!keywords || keywords.length === 0) {
      return { score: 30, feedback: "Keine Keywords definiert." };
    }

    const primaryKeyword = keywords[0];
    const contentLower = content.toLowerCase();
    const titleLower = title.toLowerCase();
    
    const keywordInTitle = titleLower.includes(primaryKeyword.toLowerCase());
    const keywordDensity = this.calculateKeywordDensity(content, primaryKeyword);
    const keywordInFirstParagraph = contentLower.substring(0, 200).includes(primaryKeyword.toLowerCase());
    
    let score = 0;
    let feedback = "";

    if (keywordInTitle) {
      score += 25;
      feedback += "Hauptkeyword im Titel. ";
    } else {
      feedback += "Hauptkeyword sollte im Titel stehen. ";
    }

    if (keywordDensity >= 0.5 && keywordDensity <= 2.5) {
      score += 30;
      feedback += `Keyword-Dichte optimal (${keywordDensity}%). `;
    } else if (keywordDensity < 0.5) {
      score += 15;
      feedback += `Keyword-Dichte zu niedrig (${keywordDensity}%). `;
    } else {
      score += 10;
      feedback += `Keyword-Dichte zu hoch (${keywordDensity}%). `;
    }

    if (keywordInFirstParagraph) {
      score += 20;
      feedback += "Keyword im ersten Absatz. ";
    } else {
      feedback += "Keyword sollte im ersten Absatz stehen. ";
    }

    // LSI Keywords (verwandte Begriffe)
    const lsiKeywords = this.findLSIKeywords(primaryKeyword);
    const lsiCount = lsiKeywords.filter(lsi => 
      contentLower.includes(lsi.toLowerCase())
    ).length;
    
    if (lsiCount >= 3) {
      score += 25;
      feedback += "Gute Verwendung verwandter Begriffe. ";
    } else {
      feedback += "Mehr verwandte Begriffe verwenden. ";
    }

    return { score: Math.min(100, score), feedback };
  }

  private analyzeMetaDescription(excerpt?: string) {
    if (!excerpt) {
      return { score: 0, feedback: "Keine Meta-Description vorhanden." };
    }

    const length = excerpt.length;
    let score = 0;
    let feedback = "";

    if (length >= 120 && length <= 160) {
      score = 100;
      feedback = `Optimale Länge: ${length} Zeichen.`;
    } else if (length >= 100 && length < 120) {
      score = 80;
      feedback = `Etwas zu kurz: ${length} Zeichen. 120-160 ideal.`;
    } else if (length > 160) {
      score = 60;
      feedback = `Zu lang: ${length} Zeichen. Wird in Suchergebnissen abgeschnitten.`;
    } else {
      score = 40;
      feedback = `Zu kurz: ${length} Zeichen. Mindestens 120 Zeichen empfohlen.`;
    }

    return { score, feedback };
  }

  private analyzeHeadingStructure(content: string) {
    const h1Count = (content.match(/^# /gm) || []).length;
    const h2Count = (content.match(/^## /gm) || []).length;
    const h3Count = (content.match(/^### /gm) || []).length;
    const totalHeadings = h1Count + h2Count + h3Count;

    let score = 0;
    let feedback = "";

    if (h1Count === 1) {
      score += 25;
      feedback += "Eine H1-Überschrift vorhanden. ";
    } else if (h1Count === 0) {
      feedback += "H1-Überschrift fehlt. ";
    } else {
      score += 10;
      feedback += "Nur eine H1-Überschrift pro Seite empfohlen. ";
    }

    if (h2Count >= 2) {
      score += 30;
      feedback += "Gute H2-Struktur. ";
    } else if (h2Count === 1) {
      score += 20;
      feedback += "Mindestens 2 H2-Überschriften empfohlen. ";
    } else {
      feedback += "H2-Überschriften für bessere Struktur hinzufügen. ";
    }

    if (h3Count > 0) {
      score += 20;
      feedback += "H3-Überschriften verbessern Struktur. ";
    }

    const wordCount = content.split(/\s+/).length;
    const headingRatio = totalHeadings / (wordCount / 100);
    
    if (headingRatio >= 1 && headingRatio <= 3) {
      score += 25;
      feedback += "Gutes Verhältnis Überschriften zu Text. ";
    } else if (headingRatio < 1) {
      feedback += "Mehr Zwischenüberschriften empfohlen. ";
    }

    return { score: Math.min(100, score), feedback };
  }

  private analyzeInternalLinks(content: string) {
    const internalLinkPattern = /\[([^\]]+)\]\(\/[^)]+\)/g;
    const internalLinks = content.match(internalLinkPattern) || [];
    const wordCount = content.split(/\s+/).length;
    const linkRatio = internalLinks.length / (wordCount / 100);

    let score = 0;
    let feedback = "";

    if (internalLinks.length >= 2 && internalLinks.length <= 8) {
      score += 50;
      feedback += `${internalLinks.length} interne Links gefunden. `;
    } else if (internalLinks.length === 1) {
      score += 30;
      feedback += "Mehr interne Links für bessere SEO. ";
    } else if (internalLinks.length === 0) {
      feedback += "Interne Links fehlen komplett. ";
    } else {
      score += 20;
      feedback += "Sehr viele interne Links - könnte spammy wirken. ";
    }

    if (linkRatio >= 1 && linkRatio <= 3) {
      score += 50;
      feedback += "Gute Link-Dichte. ";
    }

    return { score: Math.min(100, score), feedback };
  }

  private analyzeImageOptimization(featuredImage?: string, content?: string) {
    let score = 0;
    let feedback = "";

    if (featuredImage) {
      score += 50;
      feedback += "Featured Image vorhanden. ";
    } else {
      feedback += "Featured Image fehlt. ";
    }

    if (content) {
      const imageCount = (content.match(/!\[([^\]]*)\]/g) || []).length;
      const wordCount = content.split(/\s+/).length;
      
      if (imageCount > 0) {
        score += 30;
        feedback += `${imageCount} Bilder im Content. `;
        
        if (wordCount > 500 && imageCount >= 2) {
          score += 20;
          feedback += "Gute Bild-zu-Text Ratio. ";
        }
      } else {
        feedback += "Bilder im Content verbessern Engagement. ";
      }
    }

    return { score: Math.min(100, score), feedback };
  }

  private analyzeSemanticKeywords(content: string, category?: string) {
    const semanticWords = this.getSemanticWords(category);
    const contentLower = content.toLowerCase();
    
    const foundSemanticWords = semanticWords.filter(word => 
      contentLower.includes(word.toLowerCase())
    );

    let score = 0;
    let feedback = "";

    const semanticCoverage = foundSemanticWords.length / semanticWords.length;
    
    if (semanticCoverage >= 0.6) {
      score = 100;
      feedback = "Exzellente semantische Abdeckung.";
    } else if (semanticCoverage >= 0.4) {
      score = 80;
      feedback = "Gute semantische Abdeckung.";
    } else if (semanticCoverage >= 0.2) {
      score = 60;
      feedback = "Moderate semantische Abdeckung.";
    } else {
      score = 30;
      feedback = "Schwache semantische Abdeckung.";
    }

    return { score, feedback };
  }

  private analyzeContentFreshness(content: string) {
    // Analyse auf aktuelle Trends, Daten, etc.
    const currentYear = new Date().getFullYear();
    const hasCurrentYear = content.includes(currentYear.toString());
    const hasRecentTerms = /\b(2024|2025|neu|aktuell|modern|heute|jetzt|derzeit)\b/i.test(content);
    const hasOutdatedTerms = /\b(2020|2021|2022|früher|damals|veraltet)\b/i.test(content);

    let score = 50; // Base score
    let feedback = "Inhalt wirkt zeitgemäß. ";

    if (hasCurrentYear) {
      score += 25;
      feedback += "Aktuelle Jahreszahl gefunden. ";
    }

    if (hasRecentTerms) {
      score += 25;
      feedback += "Moderne Begriffe verwendet. ";
    }

    if (hasOutdatedTerms) {
      score -= 20;
      feedback += "Veraltete Begriffe gefunden - aktualisieren. ";
    }

    return { score: Math.max(0, Math.min(100, score)), feedback };
  }

  // Helper methods
  private calculateOverallScore(factors: any): number {
    const weights = {
      titleOptimization: 0.15,
      contentLength: 0.12,
      readability: 0.12,
      keywordUsage: 0.15,
      metaDescription: 0.10,
      headingStructure: 0.12,
      internalLinks: 0.08,
      imageOptimization: 0.08,
      semanticKeywords: 0.04,
      contentFreshness: 0.04
    };

    let totalScore = 0;
    for (const [factor, weight] of Object.entries(weights)) {
      totalScore += factors[factor].score * weight;
    }

    return Math.round(totalScore);
  }

  private generateRecommendations(factors: any): string[] {
    const recommendations = [];
    
    for (const factor of Object.values(factors)) {
      if ((factor as any).score < 70 && (factor as any).feedback) {
        recommendations.push((factor as any).feedback);
      }
    }

    return recommendations.slice(0, 8); // Top 8 Empfehlungen
  }

  private extractKeywords(content: string, title: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const words = text.match(/\b[a-zäöüß]{4,}\b/g) || [];
    
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .filter(([word, count]) => count >= 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word);
  }

  private calculateKeywordDensity(content: string, keyword: string): number {
    const words = content.toLowerCase().split(/\s+/).filter(Boolean);
    const keywordCount = words.filter(word => word === keyword.toLowerCase()).length;
    return parseFloat(((keywordCount / words.length) * 100).toFixed(2));
  }

  private estimateGermanSyllables(words: string[]): number {
    // Vereinfachte Silben-Schätzung für deutsche Wörter
    return words.reduce((total, word) => {
      const vowelCount = (word.match(/[aeiouäöü]/gi) || []).length;
      return total + Math.max(1, vowelCount);
    }, 0) / words.length;
  }

  private findLSIKeywords(primaryKeyword: string): string[] {
    // LSI (Latent Semantic Indexing) Keywords basierend auf dem Hauptkeyword
    const lsiMap: Record<string, string[]> = {
      'garten': ['pflanzen', 'beet', 'kompost', 'dünger', 'säen', 'ernten', 'pflege'],
      'kochen': ['rezept', 'zutaten', 'küche', 'zubereitung', 'geschmack', 'würzen'],
      'nachhaltig': ['umwelt', 'bio', 'öko', 'klimaschutz', 'recycling', 'natürlich']
    };

    for (const [key, lsiWords] of Object.entries(lsiMap)) {
      if (primaryKeyword.toLowerCase().includes(key)) {
        return lsiWords;
      }
    }

    return ['tipps', 'anleitung', 'einfach', 'praktisch', 'effektiv'];
  }

  private getSemanticWords(category?: string): string[] {
    const categoryMap: Record<string, string[]> = {
      'garten': ['pflanzen', 'wachstum', 'boden', 'wasser', 'licht', 'jahreszeit', 'natur'],
      'kochen': ['geschmack', 'textur', 'temperatur', 'zeit', 'technik', 'gewürze', 'frisch'],
      'nachhaltigkeit': ['umwelt', 'ressourcen', 'zukunft', 'verantwortung', 'bewusst', 'sparen']
    };

    return categoryMap[category?.toLowerCase() || 'allgemein'] || 
           ['qualität', 'erfahrung', 'wissen', 'erfolg', 'methode'];
  }

  private async suggestRelatedTopics(category?: string, keywords?: string[]): Promise<string[]> {
    // Simulierte verwandte Themen basierend auf Kategorie und Keywords
    const suggestions = [
      'Seasonal Gardening Tips',
      'Sustainable Cooking Methods',
      'Organic Plant Care',
      'Kitchen Garden Setup',
      'Composting Basics'
    ];

    return suggestions.slice(0, 5);
  }
}

export default EnhancedSEOService;
