
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice_id, model_id } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    const elevenLabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY')
    
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API Key nicht konfiguriert')
    }

    // Call ElevenLabs Audio Native API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id || '21m00Tcm4TlvDq8ikWAM'}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: model_id || 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ElevenLabs API Fehler: ${response.status} - ${errorText}`)
    }

    // Stream the audio response
    const audioStream = response.body
    
    return new Response(audioStream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('ElevenLabs Audio Native Error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
