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
    const { text, voice_id, model_id, name } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    const elevenLabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY')

    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API Key nicht konfiguriert')
    }

    const formData = new FormData()
    formData.append('name', name || 'Audio Native Project')
    formData.append('auto_convert', 'true')
    if (voice_id) formData.append('voice_id', voice_id)
    if (model_id) formData.append('model_id', model_id)
    const file = new File([text], 'article.txt', { type: 'text/plain' })
    formData.append('file', file)

    const response = await fetch('https://api.elevenlabs.io/v1/audio-native', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
      },
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ElevenLabs API Fehler: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

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
