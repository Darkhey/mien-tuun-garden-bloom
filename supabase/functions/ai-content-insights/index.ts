import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_ADMIN_KEY = Deno.env.get("OPENAI_ADMIN_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const heuristicCache = new Map<string, any>();

async function generateWithGemini(prompt: string, temperature = 0.4, maxTokens = 2000) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API Key nicht konfiguriert");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Fehler (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_ADMIN_KEY) {
      throw new Error("OpenAI Admin-Schlüssel nicht konfiguriert");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, data } = await req.json();

    console.log(`[AI Content Insights] Processing action: ${action}`);

    switch (action) {
      case 'analyze_performance':
        return await analyzeContentPerformance(data, supabaseClient);
      case 'generate_insights':
        return await generateContentInsights(supabaseClient);
      case 'predict_trends':
        return await predictContentTrends(supabaseClient);
      case 'optimize_content':
        return await optimizeContent(data, supabaseClient);
      case 'integrate_internal_links':
        return await integrateInternalLinks(data);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('[AI Content Insights] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});


async function analyzeContentPerformance(contentData: any, supabase: any) {
  const systemMsg =
    "Du bist ein KI-Experte für Content-Performance-Analyse. Analysiere den gegebenen Content und gib eine detaillierte Bewertung als JSON zurück.";
  const userMsg = `Analysiere diesen Content für Performance-Vorhersage:\n\nTitel: ${contentData.title}\nKategorie: ${contentData.category}\nTags: ${contentData.tags?.join(', ') || 'Keine'}\nContent-Länge: ${contentData.content?.length || 0} Zeichen\nSEO-Keywords: ${contentData.seoKeywords?.join(', ') || 'Keine'}\n\nGib eine JSON-Antwort mit:\n- performanceScore (0-100)\n- seoOptimization (0-100)\n- engagementPrediction (0-100)\n- recommendations (Array von Strings)\n- estimatedViews (Zahl)\n- competitiveness (low/medium/high)`;

  let analysisText: string | null = null;

  if (OPENAI_ADMIN_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_ADMIN_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemMsg },
            { role: "user", content: userMsg },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        analysisText = data.choices?.[0]?.message?.content ?? null;
      }
    } catch (err) {
      console.error('[AI Content Insights] OpenAI performance analysis failed:', err);
    }
  }

  if (!analysisText && GEMINI_API_KEY) {
    try {
      analysisText = await generateWithGemini(`${systemMsg}\n\n${userMsg}`, 0.3, 1500);
    } catch (err) {
      console.error('[AI Content Insights] Gemini performance fallback failed:', err);
    }
  }

  if (!analysisText) {
    throw new Error('Keine KI-Antwort erhalten');
  }

  let analysis;
  try {
    analysis = JSON.parse(analysisText);
  } catch {
    analysis = { recommendations: [analysisText] };
  }

  return new Response(
    JSON.stringify({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
}

async function generateContentInsights(supabase: any) {
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('title, category, tags, engagement_score, quality_score, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  const systemMsg =
    'Du bist ein Content-Strategie-Experte. Analysiere die gegebenen Blogpost-Daten und identifiziere Trends, L\u00fccken und Opportunities.';
  const userMsg = `Analysiere diese Blogpost-Daten und gib Insights als JSON zur\u00fcck:\n\n${JSON.stringify(posts, null, 2)}\n\nGib eine JSON-Antwort mit:\n- topPerformingCategories (Array)\n- contentGaps (Array von Opportunities)\n- seasonalTrends (Array)\n- recommendedTopics (Array mit topic, reason, priority)\n- performanceInsights (Array von Beobachtungen)`;

  let insightsText: string | null = null;

  if (OPENAI_ADMIN_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_ADMIN_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemMsg },
            { role: 'user', content: userMsg },
          ],
          temperature: 0.4,
          max_tokens: 2000,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        insightsText = data.choices?.[0]?.message?.content ?? null;
      }
    } catch (err) {
      console.error('[AI Content Insights] OpenAI insights failed:', err);
    }
  }

  if (!insightsText && GEMINI_API_KEY) {
    try {
      insightsText = await generateWithGemini(`${systemMsg}\n\n${userMsg}`, 0.4, 2000);
    } catch (err) {
      console.error('[AI Content Insights] Gemini insights fallback failed:', err);
    }
  }

  if (!insightsText) {
    throw new Error('Keine KI-Antwort erhalten');
  }

  let insights;
  try {
    insights = JSON.parse(insightsText);
  } catch {
    throw new Error('Invalid JSON response from AI');
  }

  return new Response(
    JSON.stringify({
      success: true,
      insights,
      dataPoints: posts.length,
      generatedAt: new Date().toISOString(),
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
}

async function predictContentTrends(supabase: any) {
  const systemMsg = 'Du bist ein Trend-Analyst f\u00fcr Garten- und K\u00fcchen-Content. Basierend auf aktuellen Trends und saisonalen Faktoren, vorhersage relevante Content-Trends f\u00fcr die n\u00e4chsten Monate.';
  const userMsg = `Analysiere und vorhersage Content-Trends f\u00fcr deutsche Garten- und K\u00fcchen-Blogs.\n\nBer\u00fccksichtige:\n- Aktuelle Jahreszeit: ${new Date().toLocaleDateString('de-DE', { month: 'long' })}\n- Nachhaltigkeitstrends\n- Urbane Gartentrends\n- Gesunde Ern\u00e4hrung\n- Selbstversorgung\n\nGib eine JSON-Antwort mit:\n- emergingTrends (Array mit trend, description, potential 0-100)\n- seasonalOpportunities (Array)\n- keywordOpportunities (Array)\n- contentTypes (Array der trending Content-Formate)\n- timeframe (wann diese Trends relevant werden)`;

  let trendsText: string | null = null;

  if (OPENAI_ADMIN_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_ADMIN_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemMsg },
            { role: 'user', content: userMsg },
          ],
          temperature: 0.6,
          max_tokens: 2000,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        trendsText = data.choices?.[0]?.message?.content ?? null;
      }
    } catch (err) {
      console.error('[AI Content Insights] OpenAI trends failed:', err);
    }
  }

  if (!trendsText && GEMINI_API_KEY) {
    try {
      trendsText = await generateWithGemini(`${systemMsg}\n\n${userMsg}`, 0.6, 2000);
    } catch (err) {
      console.error('[AI Content Insights] Gemini trends fallback failed:', err);
    }
  }

  if (!trendsText) {
    throw new Error('Keine KI-Antwort erhalten');
  }

  let trends;
  try {
    trends = JSON.parse(trendsText);
  } catch {
    throw new Error('Invalid JSON response from AI');
  }

  return new Response(
    JSON.stringify({
      success: true,
      trends,
      predictedFor: new Date().toISOString(),
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
}
async function optimizeContent(contentData: any, supabase: any) {
  if (!contentData) {
    throw new Error('contentData is required');
  }
  if (!contentData.title && !contentData.content) {
    throw new Error('Either title or content must be provided');
  }

  const buildHeuristic = (data: any) => {
    const cacheKey = `${data.title ?? ''}|${data.content ?? ''}`;
    if (heuristicCache.has(cacheKey)) {
      return heuristicCache.get(cacheKey);
    }

    const clean = (data.content || '').replace(/<[^>]*>/g, '');
    const words = clean.match(/[\p{L}\d]{4,}/giu) || [];

    const freq: Record<string, number> = {};
    for (const w of words) {
      const lower = w.toLowerCase();
      freq[lower] = (freq[lower] || 0) + 1;
    }

    const suggestedKeywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k);

    const optimizedTitle = (data.title || '')
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;!?])/g, '$1');

    const truncated = clean.slice(0, 150);
    const lastSpace = truncated.lastIndexOf(' ');
    const metaDescription = (lastSpace > -1 ? truncated.slice(0, lastSpace) : truncated).trim();

    const totalWordLength = words.reduce((sum, w) => sum + w.length, 0);
    const avgWordLength = words.length ? totalWordLength / words.length : 0;
    const sentences = clean.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgSentenceLength = sentences.length ? words.length / sentences.length : words.length;
    const complexWords = words.filter((w) => w.length > 6).length;
    const complexRatio = words.length ? complexWords / words.length : 0;
    const readabilityRaw = 100 - avgWordLength * 5 - avgSentenceLength - complexRatio * 20;
    const readabilityScore = Math.round(Math.max(0, Math.min(100, readabilityRaw)));

    const result = {
      optimizedTitle,
      suggestedKeywords,
      contentImprovements: [
        !/<h2|##/i.test(data.content || '') && 'Füge Zwischenüberschriften hinzu',
        avgSentenceLength > 20 && 'Nutze kürzere Sätze',
        !/<img/i.test(data.content || '') && 'Verwende aussagekräftige Bilder'
      ].filter(Boolean),
      metaDescription,
      structureRecommendations: [
        !/<h\d/i.test(data.content || '') && 'Verwende H2/H3 Überschriften',
        !/(<ul|\n- )/i.test(data.content || '') && 'Setze Aufzählungen für wichtige Punkte ein'
      ].filter(Boolean),
      readabilityScore,
      seoScore: 50 + Math.min(50, suggestedKeywords.length * 5)
    };
    heuristicCache.set(cacheKey, result);
    return result;
  };

  if (!OPENAI_ADMIN_KEY) {
    console.warn('[AI Content Insights] OPENAI key missing, using heuristic');
    const optimization = buildHeuristic(contentData);
    return new Response(
      JSON.stringify({
        success: true,
        optimization,
        originalTitle: contentData.title,
        optimizedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_ADMIN_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein SEO- und Content-Optimierungs-Experte. Gib konkrete Optimierungsvorschläge für den gegebenen Content.'
          },
          {
            role: 'user',
            content: `Optimiere diesen Content:

Titel: ${contentData.title}
Content: ${contentData.content?.substring(0, 1500)}...
Kategorie: ${contentData.category}
Aktuelle SEO-Keywords: ${contentData.seoKeywords?.join(', ') || 'Keine'}

Gib eine JSON-Antwort mit:
- optimizedTitle (verbesserter Titel)
- suggestedKeywords (Array von SEO-Keywords)
- contentImprovements (Array von konkreten Verbesserungen)
- metaDescription (optimiert für SEO)
- structureRecommendations (Array)
- readabilityScore (0-100)
- seoScore (0-100)`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    let optimization;
    let usedOpenAI = true;
    try {
      optimization = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('[AI Content Insights] Failed to parse OpenAI response:', parseError);
      optimization = buildHeuristic(contentData);
      usedOpenAI = false;
    }
    console.log(`[AI Content Insights] Optimization generated via ${usedOpenAI ? 'OpenAI' : 'heuristic'} path`);

    return new Response(
      JSON.stringify({
        success: true,
        optimization,
        originalTitle: contentData.title,
        optimizedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[AI Content Insights] Optimization via OpenAI failed:', error);
    const optimization = buildHeuristic(contentData);
    return new Response(
      JSON.stringify({
        success: true,
        optimization,
        originalTitle: contentData.title,
        optimizedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function integrateInternalLinks(requestData: any) {
  if (!OPENAI_ADMIN_KEY) {
    throw new Error("OpenAI Admin-Schlüssel nicht konfiguriert für Link-Integration");
  }

  const { content, suggestedLinks, instructions } = requestData;
  
  if (!content || !suggestedLinks || suggestedLinks.length === 0) {
    throw new Error("Content und Link-Vorschläge sind erforderlich");
  }

  console.log(`[AI Content Insights] Integrating ${suggestedLinks.length} internal links`);

  try {
    const linksDescription = suggestedLinks.map((link: any, idx: number) => 
      `${idx + 1}. Titel: "${link.title}"
         Slug: /blog/${link.slug}
         Kategorie: ${link.category}
         Vorgeschlagener Anchor: "${link.anchorText}"
         Kontext: ${link.context}`
    ).join('\n\n');

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_ADMIN_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Du bist ein SEO-Experte für interne Verlinkung. Deine Aufgabe ist es, gegebene interne Links natürlich und organisch in den Content zu integrieren.

WICHTIGE REGELN:
1. Verwende maximal 3 Links aus den Vorschlägen
2. Links müssen thematisch relevant und kontextuell passend sein
3. Anchor-Texte sollen natürlich klingen und zum Lesefluss passen
4. Format: [Anchor Text](/blog/slug)
5. Schreibe Sätze um wenn nötig, um Links organisch einzubauen
6. Links sollen den Lesern echten Mehrwert bieten
7. Vermeide zu viele Links in einem Absatz
8. Der umgeschriebene Text soll besser lesbar sein als das Original`
          },
          {
            role: "user",
            content: `Integriere interne Links in diesen Content:

ORIGINAL CONTENT:
${content}

VERFÜGBARE LINK-VORSCHLÄGE:
${linksDescription}

SPEZIELLE ANWEISUNGEN:
${instructions}

Schreibe den gesamten Content neu und baue dabei organisch bis zu 3 der relevantesten Links ein. Achte darauf, dass der Text flüssig lesbar bleibt und die Links echten Mehrwert bieten.`
          }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error("Keine gültige Antwort von OpenAI erhalten");
    }

    const optimizedContent = data.choices[0].message.content;
    
    // Zähle integrierte Links
    const linkCount = (optimizedContent.match(/\[([^\]]+)\]\(\/blog\/[^)]+\)/g) || []).length;
    
    console.log(`[AI Content Insights] Successfully integrated ${linkCount} internal links`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        optimizedContent,
        linksIntegrated: linkCount,
        message: `${linkCount} interne Links wurden erfolgreich integriert`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('[AI Content Insights] Link integration failed:', error);
    throw new Error(`Link-Integration fehlgeschlagen: ${error.message}`);
  }
}
