
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { podcast_id } = await req.json().catch(() => ({ podcast_id: null }))

  try {
    if (!podcast_id) {
      throw new Error('Podcast ID ist erforderlich')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Lade Podcast-Daten
    const { data: podcast, error: podcastError } = await supabaseClient
      .from('blog_podcasts')
      .select('*')
      .eq('id', podcast_id)
      .single()

    if (podcastError) {
      throw new Error(`Podcast nicht gefunden: ${podcastError.message}`)
    }

    // Status auf generating_audio setzen
    await supabaseClient
      .from('blog_podcasts')
      .update({ status: 'generating_audio' })
      .eq('id', podcast_id)

    // Generiere Audio mit ElevenLabs
    const audioData = await generateAudioWithElevenLabs(podcast.script_content, podcast.voice_settings)

    // Lade Audio zu Supabase Storage hoch
    const fileName = `podcast-${podcast_id}.mp3`
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('podcasts')
      .upload(fileName, audioData, {
        contentType: 'audio/mpeg',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Upload-Fehler: ${uploadError.message}`)
    }

    // Hole öffentliche URL
    const { data: publicUrlData } = supabaseClient.storage
      .from('podcasts')
      .getPublicUrl(fileName)

    // Berechne ungefähre Dauer (grobe Schätzung: 150 Wörter pro Minute)
    const wordCount = podcast.script_content.split(' ').length
    const estimatedDuration = Math.round((wordCount / 150) * 60)

    // Aktualisiere Podcast mit Audio-URL
    await supabaseClient
      .from('blog_podcasts')
      .update({
        audio_url: publicUrlData.publicUrl,
        duration_seconds: estimatedDuration,
        status: 'ready',
        published_at: new Date().toISOString()
      })
      .eq('id', podcast_id)

    console.log(`Podcast-Audio erfolgreich generiert: ${publicUrlData.publicUrl}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        audio_url: publicUrlData.publicUrl,
        duration_seconds: estimatedDuration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Fehler bei Audio-Generierung:', error)

    // Status auf error setzen
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      )

      if (podcast_id) {
        await supabaseClient
          .from('blog_podcasts')
          .update({
            status: 'error',
            error_message: error.message
          })
          .eq('id', podcast_id)
      }
    } catch (updateError) {
      console.error('Fehler beim Update des Error-Status:', updateError)
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function generateAudioWithElevenLabs(text: string, voiceSettings: any): Promise<Uint8Array> {
  const elevenLabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY')
  
  if (!elevenLabsApiKey) {
    throw new Error('ElevenLabs API Key nicht konfiguriert')
  }

  const voiceId = voiceSettings?.voice_id || '21m00Tcm4TlvDq8ikWAM' // Deutsche Stimme

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': elevenLabsApiKey,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: voiceSettings?.stability || 0.5,
        similarity_boost: voiceSettings?.similarity_boost || 0.8,
        style: voiceSettings?.style || 0.2,
        use_speaker_boost: true
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ElevenLabs API Fehler: ${response.status} - ${errorText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}
