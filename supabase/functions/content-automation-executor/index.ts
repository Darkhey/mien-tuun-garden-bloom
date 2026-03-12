import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import { CATEGORIES, SEASONS, TAGS, MARIANNE_STYLE_PROMPT, corsHeaders } from "../_shared/blog-config.ts";
import { getUnsplashFallback } from "../_shared/unsplash_fallbacks.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("OPENAI_ADMIN_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

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

async function aiGenerate(systemPrompt: string, userPrompt: string, maxTokens = 2500): Promise<string> {
  if (OPENAI_API_KEY) {
    try {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], temperature: 0.75, max_tokens: maxTokens }),
      });
      if (resp.ok) { const d = await resp.json(); return d.choices?.[0]?.message?.content?.trim() || ""; }
    } catch (e) { console.warn("[content-automation] OpenAI failed:", e.message); }
  }
  if (GEMINI_API_KEY) {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }], generationConfig: { temperature: 0.75, maxOutputTokens: maxTokens } }),
    });
    if (resp.ok) { const d = await resp.json(); return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ""; }
  }
  throw new Error("Keine KI-API verfügbar");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { configId, action } = await req.json();
    console.log(`[ContentAutomation] configId: ${configId}, action: ${action}`);

    if (action !== 'execute') {
      return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Load config
    const { data: config, error: cfgErr } = await supabase.from('content_automation_configs').select('*').eq('id', configId).single();
    if (cfgErr || !config) throw new Error(`Config not found: ${configId}`);
    if (!config.is_active) throw new Error(`Config disabled: ${configId}`);

    const configData = config.config as any;
    const categories = (configData.categories || []).map((c: any) => typeof c === 'string' ? c : Object.keys(c)[0]);
    if (categories.length === 0) throw new Error('No categories configured');

    const category = categories[Math.floor(Math.random() * categories.length)];
    const tags = configData.category_tags?.[category] || [];
    const season = getCurrentSeason();

    // Generate real topic
    const topicIdea = await aiGenerate(
      "Du bist Marianne, eine erfahrene norddeutsche Gärtnerin. Erfinde ein spannendes Blogartikel-Thema (max 10 Worte).",
      `Kategorie: ${category}, Saison: ${season}. Erstelle ein einzigartiges Thema für Hobbygärtner.`,
      64
    );
    const title = topicIdea.replace(/[".]/g, "").trim() || "Neuer Gartenartikel";

    // Generate real article
    const articleContent = await aiGenerate(
      "Du bist Marianne, eine erfahrene Gärtnerin aus Norddeutschland.",
      `${MARIANNE_STYLE_PROMPT}\n\nSchreibe einen Blogartikel zum Thema "${title}" in der Kategorie "${category}" passend zur ${season}. 1200-1400 Wörter, Markdown, mit FAQ.`,
      3000
    );

    const wordCount = articleContent.split(/\s+/).length;
    const cleanContent = articleContent.replace(/[#*_\[\]()]/g, '').trim();
    const excerpt = cleanContent.split('\n').find(l => l.trim().length > 50)?.slice(0, 160) || cleanContent.slice(0, 160);
    const slug = generateSlug(title) + '-' + Date.now();
    const qualityScore = Math.min(100, Math.floor(50 + (wordCount >= 800 ? 25 : wordCount / 32) + (articleContent.includes('## ') ? 15 : 0) + (articleContent.includes('Moin') ? 10 : 0)));
    const shouldPublish = configData.approval?.immediate_publishing && qualityScore >= 70;

    // Image - use fallback
    const featuredImage = getUnsplashFallback(category);

    const postData = {
      slug, title, content: articleContent, excerpt, category,
      tags: tags.length ? tags : [season],
      status: shouldPublish ? 'veröffentlicht' : 'entwurf',
      published: shouldPublish,
      featured_image: featuredImage,
      author: "Marianne",
      reading_time: Math.ceil(wordCount / 160),
      seo_title: `${title} | Mien Tuun`,
      seo_description: excerpt,
      seo_keywords: [title.split(' ').slice(0, 3).join(' '), category, season].filter(Boolean),
      content_types: ["blog"],
      audiences: ["Hobbygärtner"],
      season,
      automation_config_id: config.id,
      quality_score: qualityScore,
      engagement_score: 0,
      published_at: new Date().toISOString(),
    };

    const { data: blogPost, error: insertErr } = await supabase.from('blog_posts').insert([postData]).select('id').single();
    if (insertErr) throw new Error(`DB insert failed: ${insertErr.message}`);

    // Log
    await supabase.from('content_automation_logs').insert([{
      config_id: configId, action: 'execute_automation', status: 'success',
      details: { blog_post_id: blogPost.id, title, slug, category, quality_score: qualityScore, wordCount }
    }]);

    return new Response(JSON.stringify({
      success: true, result: { blog_post_id: blogPost.id, title, slug, category, quality_score: qualityScore, status: postData.status }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[ContentAutomation] Error:', error);
    return new Response(JSON.stringify({ error: error.message, success: false }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
