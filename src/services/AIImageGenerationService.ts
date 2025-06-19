
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
}

class AIImageGenerationService {
  async generateBlogImage(options: ImageGenerationOptions): Promise<GeneratedImage> {
    console.log('[AIImageGeneration] Generating image for blog post:', options.title);
    
    // Erstelle einen optimierten Prompt basierend auf dem Blog-Inhalt
    const prompt = this.createImagePrompt(options);
    
    try {
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
        throw new Error(`Bildgenerierung fehlgeschlagen: ${error.message}`);
      }

      if (!data?.imageUrl) {
        throw new Error('Keine Bild-URL von der KI erhalten');
      }

      console.log('[AIImageGeneration] Bild erfolgreich generiert:', data.imageUrl);
      
      return {
        url: data.imageUrl,
        prompt,
        model: 'gpt-image-1'
      };
    } catch (error) {
      console.error('[AIImageGeneration] Fehler bei Bildgenerierung:', error);
      throw error;
    }
  }

  private createImagePrompt(options: ImageGenerationOptions): string {
    const { title, content, category, season, tags } = options;
    
    // Extrahiere Schlüsselwörter aus dem Inhalt
    const keywords = this.extractKeywords(content, title);
    
    // Basis-Prompt für realistische Garten-/Küchen-Bilder
    let prompt = "Hyperrealistisches, atmosphärisches Foto";
    
    // Kategorie-spezifische Anpassungen
    if (category?.toLowerCase().includes('garten') || keywords.some(k => ['garten', 'pflanzen', 'blumen', 'gemüse', 'anbau'].includes(k.toLowerCase()))) {
      prompt += " einer Gartenszene";
    } else if (category?.toLowerCase().includes('koch') || keywords.some(k => ['kochen', 'rezept', 'küche', 'essen'].includes(k.toLowerCase()))) {
      prompt += " einer Küchenszene";
    } else {
      prompt += " einer natürlichen Szene";
    }
    
    // Saisonale Anpassungen
    if (season) {
      const seasonMap = {
        'frühling': 'im Frühling mit frischen grünen Trieben',
        'sommer': 'im Sommer mit üppigem Wachstum',
        'herbst': 'im Herbst mit warmen Farbtönen',
        'winter': 'im Winter mit ruhiger Atmosphäre'
      };
      prompt += ` ${seasonMap[season.toLowerCase()] || ''}`;
    }
    
    // Füge relevante Schlüsselwörter hinzu
    if (keywords.length > 0) {
      const topKeywords = keywords.slice(0, 3).join(', ');
      prompt += `, fokussiert auf ${topKeywords}`;
    }
    
    // Stil-Anweisungen für Realismus
    prompt += ". Natürliches Licht, professionelle Fotografie, hohe Schärfe, warme Atmosphäre. Keine Texte oder Overlays. Stil: Lifestyle-Fotografie.";
    
    return prompt;
  }

  private extractKeywords(content: string, title: string): string[] {
    // Kombiniere Titel und Content für Keyword-Extraktion
    const text = `${title} ${content}`.toLowerCase();
    
    // Relevante Garten- und Küchen-Keywords
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

  async uploadImageToSupabase(imageBase64: string, filename: string): Promise<string> {
    try {
      // Konvertiere Base64 zu Blob
      const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      
      // Upload zu Supabase Storage
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(`generated/${filename}`, blob, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Erhalte öffentliche URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(`generated/${filename}`);

      return publicUrl;
    } catch (error) {
      console.error('[AIImageGeneration] Upload-Fehler:', error);
      throw new Error(`Bild-Upload fehlgeschlagen: ${error.message}`);
    }
  }
}

export const aiImageGenerationService = new AIImageGenerationService();
