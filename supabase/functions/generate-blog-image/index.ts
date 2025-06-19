
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, context } = await req.json();
    
    console.log('[generate-blog-image] Generating image with prompt:', prompt);

    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Gültiger Prompt erforderlich');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API Key nicht konfiguriert');
    }

    // Generiere Bild mit OpenAI
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'png'
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('[generate-blog-image] OpenAI Error:', errorText);
      throw new Error(`OpenAI Bildgenerierung fehlgeschlagen: ${errorText}`);
    }

    const imageData = await imageResponse.json();
    console.log('[generate-blog-image] Image generated successfully');

    if (!imageData.data?.[0]?.b64_json) {
      throw new Error('Keine Bilddaten von OpenAI erhalten');
    }

    // Upload zu Supabase Storage
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const imageBase64 = imageData.data[0].b64_json;
    
    // Erstelle Dateiname basierend auf Kontext
    const timestamp = Date.now();
    const sanitizedTitle = context?.title?.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50) || 'blog-image';
    const filename = `${sanitizedTitle}-${timestamp}.png`;

    // Konvertiere Base64 zu Uint8Array
    const base64Data = imageBase64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);

    // Upload zu Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(`generated/${filename}`, byteArray, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('[generate-blog-image] Upload error:', uploadError);
      throw new Error(`Storage Upload fehlgeschlagen: ${uploadError.message}`);
    }

    // Erhalte öffentliche URL
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(`generated/${filename}`);

    console.log('[generate-blog-image] Image uploaded successfully:', publicUrl);

    return new Response(
      JSON.stringify({ 
        imageUrl: publicUrl,
        filename,
        prompt,
        model: 'gpt-image-1'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[generate-blog-image] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Bildgenerierung fehlgeschlagen',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
