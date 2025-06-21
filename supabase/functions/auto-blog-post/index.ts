
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import { CATEGORIES, SEASONS, AUTHORS, TAGS, corsHeaders } from "./constants.ts";
import { generateSlug, getRandom } from "./helpers.ts";
import { generateImage, generateTopicIdea, generateArticle } from "./openai.ts";
import { uploadImageToSupabase, checkBlacklist, isDuplicate, saveBlogPost, logTopicAttempt } from "./supabase-helpers.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Mehrfachversuch (max 3)
async function getUniqueTopic(supabase, contextPrompt, maxTries = 3) {
  let topicIdea = "";
  let slug = "";
  let title = "";
  let attempt = 1;
  let finalReason = "";

  while (attempt <= maxTries) {
    // 1. Themen-Idee mit OpenAI generieren
    topicIdea = await generateTopicIdea(contextPrompt);
    slug = generateSlug(topicIdea);
    title = topicIdea;

    // 2. Blacklist-Prüfung
    const isBlack = await checkBlacklist(supabase, topicIdea);
    if (isBlack) {
      finalReason = "blacklisted";
      await logTopicAttempt(supabase, { slug, title, reason: "blacklisted", try_count: attempt, context: { contextPrompt } });
      attempt++;
      continue;
    }

    // 3. Dubletten-Prüfung
    const dupl = await isDuplicate(supabase, slug, title);
    if (dupl) {
      finalReason = "duplicate";
      await logTopicAttempt(supabase, { slug, title, reason: "duplicate", try_count: attempt, context: { contextPrompt } });
      attempt++;
      continue;
    }

    // 4. Thema ist verwendbar!
    return { topicIdea, slug, title, attempt, reason: "used" };
  }
  // Kein eindeutiges Thema gefunden → gib das letzte
  await logTopicAttempt(supabase, { slug, title, reason: finalReason, try_count: attempt - 1, context: { contextPrompt } });
  throw new Error(`Konnte kein neues Thema nach ${maxTries} Versuchen generieren (letzte Sperre: ${finalReason})`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

    // 1. Kontext zusammenbauen
    const now = new Date();
    const season = getRandom(SEASONS);
    const category = getRandom(CATEGORIES);
    const author = "Marianne"; // Geändert von getRandom(AUTHORS)
    const trend = getRandom(TAGS);
    const contextPrompt = `Kategorie: ${category} (PFLICHT), Saison: ${season} (PFLICHT), Trend: ${trend} (PFLICHT). Schreibe einen Blogartikel, der zum Kontext und aktuellen Zeit passt – inspiriere HobbygärtnerInnen oder Kochbegeisterte. WICHTIG: Der Artikel MUSS zur angegebenen Kategorie passen und saisonalen Bezug haben.`;

    // 2. Uniques Thema besorgen (max 3 Versuche -> siehe getUniqueTopic)
    const { topicIdea, slug, title, attempt } = await getUniqueTopic(supabase, contextPrompt, 3);

    // 3. Prompt zusammensetzen & Artikel generieren
    const prompt = `Thema: ${topicIdea}. ${contextPrompt} Schreibe einen originellen, inspirierenden SEO-Blogartikel auf Deutsch. Baue Trends & Saisonalität ein. PFLICHT: Der Artikel muss zur Kategorie "${category}" passen und den Trend "${trend}" behandeln.`;
    const articleContent = await generateArticle(prompt);

    // 4. Teaser/Excerpt extrahieren
    const excerptMatch = articleContent.split('\n').find(line => line.trim());
    const excerpt = excerptMatch ? excerptMatch.replace(/^#+\s*/, "").slice(0, 160) : "";

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

    // 7. Artikel-Objekt aufbauen
    const postData = {
      slug: slug + "-" + now.getTime(),
      title: topicIdea,
      excerpt,
      content: articleContent,
      author: "Marianne", // Geändert
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

    // 8. In Blog speichern
    await saveBlogPost(supabase, postData);

    // 9. Thema als "used" in History loggen (inkl. context-Daten, Suffix slug)
    await logTopicAttempt(supabase, {
      slug: slug + "-" + now.getTime(),
      title: topicIdea,
      reason: "used",
      used_in_post: slug + "-" + now.getTime(),
      try_count: attempt,
      context: { contextPrompt }
    });

    return new Response(JSON.stringify({
      status: "success",
      slug,
      title: topicIdea,
      excerpt,
      content: articleContent,
      author: "Marianne", // Geändert
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
