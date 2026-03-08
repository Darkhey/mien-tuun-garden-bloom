import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import { CATEGORIES, SEASONS, TAGS, MARIANNE_STYLE_PROMPT, corsHeaders } from "../_shared/blog-config.ts";
import { getUnsplashFallback } from "../_shared/unsplash_fallbacks.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("OPENAI_ADMIN_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// --- Helpers ---

function generateSlug(title: string): string {
  return title.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

function getCurrentSeason(): string {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return "Frühling";
  if (m >= 6 && m <= 8) return "Sommer";
  if (m >= 9 && m <= 11) return "Herbst";
  return "Winter";
}

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- AI Calls ---

async function callOpenAI(messages: any[], maxTokens = 2500, temperature = 0.75): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error("No OpenAI key");
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages, temperature, max_tokens: maxTokens }),
  });
  if (!resp.ok) { const t = await resp.text(); throw new Error(`OpenAI ${resp.status}: ${t}`); }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callGemini(prompt: string, maxTokens = 2500): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("No Gemini key");
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.75, maxOutputTokens: maxTokens } }),
  });
  if (!resp.ok) { const t = await resp.text(); throw new Error(`Gemini ${resp.status}: ${t}`); }
  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

async function aiGenerate(systemPrompt: string, userPrompt: string, maxTokens = 2500): Promise<string> {
  try {
    return await callOpenAI([{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], maxTokens);
  } catch (e) {
    console.warn("[pipeline] OpenAI failed, trying Gemini:", e.message);
    return await callGemini(`${systemPrompt}\n\n${userPrompt}`, maxTokens);
  }
}

async function generateImage(theme: string, category: string, season: string): Promise<string | null> {
  if (!OPENAI_API_KEY) return null;
  try {
    const resp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-image-1", prompt: `Hyperrealistisches, stimmungsvolles Garten- oder Küchenbild: "${theme}" (${category}, ${season}). Natürliches Licht, hochwertiger Fotografie-Stil. Ohne Text.`,
        n: 1, size: "1024x1024", response_format: "b64_json", quality: "high", output_format: "png",
      }),
    });
    if (!resp.ok) { await resp.text(); return null; }
    const data = await resp.json();
    return data.data?.[0]?.b64_json || null;
  } catch (e) { console.warn("[pipeline] Image generation failed:", e.message); return null; }
}

// --- Trend Fetching ---

async function fetchTrends(): Promise<string[]> {
  try {
    const result = await aiGenerate(
      "Du lieferst nur ein JSON-Array von Strings, keine Erklärungen.",
      "Gib mir 5 aktuelle Trend-Keywords aus den Bereichen Garten, Nachhaltigkeit und saisonale Küche auf Deutsch. Nur das JSON-Array.",
      200
    );
    const parsed = JSON.parse(result);
    if (Array.isArray(parsed)) return parsed.map((t: any) => typeof t === 'string' ? t : t.keyword || '').filter(Boolean);
  } catch { /* ignore */ }
  return TAGS.slice(0, 5);
}

// --- Category Rotation ---

async function pickCategory(supabase: any): Promise<string> {
  const { data: recent } = await supabase
    .from('blog_posts')
    .select('category')
    .order('published_at', { ascending: false })
    .limit(7);

  const recentCats = (recent || []).map((p: any) => p.category);
  const unused = CATEGORIES.filter(c => !recentCats.includes(c) && c !== 'Allgemein');
  return unused.length > 0 ? getRandom(unused) : getRandom(CATEGORIES.filter(c => c !== 'Allgemein'));
}

// --- Duplicate / Blacklist ---

async function isDuplicate(supabase: any, slug: string, title: string): Promise<boolean> {
  const baseSlug = slug.replace(/-\d+$/, "");
  const { data: posts } = await supabase.from("blog_posts").select("slug, title");
  const { data: history } = await supabase.from("blog_topic_history").select("slug, title");
  const all = [...(posts || []), ...(history || [])];
  return all.some((t: any) => {
    const s = (t.slug || "").replace(/-\d+$/, "");
    return s === baseSlug || (t.title || "").trim().toLowerCase() === title.trim().toLowerCase();
  });
}

async function isBlacklisted(supabase: any, topic: string): Promise<boolean> {
  const { data } = await supabase.from("blog_topic_blacklist").select("topic");
  return (data || []).some((item: any) => topic.toLowerCase().includes(item.topic.toLowerCase()));
}

// --- Quality Score ---

function calculateQualityScore(content: string): number {
  const wordCount = content.split(/\s+/).length;
  const hasTitle = content.includes('# ');
  const h2Count = (content.match(/## /g) || []).length;
  const h3Count = (content.match(/### /g) || []).length;
  const listCount = (content.match(/^[-*+] /gm) || []).length;
  const hasFAQ = /faq|häufige fragen/i.test(content);
  const hasMoin = content.includes('Moin moin');

  return Math.min(100, Math.max(40,
    (wordCount >= 800 ? 25 : wordCount / 32) +
    (hasTitle ? 10 : 0) +
    (h2Count >= 3 ? 15 : h2Count * 5) +
    (h3Count >= 2 ? 10 : h3Count * 3) +
    (listCount >= 2 ? 10 : listCount * 2) +
    (hasFAQ ? 10 : 0) +
    (hasMoin ? 10 : 0) +
    (wordCount > 1000 ? 10 : wordCount / 100)
  ));
}

// --- SEO ---

function generateSEOData(title: string, content: string, category: string, season: string) {
  const cleanContent = content.replace(/[#*_\[\]()]/g, '').trim();
  const excerpt = cleanContent.split('\n').find(l => l.trim().length > 50)?.slice(0, 160) || cleanContent.slice(0, 160);
  const seoTitle = `${title} | Mien Tuun`;
  const seoDescription = excerpt.length > 155 ? excerpt.slice(0, 155) + '…' : excerpt;
  const keywords = [title.split(' ').slice(0, 3).join(' '), category, season, 'Garten', 'Tipps'].filter(Boolean);
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": seoDescription,
    "author": { "@type": "Person", "name": "Marianne" },
    "publisher": { "@type": "Organization", "name": "Mien Tuun" },
    "datePublished": new Date().toISOString(),
    "articleSection": category,
    "keywords": keywords.join(', ')
  };

  return { excerpt, seoTitle, seoDescription, seoKeywords: keywords, structuredData, tags: [season, category.split(' ')[0]].filter(Boolean) };
}

// --- Main Pipeline ---

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();
  console.log("[daily-content-pipeline] Started at", new Date().toISOString());

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // 1. Load pipeline config
    const { data: pipelineCfg } = await supabase
      .from('pipeline_config')
      .select('quality_threshold, auto_publish')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const qualityThreshold = pipelineCfg?.quality_threshold ?? 80;
    const autoPublish = pipelineCfg?.auto_publish ?? false;

    // 2. Fetch trends + pick category
    const [trends, category] = await Promise.all([fetchTrends(), pickCategory(supabase)]);
    const season = getCurrentSeason();
    const trend = getRandom(trends);
    console.log(`[pipeline] Category: ${category}, Season: ${season}, Trend: ${trend}`);

    // 3. Generate unique topic (max 3 tries)
    let topicIdea = "";
    let slug = "";
    for (let attempt = 1; attempt <= 3; attempt++) {
      topicIdea = await aiGenerate(
        "Du bist Marianne, eine erfahrene norddeutsche Garten- und Küchenbloggerin. Erfinde ein frisches Blogartikel-Thema (max 10 Worte).",
        `Kategorie: ${category}, Saison: ${season}, Trend: ${trend}. Erstelle ein einzigartiges, spannendes Thema für Hobbygärtner oder Kochbegeisterte.`,
        64
      );
      topicIdea = topicIdea.replace(/[".]/g, "").trim() || "Neuer Gartenartikel";
      slug = generateSlug(topicIdea);

      if (await isBlacklisted(supabase, topicIdea)) { console.log(`[pipeline] Topic blacklisted: ${topicIdea}`); continue; }
      if (await isDuplicate(supabase, slug, topicIdea)) { console.log(`[pipeline] Topic duplicate: ${topicIdea}`); continue; }
      break;
    }

    console.log(`[pipeline] Topic: "${topicIdea}"`);

    // 4. Generate full article in Marianne style
    const articlePrompt = `${MARIANNE_STYLE_PROMPT}

AUFGABE: Schreibe einen inspirierenden Blogartikel zum Thema "${topicIdea}" in der Kategorie "${category}" passend zur ${season}.

AKTUELLER TREND: "${trend}" - baue diesen natürlich ein.

Der Artikel soll:
- Mariannes persönlichen Schreibstil verwenden (Moin moin, persönliche Anekdoten)
- Praktische, umsetzbare Ratschläge enthalten
- SEO-optimiert sein mit natürlichen Keywords
- 1200-1400 Wörter haben (~7 Min Lesezeit)
- Markdown mit H1 Titel, H2/H3 Abschnitten, Listen
- Ein FAQ-Abschnitt mit 3-4 häufigen Fragen am Ende

Schreibe den kompletten Artikel als Markdown.`;

    const articleContent = await aiGenerate(
      "Du bist Marianne, eine erfahrene Gärtnerin und Köchin aus Norddeutschland. Schreibe authentische, herzliche Blogartikel auf Deutsch.",
      articlePrompt,
      3000
    );

    if (!articleContent || articleContent.length < 500) {
      throw new Error("Generierter Artikel zu kurz");
    }

    const wordCount = articleContent.split(/\s+/).length;
    console.log(`[pipeline] Article: ${wordCount} words`);

    // 5. Quality score
    const qualityScore = Math.round(calculateQualityScore(articleContent));
    const willPublish = autoPublish && qualityScore >= qualityThreshold;
    console.log(`[pipeline] Quality: ${qualityScore}, Threshold: ${qualityThreshold}, Publish: ${willPublish}`);

    // 6. Generate image + SEO in parallel
    const now = new Date();
    const uniqueSlug = `${slug}-${now.getTime()}`;
    const seoData = generateSEOData(topicIdea, articleContent, category, season);

    let featuredImage = getUnsplashFallback(category);
    const imageB64 = await generateImage(topicIdea, category, season);
    if (imageB64) {
      try {
        const binary = Uint8Array.from(atob(imageB64), c => c.charCodeAt(0));
        const fileName = `pipeline-${uniqueSlug}.png`;
        const { error: uploadErr } = await supabase.storage.from("blog-images").upload(fileName, binary, { contentType: "image/png", upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(fileName);
          featuredImage = urlData.publicUrl;
        }
      } catch (e) { console.warn("[pipeline] Image upload failed:", e.message); }
    }

    // 7. Save to database
    const postData = {
      slug: uniqueSlug,
      title: topicIdea,
      excerpt: seoData.excerpt,
      content: articleContent,
      author: "Marianne",
      published: willPublish,
      featured: false,
      featured_image: featuredImage,
      seo_title: seoData.seoTitle,
      seo_description: seoData.seoDescription,
      seo_keywords: seoData.seoKeywords,
      structured_data: JSON.stringify(seoData.structuredData),
      tags: seoData.tags,
      category,
      published_at: now.toISOString().slice(0, 10),
      reading_time: Math.ceil(wordCount / 160),
      season,
      audiences: ["Hobbygärtner"],
      content_types: ["Inspiration"],
      status: willPublish ? "veröffentlicht" : "entwurf",
      quality_score: qualityScore,
    };

    const { error: insertErr } = await supabase.from("blog_posts").insert([postData]);
    if (insertErr) throw new Error(`DB insert failed: ${insertErr.message}`);

    // 8. Log to topic history + automation logs
    await Promise.all([
      supabase.from("blog_topic_history").insert([{
        slug: uniqueSlug, title: topicIdea, reason: "used", used_in_post: uniqueSlug,
        try_count: 1, context: JSON.stringify({ category, season, trend, qualityScore })
      }]),
      supabase.from("content_automation_logs").insert([{
        action: "daily-content-pipeline", status: "success",
        details: { slug: uniqueSlug, title: topicIdea, category, season, trend, qualityScore, wordCount, willPublish, duration: Date.now() - startTime }
      }])
    ]);

    console.log(`[pipeline] ✅ Done in ${Date.now() - startTime}ms: "${topicIdea}" (${qualityScore}pts, ${willPublish ? 'published' : 'draft'})`);

    return new Response(JSON.stringify({
      success: true, slug: uniqueSlug, title: topicIdea, category, season, trend,
      qualityScore, published: willPublish, wordCount, duration: Date.now() - startTime
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("[pipeline] ❌ Error:", err);

    // Log error
    try {
      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
      await supabase.from("content_automation_logs").insert([{
        action: "daily-content-pipeline", status: "error",
        details: { error: err.message, duration: Date.now() - startTime }
      }]);
    } catch { /* ignore logging errors */ }

    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
