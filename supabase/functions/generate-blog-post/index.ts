
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

async function fetchWithBackoff(url: string, options: RequestInit, maxRetries = 3, delayMs = 1000): Promise<Response> {
  let attempt = 0;
  let currentDelay = delayMs;
  
  while (true) {
    try {
      const res = await fetch(url, options);
      if (res.ok || attempt >= maxRetries) {
        return res;
      }

      // Retry only on server errors or rate limits
      if (res.status >= 500 || res.status === 429) {
        console.warn(`[generate-blog-post] OpenAI Error ${res.status}. Retry ${attempt + 1} in ${currentDelay}ms`);
        await new Promise((r) => setTimeout(r, currentDelay));
        attempt++;
        currentDelay *= 2;
        continue;
      }

      return res;
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      console.warn(`[generate-blog-post] Request failed (attempt ${attempt + 1}). Retrying in ${currentDelay}ms`, err);
      await new Promise((r) => setTimeout(r, currentDelay));
      attempt++;
      currentDelay *= 2;
    }
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  console.log(`[generate-blog-post] Request method: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Enhanced Input-Validierung
    const body = await req.json();
    const { prompt, context } = body;
    
    console.log("[generate-blog-post] Eingehender Request Body:", JSON.stringify(body));
    console.log("[generate-blog-post] Extrahierter Prompt:", prompt);

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      console.error("[generate-blog-post] Ungültiger Prompt:", prompt);
      return new Response(
        JSON.stringify({ 
          error: "Prompt ist erforderlich und darf nicht leer sein",
          details: "Ein gültiger Prompt muss als String übergeben werden" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (prompt.length > 32000) {
      return new Response(
        JSON.stringify({ 
          error: "Prompt zu lang",
          details: "Der Prompt darf maximal 32000 Zeichen haben" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!openAIApiKey) {
      console.error("[generate-blog-post] OpenAI API Key fehlt");
      return new Response(
        JSON.stringify({ 
          error: "OpenAI API Key nicht konfiguriert",
          details: "Der Server ist nicht korrekt konfiguriert" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Enhanced System Prompt mit strengerer Kategorie-Einhaltung
    let systemPrompt = `Du bist Marianne, eine professionelle deutschsprachige Bloggerin für Garten & Küche und schreibst inspirierende, SEO-optimierte Blogartikel. 

WICHTIGE ANFORDERUNGEN:
- Schreibe ausschließlich auf Deutsch
- Verwende Markdown-Format mit H1 Titel und H2/H3 Unterüberschriften
- Erstelle 800-1200 Wörter umfassende, gut strukturierte Artikel
- Integriere natürlich SEO-relevante Keywords
- Schreibe praxisnah und inspirierend
- Verwende Listen und konkrete Tipps wo möglich
- BEFOLGE ALLE KATEGORIE- UND TAG-VORGABEN STRIKT!

STRUKTUR:
1. H1 Haupttitel (einprägsam und SEO-optimiert)
2. Einleitung (2-3 Sätze, die neugierig machen)
3. 3-5 H2-Abschnitte mit praktischen Inhalten
4. Fazit mit Handlungsaufforderung

KATEGORIEKONFORMITÄT:
- Wenn eine Kategorie angegeben ist, MUSS der Artikel zu 100% in diese Kategorie passen
- Alle genannten Tags MÜSSEN relevant im Artikel behandelt werden
- Saisonale Bezüge sind PFLICHT, wenn eine Saison angegeben ist

FORMAT: Reines Markdown ohne Metadaten-Block.`;

    if (context) {
      systemPrompt += `\n\nKONTEXT: ${JSON.stringify(context)}`;
    }

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      { role: "user", content: prompt.trim() }
    ];

    console.log("[generate-blog-post] Sende Request an OpenAI API...");
    console.log("[generate-blog-post] System Prompt Length:", systemPrompt.length);

    const openAIResponse = await fetchWithBackoff("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        max_tokens: 3000, // Erhöht für längere Artikel
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      })
    });

    console.log(`[generate-blog-post] OpenAI Response Status: ${openAIResponse.status}`);

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error(`[generate-blog-post] OpenAI API Fehler (${openAIResponse.status}):`, errorText);

      return new Response(
        JSON.stringify({
          error: `OpenAI API Fehler nach mehreren Versuchen`,
          status: openAIResponse.status,
          details: errorText.substring(0, 500) // Begrenzte Fehlermeldung
        }),
        {
          status: openAIResponse.status >= 500 ? 502 : openAIResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await openAIResponse.json();
    console.log("[generate-blog-post] OpenAI Response erhalten");

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("[generate-blog-post] Kein Content in OpenAI Response:", data);
      return new Response(
        JSON.stringify({ 
          error: "Keine Antwort von OpenAI erhalten",
          details: "Die KI hat keinen verwertbaren Content generiert" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Enhanced Content-Analyse
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 160);
    const hasTitle = content.includes('# ');
    const hasSubheadings = (content.match(/## /g) || []).length;
    
    const qualityScore = Math.min(100, Math.max(40, 
      (wordCount >= 500 ? 20 : wordCount / 25) +
      (hasTitle ? 15 : 0) +
      (hasSubheadings * 5) +
      (content.length > 1000 ? 20 : content.length / 50) +
      (content.includes('###') ? 10 : 0) +
      20 // Basis-Score
    ));

    console.log("[generate-blog-post] Artikel erfolgreich generiert.", {
      contentLength: content.length,
      wordCount,
      readingTime,
      qualityScore
    });
    
    return new Response(
      JSON.stringify({ 
        content,
        metadata: {
          wordCount,
          readingTime,
          qualityScore: Math.round(qualityScore),
          hasTitle,
          subheadingCount: hasSubheadings,
          model: "gpt-4o",
          timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("[generate-blog-post] Unbehandelter Fehler:", err);
    console.error("[generate-blog-post] Error stack:", err.stack);
    
    return new Response(
      JSON.stringify({ 
        error: "Interner Server-Fehler",
        details: String(err?.message ?? err).substring(0, 200)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
