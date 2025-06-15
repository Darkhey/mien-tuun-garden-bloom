
export interface QualityMetrics {
  qualityScore: number;
  readabilityScore: number;
  structureScore: number;
  contentScore: number;
  technicalScore: number;
  issues: Array<{
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    severity: number;
  }>;
  recommendations: string[];
}

export class QualityAssuranceService {
  async performComprehensiveCheck(content: any, config: any): Promise<QualityMetrics> {
    console.log('[QualityAssurance] Performing comprehensive quality check');
    
    const issues = [];
    const recommendations = [];
    
    // Content-Qualität prüfen
    const contentScore = this.analyzeContentQuality(content, issues, recommendations);
    
    // Struktur prüfen
    const structureScore = this.analyzeStructure(content, issues, recommendations);
    
    // Lesbarkeit prüfen
    const readabilityScore = this.analyzeReadability(content, issues, recommendations);
    
    // Technische Aspekte prüfen
    const technicalScore = this.analyzeTechnicalAspects(content, issues, recommendations);
    
    // Gesamtscore berechnen
    const qualityScore = Math.round(
      (contentScore * 0.4 + structureScore * 0.25 + readabilityScore * 0.25 + technicalScore * 0.1)
    );
    
    // Konfigurationsspezifische Prüfungen
    this.checkConfigRequirements(content, config, issues, recommendations);
    
    return {
      qualityScore,
      readabilityScore,
      structureScore,
      contentScore,
      technicalScore,
      issues,
      recommendations
    };
  }

  private analyzeContentQuality(content: any, issues: any[], recommendations: string[]): number {
    let score = 100;
    const wordCount = content.content.split(/\s+/).length;
    
    // Wortanzahl prüfen
    if (wordCount < 300) {
      issues.push({
        type: 'error',
        message: `Artikel zu kurz: ${wordCount} Wörter (Minimum: 300)`,
        severity: 3
      });
      score -= 30;
    } else if (wordCount < 500) {
      issues.push({
        type: 'warning',
        message: `Artikel könnte länger sein: ${wordCount} Wörter`,
        severity: 2
      });
      score -= 10;
    }
    
    // Titel-Qualität prüfen
    if (!content.title || content.title.length < 10) {
      issues.push({
        type: 'error',
        message: 'Titel fehlt oder ist zu kurz',
        severity: 3
      });
      score -= 20;
    } else if (content.title.length > 70) {
      issues.push({
        type: 'warning',
        message: 'Titel könnte für SEO zu lang sein',
        severity: 2
      });
      score -= 5;
    }
    
    // Content-Originalität (vereinfacht)
    const uniqueWords = new Set(content.content.toLowerCase().split(/\s+/)).size;
    const totalWords = wordCount;
    const uniquenessRatio = uniqueWords / totalWords;
    
    if (uniquenessRatio < 0.4) {
      issues.push({
        type: 'warning',
        message: 'Viele Wortwiederholungen - Content könnte vielfältiger sein',
        severity: 2
      });
      score -= 15;
    }
    
    // Empfehlungen
    if (wordCount < 800) {
      recommendations.push('Erweitere den Artikel mit mehr Details und Beispielen');
    }
    if (uniquenessRatio < 0.5) {
      recommendations.push('Verwende mehr abwechslungsreiche Formulierungen');
    }
    
    return Math.max(0, score);
  }

  private analyzeStructure(content: any, issues: any[], recommendations: string[]): number {
    let score = 100;
    
    // Überschriften-Struktur prüfen
    const headers = content.content.match(/^#{1,6}\s.+$/gm) || [];
    
    if (headers.length === 0) {
      issues.push({
        type: 'error',
        message: 'Keine Überschriften gefunden - schlechte Struktur',
        severity: 3
      });
      score -= 40;
    } else if (headers.length < 3) {
      issues.push({
        type: 'warning',
        message: 'Wenige Überschriften - Struktur könnte verbessert werden',
        severity: 2
      });
      score -= 20;
    }
    
    // Listen und Aufzählungen
    const lists = content.content.match(/^\s*[-*+]\s/gm) || [];
    const numberedLists = content.content.match(/^\s*\d+\.\s/gm) || [];
    
    if (lists.length === 0 && numberedLists.length === 0) {
      recommendations.push('Füge Listen oder Aufzählungen für bessere Lesbarkeit hinzu');
      score -= 10;
    }
    
    // Absätze prüfen
    const paragraphs = content.content.split('\n\n').filter(p => p.trim().length > 0);
    const avgParagraphLength = content.content.length / paragraphs.length;
    
    if (avgParagraphLength > 500) {
      issues.push({
        type: 'warning',
        message: 'Absätze sind zu lang - teile sie für bessere Lesbarkeit auf',
        severity: 2
      });
      score -= 15;
    }
    
    return Math.max(0, score);
  }

  private analyzeReadability(content: any, issues: any[], recommendations: string[]): number {
    let score = 100;
    
    // Satzlänge analysieren
    const sentences = content.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.content.split(/\s+/);
    const avgWordsPerSentence = words.length / sentences.length;
    
    if (avgWordsPerSentence > 25) {
      issues.push({
        type: 'warning',
        message: `Sätze sind zu lang (Ø ${avgWordsPerSentence.toFixed(1)} Wörter)`,
        severity: 2
      });
      score -= 20;
      recommendations.push('Verwende kürzere Sätze (max. 20 Wörter)');
    } else if (avgWordsPerSentence > 20) {
      score -= 10;
    }
    
    // Komplexe Wörter analysieren (vereinfacht)
    const complexWords = words.filter(word => word.length > 12).length;
    const complexWordRatio = complexWords / words.length;
    
    if (complexWordRatio > 0.1) {
      issues.push({
        type: 'suggestion',
        message: 'Viele komplexe Wörter - vereinfache wenn möglich',
        severity: 1
      });
      score -= 10;
    }
    
    // Passiv-Konstruktionen (vereinfacht)
    const passiveIndicators = ['wurde', 'wurden', 'wird', 'werden'];
    const passiveCount = passiveIndicators.reduce((count, indicator) => {
      return count + (content.content.toLowerCase().match(new RegExp(indicator, 'g')) || []).length;
    }, 0);
    
    if (passiveCount > sentences.length * 0.3) {
      recommendations.push('Verwende mehr aktive Formulierungen statt Passiv');
      score -= 5;
    }
    
    return Math.max(0, score);
  }

  private analyzeTechnicalAspects(content: any, issues: any[], recommendations: string[]): number {
    let score = 100;
    
    // HTML-Struktur prüfen (falls vorhanden)
    const htmlTags = content.content.match(/<[^>]+>/g) || [];
    const unclosedTags = this.findUnclosedTags(content.content);
    
    if (unclosedTags.length > 0) {
      issues.push({
        type: 'error',
        message: `Ungeschlossene HTML-Tags: ${unclosedTags.join(', ')}`,
        severity: 3
      });
      score -= 30;
    }
    
    // Bild-Alt-Texte prüfen
    const images = content.content.match(/<img[^>]*>/g) || [];
    const imagesWithoutAlt = images.filter(img => !img.includes('alt='));
    
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'warning',
        message: 'Bilder ohne Alt-Text gefunden',
        severity: 2
      });
      score -= 15;
    }
    
    // Links prüfen
    const links = content.content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
    const emptyLinks = links.filter(link => {
      const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
      return !match || !match[2] || match[2].trim() === '';
    });
    
    if (emptyLinks.length > 0) {
      issues.push({
        type: 'error',
        message: 'Leere oder ungültige Links gefunden',
        severity: 3
      });
      score -= 20;
    }
    
    return Math.max(0, score);
  }

  private checkConfigRequirements(content: any, config: any, issues: any[], recommendations: string[]): void {
    const wordCount = content.content.split(/\s+/).length;
    
    // Wortanzahl-Ziele prüfen
    if (config.seoTargets) {
      if (wordCount < config.seoTargets.minWordCount) {
        issues.push({
          type: 'error',
          message: `Artikel erreicht nicht die Ziel-Wortanzahl: ${wordCount}/${config.seoTargets.minWordCount}`,
          severity: 3
        });
      }
      
      if (wordCount > config.seoTargets.maxWordCount) {
        issues.push({
          type: 'warning',
          message: `Artikel überschreitet die maximale Wortanzahl: ${wordCount}/${config.seoTargets.maxWordCount}`,
          severity: 2
        });
      }
    }
    
    // Zielgruppen-spezifische Prüfungen
    if (config.targetAudience === 'anfaenger') {
      const complexSentences = content.content.split(/[.!?]+/).filter(s => s.split(/\s+/).length > 15);
      if (complexSentences.length > 5) {
        recommendations.push('Vereinfache die Sprache für Anfänger-Zielgruppe');
      }
    }
  }

  private findUnclosedTags(content: string): string[] {
    const openTags = [];
    const tagStack = [];
    const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];
    
    const tagMatches = content.match(/<\/?[^>]+>/g) || [];
    
    for (const tag of tagMatches) {
      if (tag.startsWith('</')) {
        // Closing tag
        const tagName = tag.slice(2, -1);
        if (tagStack.length > 0 && tagStack[tagStack.length - 1] === tagName) {
          tagStack.pop();
        }
      } else if (!tag.endsWith('/>') && !selfClosingTags.some(st => tag.includes(st))) {
        // Opening tag
        const tagName = tag.slice(1).split(/\s/)[0].replace('>', '');
        tagStack.push(tagName);
      }
    }
    
    return tagStack;
  }
}
