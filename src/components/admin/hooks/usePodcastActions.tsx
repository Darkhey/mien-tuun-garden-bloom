
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePodcastActions = (refetchPodcasts: () => void, refetchBlogPosts: () => void) => {
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const generatePodcastForPost = async (blogPostId: string, title: string) => {
    setGeneratingIds(prev => new Set(prev).add(blogPostId));
    
    try {
      toast({
        title: "Podcast-Generierung gestartet",
        description: `Erstelle liebevollen Podcast für "${title}" mit Mariannes warmer Stimme`,
      });

      // Script generieren
      const { error: scriptError } = await supabase.functions.invoke(
        'generate-podcast-script',
        { body: { blog_post_id: blogPostId } }
      );

      if (scriptError) {
        throw new Error(`Script-Generierung fehlgeschlagen: ${scriptError.message}`);
      }

      // Kurz warten und Podcast-ID holen
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: podcast } = await supabase
        .from('blog_podcasts')
        .select('id')
        .eq('blog_post_id', blogPostId)
        .single();

      if (podcast) {
        // Audio generieren
        const { error: audioError } = await supabase.functions.invoke(
          'generate-podcast-audio',
          { body: { podcast_id: podcast.id } }
        );

        if (audioError) {
          throw new Error(`Audio-Generierung fehlgeschlagen: ${audioError.message}`);
        }
      }

      toast({
        title: "Podcast erfolgreich erstellt",
        description: `Mariannes liebevoller Podcast für "${title}" ist verfügbar`,
      });

      refetchPodcasts();
      refetchBlogPosts();

    } catch (error: any) {
      toast({
        title: "Fehler bei Podcast-Erstellung",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(blogPostId);
        return newSet;
      });
    }
  };

  const handlePlayPodcast = (audioUrl: string) => {
    window.open(audioUrl, '_blank');
  };

  const handleDownloadPodcast = (audioUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${title}.mp3`;
    link.click();
  };

  return {
    generatingIds,
    generatePodcastForPost,
    handlePlayPodcast,
    handleDownloadPodcast
  };
};
