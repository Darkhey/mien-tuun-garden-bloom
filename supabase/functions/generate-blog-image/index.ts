
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

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Starting image generation request`);

  try {
    const { prompt, context } = await req.json();
    
    console.log(`[${requestId}] Prompt:`, prompt?.substring(0, 100) + '...');
    console.log(`[${requestId}] Context:`, { title: context?.title, category: context?.category });

    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Gültiger Prompt erforderlich');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API Key nicht konfiguriert');
    }

    let imageData = null;
    let modelUsed = 'dall-e-2';
    let imageBase64 = null;

    // Try dall-e-3 first, then fall back to dall-e-2
    try {
      console.log(`[${requestId}] Attempting image generation with dall-e-3...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for dall-e-3
      
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt.length > 4000 ? prompt.substring(0, 4000) : prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          response_format: 'b64_json'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (imageResponse.ok) {
        imageData = await imageResponse.json();
        modelUsed = 'dall-e-3';
        imageBase64 = imageData.data[0].b64_json;
        console.log(`[${requestId}] dall-e-3 succeeded`);
      } else {
        const errorText = await imageResponse.text();
        console.log(`[${requestId}] dall-e-3 failed:`, imageResponse.status, errorText);
        throw new Error(`dall-e-3 failed: ${imageResponse.status}`);
      }
    } catch (dalle3Error) {
      console.log(`[${requestId}] Falling back to dall-e-2...`);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for dall-e-2
        
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-2',
            prompt: prompt.length > 1000 ? prompt.substring(0, 1000) : prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json'
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          console.error(`[${requestId}] dall-e-2 also failed:`, imageResponse.status, errorText);
          throw new Error(`dall-e-2 failed: ${imageResponse.status} - ${errorText}`);
        }

        imageData = await imageResponse.json();
        modelUsed = 'dall-e-2';
        imageBase64 = imageData.data[0].b64_json;
        console.log(`[${requestId}] dall-e-2 succeeded as fallback`);
      } catch (dalleError) {
        console.error(`[${requestId}] Both AI models failed:`, dalleError);
        
        // Return fallback image immediately
        const fallbackImageUrl = "/lovable-uploads/2a3ad273-430b-4675-b1c4-33dbaac0b6cf.png";
        console.log(`[${requestId}] Using static fallback image:`, fallbackImageUrl);
        
        return new Response(
          JSON.stringify({ 
            imageUrl: fallbackImageUrl,
            filename: 'fallback-image.png',
            prompt,
            model: 'fallback',
            warning: 'AI-Generierung fehlgeschlagen - Fallback-Bild verwendet'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    if (!imageBase64) {
      throw new Error('Keine Bilddaten erhalten');
    }

    // Enhanced storage upload with retry mechanism
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    const timestamp = Date.now();
    const sanitizedTitle = context?.title?.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50) || 'blog-image';
    const filename = `${sanitizedTitle}-${timestamp}.png`;

    let publicUrl = null;
    let uploadSuccess = false;

    try {
      console.log(`[${requestId}] Attempting storage upload...`);
      
      // Convert Base64 to Uint8Array
      const byteCharacters = atob(imageBase64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      console.log(`[${requestId}] Image size: ${byteArray.length} bytes`);

      // Upload with retry mechanism
      let uploadAttempts = 0;
      const maxUploadAttempts = 3;
      
      while (uploadAttempts < maxUploadAttempts && !uploadSuccess) {
        uploadAttempts++;
        console.log(`[${requestId}] Upload attempt ${uploadAttempts}/${maxUploadAttempts}`);
        
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('blog-images')
            .upload(`generated/${filename}`, byteArray, {
              contentType: 'image/png',
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            console.error(`[${requestId}] Upload attempt ${uploadAttempts} failed:`, uploadError);
            if (uploadAttempts === maxUploadAttempts) {
              throw uploadError;
            }
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts));
          } else {
            uploadSuccess = true;
            console.log(`[${requestId}] Upload successful:`, uploadData);
            
            // Get public URL
            const { data: { publicUrl: storageUrl } } = supabase.storage
              .from('blog-images')
              .getPublicUrl(`generated/${filename}`);
            
            publicUrl = storageUrl;
            console.log(`[${requestId}] Public URL generated:`, publicUrl);
          }
        } catch (attemptError) {
          console.error(`[${requestId}] Upload attempt ${uploadAttempts} exception:`, attemptError);
          if (uploadAttempts === maxUploadAttempts) {
            throw attemptError;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts));
        }
      }
    } catch (storageError) {
      console.error(`[${requestId}] Storage upload failed completely:`, storageError);
      
      // Fallback: Return base64 data URI
      publicUrl = `data:image/png;base64,${imageBase64}`;
      uploadSuccess = false;
      console.log(`[${requestId}] Using base64 data URI as fallback`);
    }

    const result = {
      imageUrl: publicUrl,
      filename,
      prompt,
      model: modelUsed,
      uploadedToStorage: uploadSuccess,
      requestId
    };

    console.log(`[${requestId}] Generation completed successfully:`, {
      model: modelUsed,
      uploadSuccess,
      urlLength: publicUrl?.length
    });

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error(`[${requestId}] Critical error:`, error);
    
    // Enhanced error response with fallback
    const errorResponse = {
      error: 'Bildgenerierung fehlgeschlagen',
      details: error.message,
      requestId,
      timestamp: new Date().toISOString(),
      fallbackImage: "/lovable-uploads/2a3ad273-430b-4675-b1c4-33dbaac0b6cf.png"
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
