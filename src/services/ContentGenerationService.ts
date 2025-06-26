import { supabase } from '@/integrations/supabase/client';
import { geminiService } from './GeminiService';

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
    provider: string;
    wordCount: number;
    readingTime: number;
    qualityScore: number;
    seoScore: number;
  };
  seoData: any;
}

import SEOService from './SEOService';

class ContentGenerationServiceClass {
  private static instance: ContentGenerationServiceClass;

  public static getInstance(): ContentGenerationServiceClass {
    if (!ContentGenerationServiceClass.instance) {
      ContentGenerationServiceClass.instance = new ContentGenerationServiceClass();
    }
    return ContentGenerationServiceClass.instance;
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

  private async generateWithOpenAI(params: {
    prompt: string;
    category?: string;
    season?: string;
    audiences?: string[];
    contentType?: string[];
    tags?: string[];
    excerpt?: string;
  }): Promise<{ content: string; model?: string } | null> {
    try {
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
      if (data?.content) {
        return { content: data.content, model: data.metadata?.model };
      }
    } catch (err) {
      console.warn('[ContentGeneration] OpenAI failed:', err);
    }
    return null;
  }

  private async generateWithGemini(params: {
    prompt: string;
    category?: string;
    season?: string;
    audiences?: string[];
    contentType?: string[];
    tags?: string[];
  }): Promise<string | null> {
    try {
      return await geminiService.generateBlogPost(params);
    } catch (err) {
      console.error('[ContentGeneration] Gemini generation failed:', err);
      return null;
    }
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
    console.log('[ContentGeneration] Starting enhanced blog post generation with OpenAI + Gemini fallback');
    
    try {
      const startTime = Date.now();

      let content: string | null = null;
      let usedProvider = 'OpenAI';
      let usedModel = 'gpt-4o';

      const openAIResult = await this.generateWithOpenAI(params);
      if (openAIResult) {
        content = openAIResult.content;
        usedModel = openAIResult.model || usedModel;
      } else {
        const geminiResult = await this.generateWithGemini(params);
        if (geminiResult) {
          content = geminiResult;
          usedProvider = 'Google Gemini';
          usedModel = 'gemini-1.5-flash';
          console.log('[ContentGeneration] Gemini fallback successful');
        }
      }

      if (!content) {
        throw new Error('Beide KI-Services sind nicht verfügbar');
      }

      // Titel aus Content extrahieren
      const title = this.extractTitleFromContent(content) || 'Neuer Blog-Artikel';
      
      // SEO-Daten automatisch generieren
      const seoService = SEOService.getInstance();
      const seoData = await seoService.generateBlogPostSEO({
        title,
        content: content,
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
          const imageResult = await this.generateBlogImage(title, content, params.category);
          featuredImage = imageResult;
        } catch (imageError) {
          console.warn('[ContentGeneration] Image generation failed:', imageError);
        }
      }

      const quality = this.assessContentQuality(content, title);
      const endTime = Date.now();

      return {
        content,
        title,
        quality,
        featuredImage,
        seoData,
        metadata: {
          generationTime: endTime - startTime,
          model: usedModel,
          provider: usedProvider,
          wordCount: content.split(/\s+/).length,
          readingTime: Math.ceil(content.split(/\s+/).length / 160),
          qualityScore: Math.round(quality.score),
          seoScore: seoData ? seoService.analyzeSEO({ title, content, excerpt: params.excerpt }).score : 0
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

export const contentGenerationService = ContentGenerationServiceClass.getInstance();
