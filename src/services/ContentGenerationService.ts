import { supabase } from '@/integrations/supabase/client';

export interface ContentQuality {
  score: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  titleScore: number;
  keywordDensity: number;
  readabilityScore: number;
  structureScore: number;
}

export interface GeneratedContent {
  content: string;
  title: string;
  quality: ContentQuality;
  featuredImage?: string;
  metadata: {
    generationTime: number;
    model: string;
    wordCount: number;
    readingTime: number;
    qualityScore: number;
    seoScore: number;
  };
  seoData: any;
}

import SEOService from './SEOService';

export class ContentGenerationService {
  private static instance: ContentGenerationService;

  public static getInstance(): ContentGenerationService {
    if (!ContentGenerationService.instance) {
      ContentGenerationService.instance = new ContentGenerationService();
    }
    return ContentGenerationService.instance;
  }

  assessContentQuality(content: string, title: string): ContentQuality {
    const wordCount = content.split(/\s+/).length;
    const sentenceCount = content.split(/[.!?]+/).length;
    const paragraphCount = content.split(/\n\n+/).length;

    // Titel-Bewertung
    let titleScore = 0;
    if (title.length >= 5 && title.length <= 12) {
      titleScore = 20;
    } else if (title.length > 12) {
      titleScore = 15;
    } else {
      titleScore = 10;
    }

    // Keyword-Dichte (vereinfacht)
    const keywords = title.toLowerCase().split(' ');
    let keywordDensity = 0;
    keywords.forEach(keyword => {
      if (keyword.length > 3) {
        const regex = new RegExp(keyword, 'gi');
        const matches = content.match(regex) || [];
        keywordDensity += matches.length;
      }
    });
    keywordDensity = Math.min(10, keywordDensity / wordCount * 100);

    // Lesbarkeit (Flesch-Reading-Ease)
    const avgWordsPerSentence = wordCount / sentenceCount;
    let readabilityScore = 206.835 - (1.015 * avgWordsPerSentence);
    readabilityScore = Math.max(0, Math.min(100, readabilityScore));

    // Struktur-Bewertung
    let structureScore = 0;
    const h2Count = (content.match(/## /g) || []).length;
    const h3Count = (content.match(/### /g) || []).length;
    structureScore = Math.min(30, h2Count * 5 + h3Count * 3);

    let score = titleScore + keywordDensity + readabilityScore + structureScore;
    score = Math.min(100, score);

    return {
      score,
      wordCount,
      sentenceCount,
      paragraphCount,
      titleScore,
      keywordDensity,
      readabilityScore,
      structureScore
    };
  }

  extractTitleFromContent(content: string): string | null {
    const match = content.match(/^#\s+(.*)/m);
    return match ? match[1].trim() : null;
  }

  async generateBlogPost(params: {
    prompt: string;
    category?: string;
    season?: string;
    audiences?: string[];
    contentType?: string[];
    tags?: string[];
    excerpt?: string;
    imageUrl?: string;
  }): Promise<GeneratedContent> {
    console.log('[ContentGeneration] Starting enhanced blog post generation with SEO');
    
    try {
      const startTime = Date.now();
      
      // Generiere Content wie bisher
      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: {
          prompt: params.prompt,
          context: {
            category: params.category,
            season: params.season,
            audiences: params.audiences,
            contentType: params.contentType,
            tags: params.tags,
            excerpt: params.excerpt
          }
        }
      });

      if (error) throw error;
      if (!data?.content) throw new Error('Kein Content generiert');

      // Titel aus Content extrahieren
      const title = this.extractTitleFromContent(data.content) || 'Neuer Blog-Artikel';
      
      // SEO-Daten automatisch generieren
      const seoService = SEOService.getInstance();
      const seoData = await seoService.generateBlogPostSEO({
        title,
        content: data.content,
        excerpt: params.excerpt,
        category: params.category,
        tags: params.tags,
        featuredImage: params.imageUrl
      });

      // KI-Bild generieren wenn keins vorhanden
      let featuredImage = params.imageUrl;
      if (!featuredImage) {
        try {
          console.log('[ContentGeneration] Generating AI image for blog post');
          const imageResult = await this.generateBlogImage(title, data.content, params.category);
          featuredImage = imageResult;
        } catch (imageError) {
          console.warn('[ContentGeneration] Image generation failed:', imageError);
        }
      }

      const quality = this.assessContentQuality(data.content, title);
      const endTime = Date.now();

      return {
        content: data.content,
        title,
        quality,
        featuredImage,
        seoData, // Neue SEO-Daten hinzufügen
        metadata: {
          generationTime: endTime - startTime,
          model: data.metadata?.model || 'gpt-4o',
          wordCount: data.metadata?.wordCount || data.content.split(/\s+/).length,
          readingTime: data.metadata?.readingTime || Math.ceil(data.content.split(/\s+/).length / 160),
          qualityScore: Math.round(quality.score),
          seoScore: seoData ? seoService.analyzeSEO({ title, content: data.content, excerpt: params.excerpt }).score : 0
        }
      };
    } catch (error: any) {
      console.error('[ContentGeneration] Blog post generation failed:', error);
      throw new Error(`Content-Generierung fehlgeschlagen: ${error.message}`);
    }
  }

  private async generateBlogImage(title: string, content: string, category?: string): Promise<string> {
    const contentPreview = content.slice(0, 200).replace(/<[^>]*>/g, '');
    const categoryContext = category ? ` im Bereich ${category}` : '';
    
    const imagePrompt = `Hyperrealistisches, atmosphärisches Bild passend zum Thema "${title}"${categoryContext}. 
    Kontext: ${contentPreview}. 
    Stil: Natürliches Licht, warme Atmosphäre, Garten/Küche-Setting, hochwertige Fotografie. 
    Ohne Text oder Schrift.`;

    const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
      body: { prompt: imagePrompt }
    });

    if (error) throw error;
    if (!data?.imageUrl) throw new Error('Keine Bild-URL erhalten');

    return data.imageUrl;
  }
}
