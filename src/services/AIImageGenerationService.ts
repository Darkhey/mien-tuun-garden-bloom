
import { supabase } from "@/integrations/supabase/client";

export interface ImageGenerationOptions {
  title: string;
  content: string;
  category?: string;
  season?: string;
  tags?: string[];
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  model: string;
  warning?: string;
}

class AIImageGenerationService {
  private readonly FALLBACK_IMAGE = "/lovable-uploads/2a3ad273-430b-4675-b1c4-33dbaac0b6cf.png";
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY = 3000; // 3 seconds

  async generateBlogImage(options: ImageGenerationOptions): Promise<GeneratedImage> {
    console.log('[AIImageGeneration] Starting generation for:', options.title);
    
    const prompt = this.createImagePrompt(options);
    let lastError: Error | null = null;
    
    // Retry mechanism for better reliability
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`[AIImageGeneration] Attempt ${attempt}/${this.MAX_RETRIES}`);
        
        const { data, error } = await supabase.functions.invoke('generate-blog-image', {
          body: { 
            prompt,
            context: {
              title: options.title,
              category: options.category,
              season: options.season
            }
          }
        });

        if (error) {
          console.error(`[AIImageGeneration] Edge function error (attempt ${attempt}):`, error);
          lastError = new Error(`Edge function error: ${error.message}`);
          
          if (attempt < this.MAX_RETRIES) {
            console.log(`[AIImageGeneration] Waiting ${this.RETRY_DELAY}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
            continue;
          }
          throw lastError;
        }

        if (!data) {
          console.error(`[AIImageGeneration] No data received (attempt ${attempt})`);
          lastError = new Error('Keine Daten von der Edge Function erhalten');
          
          if (attempt < this.MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
            continue;
          }
          throw lastError;
        }

        // Handle fallback responses
        if (data.fallbackImage) {
          console.log('[AIImageGeneration] Received fallback image from edge function');
          return {
            url: data.fallbackImage,
            prompt,
            model: 'fallback',
            warning: 'AI-Generierung fehlgeschlagen - Fallback-Bild verwendet'
          };
        }

        if (!data.imageUrl) {
          console.error(`[AIImageGeneration] No image URL in response (attempt ${attempt}):`, data);
          lastError = new Error('Keine Bild-URL in der Antwort');
          
          if (attempt < this.MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
            continue;
          }
          throw lastError;
        }

        console.log('[AIImageGeneration] Generation successful:', {
          model: data.model,
          uploadedToStorage: data.uploadedToStorage,
          hasWarning: !!data.warning
        });
        
        return {
          url: data.imageUrl,
          prompt,
          model: data.model || 'unknown',
          warning: data.warning
        };

      } catch (error) {
        console.error(`[AIImageGeneration] Attempt ${attempt} failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.MAX_RETRIES) {
          console.log(`[AIImageGeneration] Waiting ${this.RETRY_DELAY}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        }
      }
    }

    // All retries failed - use fallback
    console.error('[AIImageGeneration] All attempts failed, using fallback');
    
    return {
      url: this.FALLBACK_IMAGE,
      prompt,
      model: 'static-fallback',
      warning: 'Alle Bildgenerierungsversuche fehlgeschlagen - Standard-Bild verwendet'
    };
  }

  private createImagePrompt(options: ImageGenerationOptions): string {
    const { title, content, category, season, tags } = options;
    
    // Extract keywords from content and title
    const keywords = this.extractKeywords(content, title);
    
    let prompt = "Hyperrealistisches, atmosphärisches Foto";
    
    // Category-specific adjustments
    if (category?.toLowerCase().includes('garten') || keywords.some(k => ['garten', 'pflanzen', 'blumen', 'gemüse', 'anbau'].includes(k.toLowerCase()))) {
      prompt += " einer Gartenszene";
    } else if (category?.toLowerCase().includes('koch') || keywords.some(k => ['kochen', 'rezept', 'küche', 'essen'].includes(k.toLowerCase()))) {
      prompt += " einer Küchenszene";
    } else {
      prompt += " einer natürlichen Szene";
    }
    
    // Seasonal adjustments
    if (season) {
      const seasonMap = {
        'frühling': 'im Frühling mit frischen grünen Trieben',
        'sommer': 'im Sommer mit üppigem Wachstum',
        'herbst': 'im Herbst mit warmen Farbtönen',
        'winter': 'im Winter mit ruhiger Atmosphäre'
      };
      prompt += ` ${seasonMap[season.toLowerCase()] || ''}`;
    }
    
    // Add relevant keywords
    if (keywords.length > 0) {
      const topKeywords = keywords.slice(0, 3).join(', ');
      prompt += `, fokussiert auf ${topKeywords}`;
    }
    
    // Style instructions for realism
    prompt += ". Natürliches Licht, professionelle Fotografie, hohe Schärfe, warme Atmosphäre. Keine Texte oder Overlays. Stil: Lifestyle-Fotografie.";
    
    return prompt;
  }

  private extractKeywords(content: string, title: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    
    const relevantKeywords = [
      'tomaten', 'salat', 'kräuter', 'basilikum', 'petersilie', 'schnittlauch',
      'kartoffeln', 'möhren', 'zwiebeln', 'knoblauch', 'paprika', 'gurken',
      'zucchini', 'kürbis', 'bohnen', 'erbsen', 'spinat', 'radieschen',
      'kochen', 'rezept', 'zubereitung', 'ernten', 'pflanzen', 'säen',
      'gießen', 'düngen', 'kompost', 'hochbeet', 'gewächshaus', 'balkon',
      'terrasse', 'garten', 'küche', 'haltbar', 'einkochen', 'trocknen'
    ];
    
    return relevantKeywords.filter(keyword => text.includes(keyword));
  }
}

export const aiImageGenerationService = new AIImageGenerationService();
