
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

import { CATEGORIES, SEASONS, AUTHORS, TAGS, corsHeaders } from "./constants.ts";
import { generateSlug, getRandom } from "./helpers.ts";
import { generateImage, generateTopicIdea, generateArticle } from "./openai.ts";
import { uploadImageToSupabase, checkBlacklist, isDuplicate, saveBlogPost } from "./supabase-helpers.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

    // 1. Thema + Kontext generieren
    const now = new Date();
    const season = getRandom(SEASONS);
    const category = getRandom(CATEGORIES);
    const author = getRandom(AUTHORS);
    const trend = getRandom(TAGS);

    const contextPrompt = `Kategorie: ${category}, Saison: ${season}, Trend: ${trend}. Schreibe einen Blogartikel, der zum Kontext und aktuellen Zeit passt – inspiriere HobbygärtnerInnen oder Kochbegeisterte.`;

    // 2. Themen-Idee mit OpenAI generieren
    const topicIdea = await generateTopicIdea(contextPrompt);

    // === THEMEN-BLACKLIST PRÜFEN ===
    if (await checkBlacklist(supabase, topicIdea)) {
      return new Response(JSON.stringify({
        status: "blacklisted",
        title: topicIdea,
        message: "Dieses Thema steht auf der Blacklist und wurde übersprungen.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // === DUPLIKATERKENNUNG ===
    const slug = generateSlug(topicIdea);
    if (await isDuplicate(supabase, slug)) {
      return new Response(JSON.stringify({
        status: "duplicate",
        slug,
        title: topicIdea,
        message: "Dieses Thema wurde kürzlich schon veröffentlicht.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 3. Prompt zusammensetzen & Artikel generieren
    const prompt = `Thema: ${topicIdea}. ${contextPrompt} Schreibe einen originellen, inspirierenden SEO-Blogartikel auf Deutsch. Baue Trends & Saisonalität ein.`;
    const articleContent = await generateArticle(prompt);

    // 4. Teaser/Excerpt extrahieren
    let excerptMatch = articleContent.split('\n').find(line => line.trim());
    let excerpt = excerptMatch ? excerptMatch.replace(/^#+\s*/, "").slice(0, 160) : "";

    // 5. SEO-Metadaten generieren
    const seoTitle = topicIdea + " | Mien Tuun";
    const seoDescription = excerpt;
    const seoKeywords = [topicIdea, category, season, trend];

    // 6. KI-generiertes Bild erzeugen & hochladen
    let featured_image = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=600&fit=crop"; // Fallback
    try {
      const imageB64 = await generateImage({ theme: topicIdea, category, season, trend });
      const fileName = `${slug}-${now.getTime()}.png`;
      featured_image = await uploadImageToSupabase({ supabase, imageB64, fileName });
    } catch (imgErr) {
      console.error("Fehler bei der KI-Bildgenerierung:", imgErr);
    }

    // 7. Speichern
    const postData = {
      slug: slug + "-" + now.getTime(),
      title: topicIdea,
      excerpt,
      content: articleContent,
      author,
      published: true,
      featured: false,
      featured_image,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: seoKeywords,
      tags: [trend],
      category,
      published_at: now.toISOString().slice(0,10),
      reading_time: 5,
      difficulty: "",
      season,
      audiences: ["Automatisch"],
      content_types: ["Inspiration"],
    };
    await saveBlogPost(supabase, postData);
    
    return new Response(JSON.stringify({
      status: "success",
      slug,
      title: topicIdea,
      excerpt,
      content: articleContent,
      author,
      featured_image,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("[auto-blog-post] Fehler:", err);
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
