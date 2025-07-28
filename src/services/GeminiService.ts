
import { supabase } from '@/integrations/supabase/client';

export interface GeminiConfig {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

export class GeminiService {
  private static instance: GeminiService;
  private apiKey: string | null = null;

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  private constructor() {
    // API key will be retrieved from edge functions
  }

  async generateText(prompt: string, config: GeminiConfig = {}): Promise<string> {
    const {
      temperature = 0.7,
      maxOutputTokens = 4000,
      topP = 0.8,
      topK = 40
    } = config;

    try {
      const { data, error } = await supabase.functions.invoke('generate-with-gemini', {
        body: {
          prompt,
          config: {
            temperature,
            maxOutputTokens,
            topP,
            topK
          }
        }
      });

      if (error) throw error;
      if (!data?.text) throw new Error('Keine Antwort von Gemini erhalten');

      return data.text;
    } catch (error: any) {
      console.error('[GeminiService] Text generation failed:', error);
      throw new Error(`Gemini-Generierung fehlgeschlagen: ${error.message}`);
    }
  }

  async generateBlogPost(params: {
    prompt: string;
    category?: string;
    season?: string;
    audiences?: string[];
    contentType?: string[];
    tags?: string[];
  }): Promise<string> {
    // Der Prompt sollte bereits Marianne-Stil enthalten, wenn er von ContentGenerationService kommt
    const isMariannePrompt = params.prompt.includes('Moin moin ihr Lieben') || params.prompt.includes('Marianne');
    
    let systemPrompt;
    if (isMariannePrompt) {
      // Marianne-Prompt direkt verwenden
      systemPrompt = params.prompt;
    } else {
      // Fallback für Legacy-Calls
      systemPrompt = `Du bist Marianne, eine erfahrene deutsche Garten- und Küchenbloggerin.
      
      ERÖFFNUNG: Beginne IMMER mit "Moin moin ihr Lieben"
      ABSCHLUSS: Beende IMMER mit "bis zum nächsten Mal meine Lieben"
      
      ${params.category ? `Kategorie: ${params.category}` : ''}
      ${params.season ? `Saison: ${params.season}` : ''}
      ${params.audiences?.length ? `Zielgruppe: ${params.audiences.join(', ')}` : ''}
      ${params.contentType?.length ? `Content-Typ: ${params.contentType.join(', ')}` : ''}
      ${params.tags?.length ? `Tags: ${params.tags.join(', ')}` : ''}
      
      Schreibe einen herzlichen, persönlichen Blogartikel (1200+ Wörter) mit "ihr" statt "Sie".
      Thema: ${params.prompt}`;
    }

    return this.generateText(systemPrompt, {
      temperature: 0.7,
      maxOutputTokens: 4000
    });
  }
}

export const geminiService = GeminiService.getInstance();
