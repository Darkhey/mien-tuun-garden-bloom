
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import { buildMariannePrompt } from "./marianne-style.ts";
import { generateSlug, getRandom } from "./helpers.ts";
import { generateImage, generateArticle } from "./openai.ts";
import { uploadImageToSupabase, saveBlogPost } from "./supabase-helpers.ts";
import { getUnsplashFallback } from "../_shared/unsplash_fallbacks.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

function validateEnv() {
  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!OPENAI_API_KEY && !GEMINI_API_KEY) missing.push("OPENAI_API_KEY oder GEMINI_API_KEY");
  if (missing.length) {
    const msg = `Fehlende Umgebungsvariablen: ${missing.join(", ")}`;
    console.error("[create-strategy-article] " + msg);
    return new Response(
      JSON.stringify({ success: false, error: msg, missingEnv: missing }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  return null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("[create-strategy-article] Function started at", new Date().toISOString());

  try {
    const envErrResponse = validateEnv();
    if (envErrResponse) return envErrResponse;

    const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);
    
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("[create-strategy-article] Request parsing error:", parseError);
      throw new Error("Ungültiger Request Body");
    }

    const { topic, category, season, urgency } = requestBody;
    console.log(`[create-strategy-article] Processing request:`, { topic, category, season, urgency });

    if (!topic || !category) {
      console.error("[create-strategy-article] Missing required fields:", { topic, category });
      throw new Error("Topic und Category sind erforderlich");
    }

    console.log(`[create-strategy-article] Erstelle Artikel für: "${topic}"`);

    const now = new Date();
    const slug = generateSlug(topic) + "-" + now.getTime();
    console.log(`[create-strategy-article] Generated slug: ${slug}`);
    
    // Marianne-Stil Prompt generieren
    console.log("[create-strategy-article] Generating Marianne-style prompt...");
    const prompt = buildMariannePrompt(topic, category, season);
    console.log(`[create-strategy-article] Prompt length: ${prompt.length} characters`);
    
    // Artikel mit KI generieren (OpenAI/Gemini Fallback)
    console.log("[create-strategy-article] Starting article generation...");
    let articleContent;
    let usedProvider = "unknown";
    const articleStartTime = Date.now();
    
    try {
      console.log("[create-strategy-article] Attempting OpenAI generation...");
      articleContent = await generateArticle(prompt);
      usedProvider = "OpenAI";
      console.log("[create-strategy-article] OpenAI generation successful");
    } catch (openaiError) {
      console.error("[create-strategy-article] OpenAI generation failed:", openaiError.message);
      
      // Fallback zu Gemini
      if (GEMINI_API_KEY) {
        console.log("[create-strategy-article] Falling back to Gemini...");
        try {
          const { generateArticleWithGemini } = await import('./gemini.ts');
          articleContent = await generateArticleWithGemini(prompt);
          usedProvider = "Gemini";
          console.log("[create-strategy-article] Gemini generation successful");
        } catch (geminiError) {
          console.error("[create-strategy-article] Gemini generation also failed:", geminiError.message);
          throw new Error(`Beide KI-APIs fehlgeschlagen. OpenAI: ${openaiError.message}, Gemini: ${geminiError.message}`);
        }
      } else {
        throw new Error(`OpenAI API Fehler: ${openaiError.message}`);
      }
    }
    
    const articleDuration = Date.now() - articleStartTime;
    console.log(`[create-strategy-article] Article generation completed in ${articleDuration}ms using ${usedProvider}`);
    
    // Artikel-Validierung
    if (!articleContent || articleContent.trim().length < 500) {
      console.error("[create-strategy-article] Generated article too short:", articleContent?.length || 0);
      throw new Error("Generierter Artikel ist zu kurz oder leer");
    }
    
    const wordCount = articleContent.split(/\s+/).length;
    console.log(`[create-strategy-article] Article statistics: ${wordCount} words, ${articleContent.length} characters`);
    
    // Teaser/Excerpt extrahieren (erste aussagekräftige Zeile nach der Überschrift)
    console.log("[create-strategy-article] Extracting excerpt...");
    const contentLines = articleContent.split('\n').filter(line => line.trim());
    const titleIndex = contentLines.findIndex(line => line.startsWith('# '));
    let excerpt = "";
    
    if (titleIndex >= 0 && titleIndex < contentLines.length - 1) {
      // Suche nach der ersten substantiellen Zeile nach dem Titel
      for (let i = titleIndex + 1; i < contentLines.length; i++) {
        const line = contentLines[i]
          .replace(/^#+\s*/, "")
          .replace(/^\*\*.*?\*\*\s*/, "") // Entferne Bold-Markdown
          .replace("Moin moin ihr Lieben", "")
          .trim();
        
        if (line.length > 50 && !line.startsWith('#')) {
          excerpt = line.slice(0, 160);
          break;
        }
      }
    }
    
    if (!excerpt) {
      excerpt = `${topic} - Praktische Tipps und Erfahrungen von Marianne für euren Garten und die Küche.`;
    }
    console.log(`[create-strategy-article] Extracted excerpt (${excerpt.length} chars): ${excerpt.substring(0, 100)}...`);

    // KI-Bild generieren (mit Fallback)
    console.log("[create-strategy-article] Starting image generation...");
    let featured_image = getUnsplashFallback(category || "");
    const imageStartTime = Date.now();
    
    try {
      const imageB64 = await generateImage({ 
        theme: topic, 
        category, 
        season: season || 'ganzjährig',
        trend: 'aktuell'
      });
      const fileName = `strategy-${slug}.png`;
      featured_image = await uploadImageToSupabase({ supabase, imageB64, fileName });
      const imageDuration = Date.now() - imageStartTime;
      console.log(`[create-strategy-article] Image generated and uploaded in ${imageDuration}ms:`, featured_image);
    } catch (imgErr) {
      const imageDuration = Date.now() - imageStartTime;
      console.warn(`[create-strategy-article] Image generation failed after ${imageDuration}ms, using fallback:`, imgErr.message);
      // Continue with fallback image
    }

    // SEO-Metadaten
    console.log("[create-strategy-article] Generating SEO metadata...");
    const seoTitle = `${topic} | Mariannes Gartentipps`;
    const seoDescription = excerpt || `${topic} - Praktische Tipps und Erfahrungen von Marianne für euren Garten und die Küche.`;
    const seoKeywords = [topic, category, season, "Marianne", "Garten", "Küche"].filter(Boolean);

    // Artikel-Objekt zusammenstellen
    console.log("[create-strategy-article] Assembling blog post data...");
    const postData = {
      slug,
      title: topic,
      excerpt,
      content: articleContent,
      author: "Marianne",
      published: true,
      featured: urgency === 'critical' || urgency === 'high',
      featured_image,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: seoKeywords,
      tags: [category, season].filter(Boolean),
      category,
      published_at: now.toISOString().slice(0,10),
      reading_time: Math.ceil(wordCount / 160), // Realistische Lesezeit
      season: season || null,
      audiences: ["Hobbygärtner", "Kochbegeisterte"],
      content_types: ["Anleitung", "Inspiration"],
      status: "veröffentlicht"
    };

    console.log(`[create-strategy-article] Post data prepared: ${JSON.stringify({
      slug: postData.slug,
      title: postData.title,
      wordCount,
      reading_time: postData.reading_time,
      category: postData.category,
      usedProvider
    })}`);

    // In Datenbank speichern
    console.log("[create-strategy-article] Saving to database...");
    const dbStartTime = Date.now();
    
    try {
      const savedPost = await saveBlogPost(supabase, postData);
      const dbDuration = Date.now() - dbStartTime;
      console.log(`[create-strategy-article] Database save completed in ${dbDuration}ms`);
      
      // Finale Verifikation - Prüfen ob der Artikel wirklich gespeichert wurde
      console.log("[create-strategy-article] Verifying database save...");
      const { data: verification, error: verifyError } = await supabase
        .from('blog_posts')
        .select('id, slug, title, content, word_count:content')
        .eq('slug', slug)
        .single();
        
      if (verifyError || !verification) {
        console.error("[create-strategy-article] Verification failed:", verifyError);
        throw new Error("Artikel wurde nicht korrekt in der Datenbank gespeichert");
      }
      
      const savedWordCount = verification.content ? verification.content.split(/\s+/).length : 0;
      console.log(`[create-strategy-article] Verification successful: Article saved with ${savedWordCount} words`);
      
    } catch (dbError) {
      console.error("[create-strategy-article] Database error:", dbError);
      throw new Error(`Datenbank Fehler: ${dbError.message}`);
    }

    const totalDuration = Date.now() - startTime;
    console.log(`[create-strategy-article] Article creation completed successfully in ${totalDuration}ms`);
    console.log(`[create-strategy-article] Performance breakdown: Article=${articleDuration}ms, Image=${Date.now() - imageStartTime}ms, DB=${Date.now() - dbStartTime}ms`);
    console.log(`[create-strategy-article] Final result: ${slug} (${wordCount} words, ${usedProvider})`);

    return new Response(JSON.stringify({
      success: true,
      slug,
      title: topic,
      excerpt,
      featured_image,
      message: "Artikel wurde erfolgreich erstellt und veröffentlicht",
      metadata: {
        wordCount,
        readingTime: Math.ceil(wordCount / 160),
        usedProvider,
        totalDuration,
        articleGenerationTime: articleDuration
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (err) {
    const totalDuration = Date.now() - startTime;
    console.error(`[create-strategy-article] Error after ${totalDuration}ms:`, err);
    
    const errorMessage = err?.message || String(err) || "Unbekannter Fehler";
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false,
      timestamp: new Date().toISOString(),
      duration: totalDuration
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
