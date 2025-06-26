
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
    const systemPrompt = `Du bist Marianne, eine professionelle deutschsprachige Bloggerin für Garten & Küche und schreibst inspirierende, SEO-optimierte Blogartikel.

WICHTIGE ANFORDERUNGEN:
- Schreibe ausschließlich auf Deutsch
- Verwende Markdown-Format mit H1 Titel und H2/H3 Unterüberschriften
- Erstelle 1000-1500 Wörter umfassende, tiefgreifende Artikel
- Integriere natürlich Long-Tail-SEO-Keywords
- Schreibe praxisnah, inspirierend und wissenschaftlich fundiert
- Verwende strukturierte Listen und konkrete Handlungsanleitungen

KONTEXT:
${params.category ? `Kategorie: ${params.category}` : ''}
${params.season ? `Saison: ${params.season}` : ''}
${params.audiences ? `Zielgruppe: ${params.audiences.join(', ')}` : ''}
${params.contentType ? `Content-Typ: ${params.contentType.join(', ')}` : ''}
${params.tags ? `Tags: ${params.tags.join(', ')}` : ''}

PROMPT: ${params.prompt}`;

    return this.generateText(systemPrompt, {
      temperature: 0.7,
      maxOutputTokens: 4000
    });
  }
}

export const geminiService = GeminiService.getInstance();
