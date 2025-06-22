
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_ADMIN_KEY = Deno.env.get("OPENAI_ADMIN_KEY");

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
          content: "Du bist ein KI-Experte für Content-Performance-Analyse. Analysiere den gegebenen Content und gib eine detaillierte Bewertung als JSON zurück."
        },
        {
          role: "user",
          content: `Analysiere diesen Content für Performance-Vorhersage:
          
Titel: ${contentData.title}
Kategorie: ${contentData.category}
Tags: ${contentData.tags?.join(', ') || 'Keine'}
Content-Länge: ${contentData.content?.length || 0} Zeichen
SEO-Keywords: ${contentData.seoKeywords?.join(', ') || 'Keine'}

Gib eine JSON-Antwort mit:
- performanceScore (0-100)
- seoOptimization (0-100) 
- engagementPrediction (0-100)
- recommendations (Array von Strings)
- estimatedViews (Zahl)
- competitiveness (low/medium/high)`
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  const data = await response.json();
  const analysis = JSON.parse(data.choices[0].message.content);

  return new Response(
    JSON.stringify({ 
      success: true, 
      analysis,
      timestamp: new Date().toISOString()
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function generateContentInsights(supabase: any) {
  // Fetch recent blog posts for analysis
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('title, category, tags, engagement_score, quality_score, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

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
          content: "Du bist ein Content-Strategie-Experte. Analysiere die gegebenen Blogpost-Daten und identifiziere Trends, Lücken und Opportunities."
        },
        {
          role: "user",
          content: `Analysiere diese Blogpost-Daten und gib Insights als JSON zurück:

${JSON.stringify(posts, null, 2)}

Gib eine JSON-Antwort mit:
- topPerformingCategories (Array)
- contentGaps (Array von Opportunities)
- seasonalTrends (Array)
- recommendedTopics (Array mit topic, reason, priority)
- performanceInsights (Array von Beobachtungen)`
        }
      ],
      temperature: 0.4,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  const insights = JSON.parse(data.choices[0].message.content);

  return new Response(
    JSON.stringify({ 
      success: true, 
      insights,
      dataPoints: posts.length,
      generatedAt: new Date().toISOString()
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function predictContentTrends(supabase: any) {
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
          content: "Du bist ein Trend-Analyst für Garten- und Küchen-Content. Basierend auf aktuellen Trends und saisonalen Faktoren, vorhersage relevante Content-Trends für die nächsten Monate."
        },
        {
          role: "user",
          content: `Analysiere und vorhersage Content-Trends für deutsche Garten- und Küchen-Blogs. 
          
Berücksichtige:
- Aktuelle Jahreszeit: ${new Date().toLocaleDateString('de-DE', { month: 'long' })}
- Nachhaltigkeitstrends
- Urbane Gartentrends
- Gesunde Ernährung
- Selbstversorgung

Gib eine JSON-Antwort mit:
- emergingTrends (Array mit trend, description, potential 0-100)
- seasonalOpportunities (Array)
- keywordOpportunities (Array)
- contentTypes (Array der trending Content-Formate)
- timeframe (wann diese Trends relevant werden)`
        }
      ],
      temperature: 0.6,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  const trends = JSON.parse(data.choices[0].message.content);

  return new Response(
    JSON.stringify({ 
      success: true, 
      trends,
      predictedFor: new Date().toISOString()
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function optimizeContent(contentData: any, supabase: any) {
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
          content: "Du bist ein SEO- und Content-Optimierungs-Experte. Gib konkrete Optimierungsvorschläge für den gegebenen Content."
        },
        {
          role: "user",
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
  const optimization = JSON.parse(data.choices[0].message.content);

  return new Response(
    JSON.stringify({ 
      success: true, 
      optimization,
      originalTitle: contentData.title,
      optimizedAt: new Date().toISOString()
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
