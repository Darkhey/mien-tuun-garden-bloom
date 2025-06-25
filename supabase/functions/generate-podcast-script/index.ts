
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

  try {
    const { blog_post_id } = await req.json()
    
    if (!blog_post_id) {
      throw new Error('Blog Post ID ist erforderlich')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Lade Blog-Post Daten
    const { data: blogPost, error: blogError } = await supabaseClient
      .from('blog_posts')
      .select('*')
      .eq('id', blog_post_id)
      .single()

    if (blogError) {
      throw new Error(`Blog-Post nicht gefunden: ${blogError.message}`)
    }

    // Erstelle oder aktualisiere Podcast-Eintrag
    const { data: existingPodcast } = await supabaseClient
      .from('blog_podcasts')
      .select('id')
      .eq('blog_post_id', blog_post_id)
      .single()

    let podcast_id = existingPodcast?.id

    if (!podcast_id) {
      const { data: newPodcast, error: insertError } = await supabaseClient
        .from('blog_podcasts')
        .insert({
          blog_post_id,
          title: `Podcast: ${blogPost.title}`,
          description: blogPost.excerpt || 'Automatisch generierter Podcast',
          script_content: '',
          status: 'generating_script'
        })
        .select('id')
        .single()

      if (insertError) {
        throw new Error(`Fehler beim Erstellen des Podcast-Eintrags: ${insertError.message}`)
      }
      podcast_id = newPodcast.id
    } else {
      // Update Status
      await supabaseClient
        .from('blog_podcasts')
        .update({ status: 'generating_script' })
        .eq('id', podcast_id)
    }

    // Generiere Podcast-Script mit OpenAI
    const podcastScript = await generatePodcastScript(blogPost)

    // Aktualisiere mit generiertem Script
    await supabaseClient
      .from('blog_podcasts')
      .update({
        script_content: podcastScript,
        status: 'ready'
      })
      .eq('id', podcast_id)

    console.log(`Podcast-Script erfolgreich generiert für Blog-Post: ${blog_post_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        podcast_id, 
        script_preview: podcastScript.substring(0, 200) + '...' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Fehler bei Podcast-Script-Generierung:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function generatePodcastScript(blogPost: any): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

  // Zuerst OpenAI versuchen
  if (openaiApiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `Du bist ein professioneller Podcast-Produzent. Verwandle Blog-Artikel in natürliche, sprechbare Podcast-Skripte auf Deutsch. 

Richtlinien:
- Beginne mit einer kurzen, einladenden Begrüßung
- Entferne visuelle Elemente (Bilder, Grafiken, Links)
- Füge natürliche Übergänge und Pausen hinzu
- Verwende einen freundlichen, conversationalen Ton
- Erkläre komplexe Begriffe für Audio-Konsumenten
- Beende mit einem Call-to-Action oder Ausblick
- Maximale Länge: 10-15 Minuten Sprechzeit

Format: Reiner Text ohne Markup, bereit zum Vorlesen.`
            },
            {
              role: 'user',
              content: `Titel: ${blogPost.title}\n\nInhalt: ${blogPost.content}\n\nKategorie: ${blogPost.category}`
            }
          ],
          max_tokens: 4000,
          temperature: 0.7
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.choices[0].message.content
      }
    } catch (error) {
      console.warn('OpenAI fehlgeschlagen, versuche Gemini:', error)
    }
  }

  // Fallback zu Gemini
  if (geminiApiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Verwandle diesen Blog-Artikel in ein natürliches Podcast-Skript auf Deutsch. Beginne mit einer Begrüßung, entferne visuelle Elemente, füge Übergänge hinzu und beende professionell.

Titel: ${blogPost.title}
Inhalt: ${blogPost.content}
Kategorie: ${blogPost.category}

Erstelle ein sprechbares Skript für 10-15 Minuten Audio.`
            }]
          }],
          generationConfig: {
            maxOutputTokens: 4000,
            temperature: 0.7
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.candidates[0].content.parts[0].text
      }
    } catch (error) {
      console.error('Gemini fehlgeschlagen:', error)
    }
  }

  throw new Error('Keine verfügbare AI-API für Script-Generierung')
}
