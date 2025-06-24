
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

    let imageData = null;
    let modelUsed = 'dall-e-2';

    // Versuche zuerst gpt-image-1 (falls verfügbar)
    try {
      console.log('[generate-blog-image] Trying gpt-image-1 first...');
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

      if (imageResponse.ok) {
        imageData = await imageResponse.json();
        modelUsed = 'gpt-image-1';
        console.log('[generate-blog-image] gpt-image-1 succeeded');
      } else {
        const errorText = await imageResponse.text();
        console.log('[generate-blog-image] gpt-image-1 failed, trying dall-e-2:', errorText);
        throw new Error('gpt-image-1 not available');
      }
    } catch (gptImageError) {
      // Fallback zu dall-e-2
      console.log('[generate-blog-image] Falling back to dall-e-2...');
      
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-2',
          prompt: prompt.length > 1000 ? prompt.substring(0, 1000) : prompt, // dall-e-2 hat kürzere Prompt-Limits
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json'
        }),
      });

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error('[generate-blog-image] Both models failed. dall-e-2 error:', errorText);
        throw new Error(`Beide Bildmodelle fehlgeschlagen: ${errorText}`);
      }

      imageData = await imageResponse.json();
      modelUsed = 'dall-e-2';
      console.log('[generate-blog-image] dall-e-2 succeeded');
    }

    if (!imageData?.data?.[0]) {
      throw new Error('Keine Bilddaten von OpenAI erhalten');
    }

    // Handle different response formats
    let imageBase64;
    if (modelUsed === 'gpt-image-1' && imageData.data[0].b64_json) {
      imageBase64 = imageData.data[0].b64_json;
    } else if (modelUsed === 'dall-e-2' && imageData.data[0].b64_json) {
      imageBase64 = imageData.data[0].b64_json;
    } else if (imageData.data[0].url) {
      // Wenn URL zurückgegeben wird, lade das Bild herunter
      const imageUrl = imageData.data[0].url;
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    } else {
      throw new Error('Keine verwertbaren Bilddaten erhalten');
    }

    // Upload zu Supabase Storage
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Erstelle Dateiname basierend auf Kontext
    const timestamp = Date.now();
    const sanitizedTitle = context?.title?.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50) || 'blog-image';
    const filename = `${sanitizedTitle}-${timestamp}.png`;

    // Konvertiere Base64 zu Uint8Array
    const byteCharacters = atob(imageBase64);
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
        model: modelUsed
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
