
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API-Schlüssel nicht konfiguriert");
    }

    const { prompt, config = {} } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt ist erforderlich");
    }

    console.log('[generate-with-gemini] Generating content with Gemini');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: config.temperature || 0.7,
          maxOutputTokens: config.maxOutputTokens || 4000,
          topP: config.topP || 0.8,
          topK: config.topK || 40,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Fehler (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Keine Antwort von Gemini erhalten");
    }
    
    const text = data.candidates[0].content.parts[0].text.trim();
    
    console.log('[generate-with-gemini] Content generated successfully');

    return new Response(
      JSON.stringify({ 
        text,
        model: 'gemini-1.5-flash',
        provider: 'Google Gemini'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('[generate-with-gemini] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        provider: 'Google Gemini'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
