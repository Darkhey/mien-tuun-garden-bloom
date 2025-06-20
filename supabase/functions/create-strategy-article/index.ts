
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import { buildMariannePrompt } from "../auto-blog-post/marianne-style.ts";
import { generateSlug, getRandom } from "../auto-blog-post/helpers.ts";
import { generateImage, generateArticle } from "../auto-blog-post/openai.ts";
import { uploadImageToSupabase, saveBlogPost } from "../auto-blog-post/supabase-helpers.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);
    const { topic, category, season, urgency } = await req.json();

    if (!topic || !category) {
      throw new Error("Topic und Category sind erforderlich");
    }

    console.log(`[create-strategy-article] Erstelle Artikel für: ${topic}`);

    const now = new Date();
    const slug = generateSlug(topic) + "-" + now.getTime();
    
    // Marianne-Stil Prompt generieren
    const prompt = buildMariannePrompt(topic, category, season);
    
    // Artikel mit OpenAI generieren
    const articleContent = await generateArticle(prompt);
    
    // Teaser/Excerpt extrahieren (erste Zeile nach der Überschrift)
    const contentLines = articleContent.split('\n').filter(line => line.trim());
    const titleIndex = contentLines.findIndex(line => line.startsWith('# '));
    let excerpt = "";
    
    if (titleIndex >= 0 && titleIndex < contentLines.length - 1) {
      excerpt = contentLines[titleIndex + 1]
        .replace(/^#+\s*/, "")
        .replace("Moin moin ihr Lieben", "")
        .trim()
        .slice(0, 160);
    }

    // KI-Bild generieren
    let featured_image = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=600&fit=crop";
    try {
      const imageB64 = await generateImage({ 
        theme: topic, 
        category, 
        season: season || 'ganzjährig',
        trend: 'aktuell'
      });
      const fileName = `strategy-${slug}.png`;
      featured_image = await uploadImageToSupabase({ supabase, imageB64, fileName });
    } catch (imgErr) {
      console.error("Bildgenerierung fehlgeschlagen:", imgErr);
    }

    // SEO-Metadaten
    const seoTitle = `${topic} | Mariannes Gartentipps`;
    const seoDescription = excerpt || `${topic} - Praktische Tipps und Erfahrungen von Marianne für euren Garten und die Küche.`;
    const seoKeywords = [topic, category, season, "Marianne", "Garten", "Küche"].filter(Boolean);

    // Artikel-Objekt
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
      reading_time: 7,
      season: season || null,
      audiences: ["Hobbygärtner", "Kochbegeisterte"],
      content_types: ["Anleitung", "Inspiration"],
      status: "veröffentlicht"
    };

    // In Datenbank speichern
    await saveBlogPost(supabase, postData);

    console.log(`[create-strategy-article] Artikel erfolgreich erstellt: ${slug}`);

    return new Response(JSON.stringify({
      success: true,
      slug,
      title: topic,
      excerpt,
      featured_image,
      message: "Artikel wurde erfolgreich erstellt und veröffentlicht"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("[create-strategy-article] Fehler:", err);
    return new Response(JSON.stringify({ 
      error: String(err?.message ?? err),
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
