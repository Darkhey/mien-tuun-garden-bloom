import { supabase } from "@/integrations/supabase/client";

export interface ContentGenerationOptions {
  prompt: string;
  category?: string;
  season?: string;
  audiences?: string[];
  contentType?: string[];
  tags?: string[];
  excerpt?: string;
  imageUrl?: string;
  retries?: number;
}

export interface ContentQualityMetrics {
  score: number;
  wordCount: number;
  readabilityScore: number;
  seoScore: number;
  structureScore: number;
  issues: string[];
}

export interface GeneratedContent {
  content: string;
  title: string;
  quality: ContentQualityMetrics;
  metadata: {
    generationTime: number;
    promptUsed: string;
    modelUsed: string;
  };
}

// Erweiterte Kategorie-zu-Kontext Mappings für bessere KI-Prompts
const CATEGORY_CONTEXT_MAP = {
  "gartenplanung": "Gartenplanung und -design, Beetaufteilung, Jahresplanung",
  "aussaat-pflanzung": "Aussaat, Pflanzung, Vermehrung, Saatgut, Jungpflanzen",
  "pflanzenpflege": "Pflege von Gartenpflanzen, Düngen, Gießen, Schneiden",
  "schaedlingsbekaempfung": "Natürliche Schädlingsbekämpfung, Nützlinge, biologische Mittel",
  "kompostierung": "Kompostierung, Humusaufbau, organische Düngung",
  "saisonale-kueche": "Saisonales Kochen, Ernteküche, regionale Rezepte",
  "konservieren-haltbarmachen": "Haltbarmachen, Konservierung, Vorratshaltung",
  "kraeuter-heilpflanzen": "Kräutergarten, Heilpflanzen, natürliche Heilmittel",
  "nachhaltigkeit": "Nachhaltiges Gärtnern, Umweltschutz, Ressourcenschonung",
  "wassersparen-bewaesserung": "Wassersparen, effiziente Bewässerung, Regenwassernutzung",
  "diY-projekte": "DIY-Projekte für Garten, Selbstbau, Upcycling",
  "gartengeraete-werkzeuge": "Gartengeräte, Werkzeuge, Pflege und Anwendung",
  "ernte": "Erntezeit, Erntetechniken, optimaler Erntezeitpunkt",
  "lagerung-vorratshaltung": "Lagerung von Gartenerzeugnissen, Vorratshaltung",
  "selbstversorgung": "Selbstversorgung, Autarkie, Eigenanbau",
  "permakultur": "Permakultur-Prinzipien, nachhaltige Anbausysteme",
  "urban-gardening": "Gärtnern in der Stadt, Gemeinschaftsgärten",
  "balkon-terrasse": "Gärtnern auf Balkon und Terrasse, Topfgarten",
  "indoor-gardening": "Indoor-Gärtnern, Zimmerpflanzen, Hydroponik",
  "tipps-tricks": "Praktische Gartentipps, Tricks und Lifehacks",
  "jahreszeitliche-arbeiten": "Saisonale Gartenarbeiten, Gartenkalender",
  "bodenpflege": "Bodenpflege, Bodenverbesserung, Humusaufbau"
};

class ContentGenerationService {
  private maxRetries = 3;
  private retryDelay = 1000;

  async generateBlogPost(options: ContentGenerationOptions): Promise<GeneratedContent> {
    const startTime = Date.now();
    
    try {
      console.log("[ContentGeneration] Starting blog post generation:", options);
      
      const fullPrompt = this.buildEnhancedContextPrompt(options);
      const content = await this.callGenerationAPI(fullPrompt, options.retries || this.maxRetries);
      
      const quality = this.analyzeContentQuality(content);
      const generationTime = Date.now() - startTime;
      
      console.log("[ContentGeneration] Metrics:", {
        type: 'blog_post',
        prompt: fullPrompt,
        contentLength: content.length,
        quality: quality.score,
        generationTime,
        success: true
      });

      const title = this.extractTitleFromContent(content) || options.prompt.slice(0, 100);
      
      return {
        content,
        title,
        quality,
        metadata: {
          generationTime,
          promptUsed: fullPrompt,
          modelUsed: 'gpt-4o'
        }
      };
    } catch (error) {
      console.error("[ContentGeneration] Error:", error);
      
      console.log("[ContentGeneration] Error metrics:", {
        type: 'blog_post',
        prompt: options.prompt,
        error: String(error),
        generationTime: Date.now() - startTime,
        success: false
      });
      
      throw error;
    }
  }

  private buildEnhancedContextPrompt(options: ContentGenerationOptions): string {
    const categoryContext = options.category ? 
      CATEGORY_CONTEXT_MAP[options.category as keyof typeof CATEGORY_CONTEXT_MAP] || options.category : "";
    
    const contextParts = [
      options.prompt,
      categoryContext ? `Themenbereich: ${categoryContext}` : "",
      options.category ? `Kategorie: ${options.category}` : "",
      options.season ? `Saison: ${options.season}` : "",
      options.audiences?.length ? `Zielgruppe: ${options.audiences.join(", ")}` : "",
      options.contentType?.length ? `Content-Typ: ${options.contentType.join(", ")}` : "",
      options.tags?.length ? `Relevante Tags: ${options.tags.join(", ")}` : "",
      options.excerpt ? `Kurzbeschreibung: ${options.excerpt}` : "",
      options.imageUrl ? `Referenz-Bild: ${options.imageUrl}` : "",
      "Schreibstil: Informativ, praxisnah und inspirierend für Hobbygärtner und Selbstversorger.",
      "Zielgruppe: Deutsche Hobbygärtner, Selbstversorger und nachhaltigkeit-interessierte Menschen.",
      "Struktur: Verwende eine klare Struktur mit H1-Hauptüberschrift, Inhaltsverzeichnis nach der Einleitung, H2/H3-Zwischenüberschriften, kurzen Absätzen und relevanten Aufzählungen."
    ];
    
    return contextParts.filter(Boolean).join(" ");
  }

  private async callGenerationAPI(prompt: string, retries: number): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[ContentGeneration] API call attempt ${attempt}/${retries}`);
        
        const { data, error } = await supabase.functions.invoke('generate-blog-post', {
          body: { prompt }
        });

        if (error) {
          throw new Error(`Edge Function Error: ${error.message || error}`);
        }

        if (!data?.content) {
          throw new Error("Keine Inhalte von der KI erhalten");
        }

        console.log(`[ContentGeneration] Success on attempt ${attempt}`);
        return data.content;
        
      } catch (error) {
        console.error(`[ContentGeneration] Attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
    
    throw new Error("Maximum retries exceeded");
  }

  private analyzeContentQuality(content: string): ContentQualityMetrics {
    const issues: string[] = [];
    let score = 100;

    // Word count analysis
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    if (wordCount < 300) {
      issues.push("Artikel zu kurz (< 300 Wörter)");
      score -= 20;
    }
    
    // Structure analysis
    const headers = (content.match(/^#{1,6}\s/gm) || []).length;
    const structureScore = Math.min(100, headers * 20);
    
    if (headers < 2) {
      issues.push("Wenig strukturierte Überschriften");
      score -= 15;
    }

    // Readability (simplified)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = wordCount / sentences.length;
    const readabilityScore = Math.max(0, 100 - (avgWordsPerSentence - 15) * 2);
    
    if (avgWordsPerSentence > 25) {
      issues.push("Zu lange Sätze (schwer lesbar)");
      score -= 10;
    }

    // SEO basics
    let seoScore = 50;
    if (content.toLowerCase().includes("seo")) seoScore += 10;
    if (headers > 0) seoScore += 20;
    if (wordCount > 500) seoScore += 20;

    return {
      score: Math.max(0, score),
      wordCount,
      readabilityScore: Math.round(readabilityScore),
      seoScore,
      structureScore,
      issues
    };
  }

  private extractTitleFromContent(content: string): string | null {
    // Versuche H1 Überschrift zu finden
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) return h1Match[1].trim();
    
    // Fallback: erste Zeile nehmen
    const firstLine = content.split('\n')[0].trim();
    if (firstLine.length > 5 && firstLine.length < 100) {
      return firstLine.replace(/^#+\s*/, '');
    }
    
    return null;
  }

  async generateMultipleArticles(suggestions: string[], baseOptions: ContentGenerationOptions): Promise<GeneratedContent[]> {
    console.log(`[ContentGeneration] Starting batch generation for ${suggestions.length} articles`);
    
    const results = await Promise.allSettled(
      suggestions.map(async (suggestion) => {
        const options = { ...baseOptions, prompt: suggestion };
        return await this.generateBlogPost(options);
      })
    );

    const successful = results
      .filter((result): result is PromiseFulfilledResult<GeneratedContent> => result.status === 'fulfilled')
      .map(result => result.value);

    const failed = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);

    if (failed.length > 0) {
      console.warn(`[ContentGeneration] ${failed.length} articles failed:`, failed);
    }

    console.log(`[ContentGeneration] Batch completed: ${successful.length}/${suggestions.length} successful`);
    return successful;
  }
}

export const contentGenerationService = new ContentGenerationService();