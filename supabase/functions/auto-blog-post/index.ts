
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import { CATEGORIES, SEASONS, AUTHORS, TAGS, corsHeaders } from "./constants.ts";
import { generateSlug, getRandom } from "./helpers.ts";
import { generateImage, generateTopicIdea, generateArticle } from "./openai.ts";
import { uploadImageToSupabase, checkBlacklist, isDuplicate, saveBlogPost, logTopicAttempt, logAutomationEvent } from "./supabase-helpers.ts";
import { getUnsplashFallback } from "../_shared/unsplash_fallbacks.ts";

const UNSPLASH_ACCESS = Deno.env.get("UNSPLASH_ACCESS") || Deno.env.get("UNSPLASH_ACCESS_KEY");

async function searchUnsplash(query: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS) return null;
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`;
    const resp = await fetch(url, {
      headers: { "Authorization": `Client-ID ${UNSPLASH_ACCESS}`, "Accept-Version": "v1" }
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const photo = data.results?.[Math.floor(Math.random() * Math.min(3, data.results?.length || 1))];
    if (!photo) return null;
    const credit = photo.user?.name || "Unsplash";
    const imgUrl = `${photo.urls?.regular || photo.urls?.small}`;
    return `![${photo.alt_description || query}](${imgUrl})\n*Foto: ${credit} / Unsplash*`;
  } catch {
    return null;
  }
}

async function replaceImagePlaceholders(content: string): Promise<string> {
  const placeholderRegex = /\[BILD:\s*(.+?)\]/g;
  const matches = [...content.matchAll(placeholderRegex)];
  if (matches.length === 0) return content;

  // Search all in parallel
  const results = await Promise.all(
    matches.map(m => searchUnsplash(m[1].trim()))
  );

  let result = content;
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const replacement = results[i] || "";
    result = result.slice(0, match.index!) + replacement + result.slice(match.index! + match[0].length);
  }
  return result;
}

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

    // 3b. Titel aus Content extrahieren falls topicIdea leer/generisch ist
    let finalTitle = topicIdea;
    // Always try to extract H1 from content as it's more reliable than topic idea
    const h1Match = articleContent.match(/^#\s+(.+)$/m);
    if (!finalTitle || finalTitle === "Neuer Blogartikel" || finalTitle.length < 15) {
      if (h1Match) {
        finalTitle = h1Match[1].trim();
      } else {
        const firstLine = articleContent.split('\n').find(l => l.trim().length > 10);
        if (firstLine) finalTitle = firstLine.replace(/^#+\s*/, '').replace(/\*+/g, '').trim().slice(0, 80);
      }
    }

    // 4. Teaser/Excerpt extrahieren
    const excerptMatch = articleContent.split('\n').find(line => line.trim() && !line.startsWith('#'));
    const excerpt = excerptMatch ? excerptMatch.replace(/^#+\s*/, "").replace(/\*+/g, '').slice(0, 160) : "";

    // 5. SEO-Metadaten generieren
    const seoTitle = finalTitle + " | Mien Tuun";
    const seoDescription = excerpt;
    const seoKeywords = [finalTitle, category, season, trend];

    // 6. KI-generiertes Bild erzeugen & hochladen
    let featured_image = getUnsplashFallback(category || "");
    try {
      const imageB64 = await generateImage({ theme: topicIdea, category, season, trend });
      const fileName = `${slug}-${now.getTime()}.png`;
      featured_image = await uploadImageToSupabase({ supabase, imageB64, fileName });
    } catch (imgErr) {
      console.error("Fehler bei der KI-Bildgenerierung:", imgErr);
    }

// 7. Metriken berechnen und Pipeline-Config laden
const wordCount = articleContent.split(/\s+/).length;
const readingTime = Math.ceil(wordCount / 160);
const hasTitle = articleContent.includes('# ');
const hasSubheadings = (articleContent.match(/## /g) || []).length;
const hasH3Headings = (articleContent.match(/### /g) || []).length;
const hasLists = (articleContent.match(/^[-*+] /gm) || []).length;
const hasFAQ = articleContent.toLowerCase().includes('faq') || articleContent.toLowerCase().includes('häufige fragen');
const qualityScore = Math.min(100, Math.max(50, 
  (wordCount >= 800 ? 25 : wordCount / 32) +
  (hasTitle ? 15 : 0) +
  (hasSubheadings >= 3 ? 15 : hasSubheadings * 5) +
  (hasH3Headings >= 2 ? 10 : hasH3Headings * 3) +
  (hasLists >= 2 ? 10 : hasLists * 2) +
  (hasFAQ ? 10 : 0) +
  (articleContent.length > 2000 ? 15 : articleContent.length / 133) +
  10
));

const { data: pipelineCfg } = await supabase
  .from('pipeline_config')
  .select('quality_threshold,auto_publish')
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();

const threshold = pipelineCfg?.quality_threshold ?? 60;
const autoPublish = pipelineCfg?.auto_publish ?? true;
const willPublish = autoPublish && Math.round(qualityScore) >= threshold;

// 8. Artikel-Objekt aufbauen
const finalSlug = generateSlug(finalTitle) || slug;
const uniqueSlug = `${finalSlug}-${now.getTime()}`;
const postData = {
  slug: uniqueSlug,
  title: finalTitle,
  excerpt,
  content: articleContent,
  author: "Marianne",
  published: willPublish,
  featured: false,
  featured_image,
  seo_title: seoTitle,
  seo_description: seoDescription,
  seo_keywords: seoKeywords,
  tags: [trend],
  category,
  published_at: now.toISOString().slice(0,10),
  reading_time: readingTime,
  season: season.toLowerCase(),
  audiences: ["Automatisch"],
  content_types: ["Inspiration"],
  status: willPublish ? "veröffentlicht" : "entwurf",
  quality_score: Math.round(qualityScore)
};

    // 8. In Blog speichern
    await saveBlogPost(supabase, postData);

    // 9. Thema als "used" in History loggen (inkl. context-Daten, Suffix slug)
    await logTopicAttempt(supabase, {
      slug: uniqueSlug,
      title: finalTitle,
      reason: "used",
      used_in_post: uniqueSlug,
      try_count: attempt,
      context: { contextPrompt }
    });

    // 10. Erfolg ins Automations-Log schreiben
    await logAutomationEvent(supabase, 'success', {
      action: 'auto-blog-post',
      slug: uniqueSlug,
      title: finalTitle,
      category,
      season,
      quality_score: Math.round(qualityScore),
      threshold,
      auto_publish: autoPublish,
      published: willPublish
    });

    return new Response(JSON.stringify({
      status: "success",
      slug: uniqueSlug,
      title: finalTitle,
      excerpt,
      content: articleContent,
      author: "Marianne",
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
