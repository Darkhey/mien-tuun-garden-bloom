
import { generateSlug, generateMetaTitle, generateMetaDescription } from '@/utils/blogSeo';

export interface SEOAnalysis {
  keywords: string[];
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchVolume: number;
  difficulty: number;
  relatedTerms: string[];
}

export interface SEOOptimizationResult {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  structuredData: any;
  internalLinks: Array<{ text: string; url: string }>;
  seoScore: number;
  recommendations: string[];
}

export interface AssessmentResult {
  score: number;
  details: string[];
  warnings: string[];
  errors: string[];
}

export class SEOOptimizationService {
  async analyzeTopicAndKeywords(topic: string): Promise<SEOAnalysis> {
    console.log('[SEO] Analyzing topic and keywords for:', topic);
    
    // Simulierte Keyword-Analyse - in der Realität würde hier eine externe API verwendet
    const keywords = this.extractKeywordsFromTopic(topic);
    
    return {
      keywords,
      primaryKeyword: keywords[0] || topic.split(' ')[0],
      secondaryKeywords: keywords.slice(1, 4),
      searchVolume: Math.floor(Math.random() * 1000) + 100,
      difficulty: Math.floor(Math.random() * 100),
      relatedTerms: this.generateRelatedTerms(topic)
    };
  }

  async optimizeContent(content: any, qualityData: any): Promise<SEOOptimizationResult> {
    console.log('[SEO] Optimizing content for SEO');
    
    const slug = this.generateUniqueSlug(content.title);
    const metaTitle = generateMetaTitle(content.title);
    const metaDescription = generateMetaDescription(content.content, '', 156);
    const keywords = this.extractKeywordsFromContent(content.content);
    
    const seoScore = this.calculateSEOScore(content, keywords);
    const recommendations = this.generateSEORecommendations(content, seoScore);
    
    return {
      slug,
      metaTitle,
      metaDescription,
      keywords,
      structuredData: this.generateStructuredData(content),
      internalLinks: await this.suggestInternalLinks(content),
      seoScore,
      recommendations
    };
  }

  private extractKeywordsFromTopic(topic: string): string[] {
    // Einfache Keyword-Extraktion
    const words = topic.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Kombiniere auch zusammengesetzte Begriffe
    const compounds = [];
    for (let i = 0; i < words.length - 1; i++) {
      compounds.push(`${words[i]} ${words[i + 1]}`);
    }
    
    return [...words, ...compounds].slice(0, 10);
  }

  private generateRelatedTerms(topic: string): string[] {
    // Simulierte verwandte Begriffe
    const commonRelated = {
      'garten': ['pflanzen', 'beet', 'kompost', 'säen', 'ernten'],
      'kochen': ['rezept', 'zutaten', 'küche', 'zubereitung', 'geschmack'],
      'nachhaltigkeit': ['umwelt', 'öko', 'bio', 'recycling', 'klimaschutz']
    };
    
    const topicLower = topic.toLowerCase();
    for (const [key, terms] of Object.entries(commonRelated)) {
      if (topicLower.includes(key)) {
        return terms;
      }
    }
    
    return ['tipps', 'anleitung', 'einfach', 'schritt für schritt'];
  }

  private generateUniqueSlug(title: string): string {
    const baseSlug = generateSlug(title);
    // In der Realität würde hier die Datenbank auf Duplikate geprüft
    const timestamp = Date.now().toString().slice(-4);
    return `${baseSlug}-${timestamp}`;
  }

  private extractKeywordsFromContent(content: string): string[] {
    // Einfache Keyword-Extraktion aus dem Content
    const words = content.toLowerCase()
      .replace(/<[^>]*>/g, '') // HTML entfernen
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4);
    
    // Häufigkeitsanalyse
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Top 10 häufigste Wörter zurückgeben
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private calculateSEOScore(content: any, keywords: string[]): number {
    let score = 0;
    
    // Titel-Optimierung (20 Punkte)
    if (content.title && content.title.length >= 30 && content.title.length <= 60) {
      score += 20;
    } else {
      score += 10;
    }
    
    // Content-Länge (20 Punkte)
    const contentText = String(content.content || '');
    const wordCount = contentText.split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 2000) {
      score += 20;
    } else if (wordCount >= 200) {
      score += 15;
    } else {
      score += 5;
    }
    
    // Keyword-Dichte (20 Punkte)
    const keywordDensity = this.calculateKeywordDensity(contentText, keywords[0] || '');
    if (keywordDensity >= 0.5 && keywordDensity <= 3) {
      score += 20;
    } else {
      score += 10;
    }
    
    // Struktur (20 Punkte)
    const headers = (contentText.match(/^#{1,6}\s/gm) || []).length;
    if (headers >= 3) {
      score += 20;
    } else if (headers >= 1) {
      score += 15;
    } else {
      score += 5;
    }
    
    // Lesbarkeit (20 Punkte)
    const readabilityScore = this.calculateReadabilityScore(contentText);
    score += Math.min(20, Math.floor(readabilityScore / 5));
    
    return Math.min(100, score);
  }

  private calculateKeywordDensity(content: string, keyword: string): number {
    if (!keyword || !content) return 0;
    
    // Entferne HTML und Sonderzeichen, splitte exakt nach Wortgrenzen
    const plainText = String(content)
      .replace(/<[^>]*>/g, '')
      .replace(/[^\wäöüßÄÖÜ\s-]/gi, ' ');
    const words = plainText.toLowerCase().split(/\s+/).filter(Boolean);

    // Exakter Wort-Match statt "includes"
    const keywordNormalized = String(keyword).toLowerCase().trim();
    const keywordCount = words.filter(word => word === keywordNormalized).length;
    const totalWords = words.length;

    if (totalWords === 0) return 0;

    // Density: Anteil am Gesamttext
    const density = (keywordCount / totalWords) * 100;
    return parseFloat(density.toFixed(2));
  }

  private calculateReadabilityScore(content: string): number {
    const contentText = String(content || '');
    const sentences = contentText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = contentText.split(/\s+/).filter(Boolean);
    
    const sentenceCount = sentences.length || 1;
    const wordCount = words.length || 1;
    const avgWordsPerSentence = wordCount / sentenceCount;
    
    // Flesch Reading Ease approximation
    const score = 206.835 - (1.015 * avgWordsPerSentence);
    return Math.max(0, score);
  }

  private generateSEORecommendations(content: any, seoScore: number): string[] {
    const recommendations = [];
    
    if (seoScore < 70) {
      recommendations.push('Titel sollte 30-60 Zeichen lang sein');
      recommendations.push('Füge mehr Überschriften zur besseren Struktur hinzu');
      recommendations.push('Content sollte mindestens 300 Wörter haben');
    }
    
    if (seoScore < 50) {
      recommendations.push('Verbessere die Keyword-Dichte (0.5-3%)');
      recommendations.push('Verwende kürzere Sätze für bessere Lesbarkeit');
    }
    
    return recommendations;
  }

  private generateStructuredData(content: any): any {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": content.title,
      "description": content.excerpt || content.content.substring(0, 200),
      "author": {
        "@type": "Person",
        "name": "Mien Tuun Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Mien Tuun",
        "logo": {
          "@type": "ImageObject",
          "url": "https://mien-tuun.de/logo.png"
        }
      },
      "datePublished": new Date().toISOString()
    };
  }

  private async suggestInternalLinks(content: any): Promise<Array<{ text: string; url: string }>> {
    // Simulierte interne Verlinkungsvorschläge
    return [
      { text: "Weitere Gartentipps", url: "/blog/gartentipps" },
      { text: "Saisonale Rezepte", url: "/blog/saisonale-rezepte" }
    ];
  }
}
