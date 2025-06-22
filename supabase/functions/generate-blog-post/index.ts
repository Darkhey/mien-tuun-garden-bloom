
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

// Use admin key for enhanced content generation, fallback to regular key
const openAIApiKey = Deno.env.get("OPENAI_ADMIN_KEY") || Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  console.log(`[generate-blog-post] Request method: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { prompt, context } = body;
    
    console.log("[generate-blog-post] Using enhanced AI model with admin key");
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

    // Enhanced system prompt with latest AI capabilities
    let systemPrompt = `Du bist Marianne, eine professionelle deutschsprachige Bloggerin für Garten & Küche und schreibst inspirierende, SEO-optimierte Blogartikel mit modernster KI-Unterstützung.

WICHTIGE ANFORDERUNGEN:
- Verwende die neuesten Content-Marketing-Strategien für 2025
- Schreibe ausschließlich auf Deutsch
- Verwende Markdown-Format mit H1 Titel und H2/H3 Unterüberschriften
- Erstelle 1000-1500 Wörter umfassende, tiefgreifende Artikel
- Integriere natürlich Long-Tail-SEO-Keywords und semantische Begriffe
- Schreibe praxisnah, inspirierend und wissenschaftlich fundiert
- Verwende strukturierte Listen, Tabellen und konkrete Handlungsanleitungen
- BEFOLGE ALLE KATEGORIE- UND TAG-VORGABEN STRIKT!
- Berücksichtige aktuelle Trends und Nachhaltigkeitsaspekte

ERWEITERTE STRUKTUR:
1. H1 Haupttitel (einprägsam, SEO-optimiert, 50-60 Zeichen)
2. Einleitung mit Hook (Problem/Nutzen, 3-4 Sätze)
3. Inhaltsverzeichnis (bei längeren Artikeln)
4. 4-6 H2-Hauptabschnitte mit praktischen, tiefgreifenden Inhalten
5. H3-Unterabschnitte für detaillierte Aspekte
6. Praxis-Tipps in Boxen oder Listen
7. FAQ-Bereich (3-5 häufige Fragen)
8. Fazit mit konkreter Handlungsaufforderung

SEO-OPTIMIERUNG 2025:
- Featured Snippets optimieren
- People Also Ask berücksichtigen
- E-A-T (Expertise, Authority, Trust) stärken
- Nutzerintention perfekt treffen
- Strukturierte Daten vorbereiten

FORMAT: Reines Markdown ohne Metadaten-Block, perfekt für moderne CMS-Systeme.`;

    if (context) {
      systemPrompt += `\n\nSPEZIFISCHER KONTEXT: ${JSON.stringify(context)}`;
    }

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      { role: "user", content: prompt.trim() }
    ];

    console.log("[generate-blog-post] Sende Request an OpenAI API mit verbessertem Modell...");

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
        max_tokens: 4000, // Increased for longer, more detailed articles
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
          details: errorText.substring(0, 500)
        }),
        {
          status: openAIResponse.status >= 500 ? 502 : openAIResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await openAIResponse.json();
    console.log("[generate-blog-post] Enhanced OpenAI Response erhalten");

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

    // Enhanced content analysis with AI insights
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 160);
    const hasTitle = content.includes('# ');
    const hasSubheadings = (content.match(/## /g) || []).length;
    const hasH3Headings = (content.match(/### /g) || []).length;
    const hasLists = (content.match(/^[-*+] /gm) || []).length;
    const hasFAQ = content.toLowerCase().includes('faq') || content.toLowerCase().includes('häufige fragen');
    
    // Enhanced quality scoring with latest best practices
    const qualityScore = Math.min(100, Math.max(50, 
      (wordCount >= 800 ? 25 : wordCount / 32) +
      (hasTitle ? 15 : 0) +
      (hasSubheadings >= 3 ? 15 : hasSubheadings * 5) +
      (hasH3Headings >= 2 ? 10 : hasH3Headings * 3) +
      (hasLists >= 2 ? 10 : hasLists * 2) +
      (hasFAQ ? 10 : 0) +
      (content.length > 2000 ? 15 : content.length / 133) +
      15 // Base score for using latest AI model
    ));

    console.log("[generate-blog-post] Enhanced artikel erfolgreich generiert.", {
      contentLength: content.length,
      wordCount,
      readingTime,
      qualityScore,
      hasEnhancedFeatures: {
        hasTitle,
        subheadingCount: hasSubheadings,
        h3Count: hasH3Headings,
        listCount: hasLists,
        hasFAQ
      }
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
          h3Count: hasH3Headings,
          listCount: hasLists,
          hasFAQ,
          model: "gpt-4o",
          enhancedFeatures: true,
          aiCapabilities: "admin-level",
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
