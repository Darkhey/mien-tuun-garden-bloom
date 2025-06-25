
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePodcastActions = (
  refetchPodcasts: () => void,
  refetchBlogPosts: () => void
) => {
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const generateScriptForPost = async (blogPostId: string, title: string) => {
    setGeneratingIds(prev => new Set(prev).add(blogPostId));

    try {
      toast({
        title: 'Skript wird erstellt',
        description: `Marianne schreibt ein liebevolles Skript für "${title}"`,
      });

      const { error } = await supabase.functions.invoke('generate-podcast-script', {
        body: { blog_post_id: blogPostId },
      });

      if (error) {
        throw new Error(`Script-Generierung fehlgeschlagen: ${error.message}`);
      }

      toast({
        title: 'Skript erstellt',
        description: 'Du kannst das Skript nun anschauen.',
      });

      refetchPodcasts();
      refetchBlogPosts();
    } catch (err: any) {
      toast({
        title: 'Fehler bei Skript-Erstellung',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setGeneratingIds(prev => {
        const set = new Set(prev);
        set.delete(blogPostId);
        return set;
      });
    }
  };

  const generateAudioForPodcast = async (
    podcastId: string,
    blogPostId: string,
    title: string
  ) => {
    setGeneratingIds(prev => new Set(prev).add(blogPostId));

    try {
      toast({
        title: 'Audio-Erstellung gestartet',
        description: `Annika vertont nun das Skript für "${title}"`,
      });

      const { error } = await supabase.functions.invoke('generate-podcast-audio', {
        body: { podcast_id: podcastId },
      });

      if (error) {
        throw new Error(`Audio-Generierung fehlgeschlagen: ${error.message}`);
      }

      toast({
        title: 'Podcast fertig',
        description: `Der Podcast zu "${title}" ist jetzt verfügbar`,
      });

      refetchPodcasts();
      refetchBlogPosts();
    } catch (err: any) {
      toast({
        title: 'Fehler bei Audio-Erstellung',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setGeneratingIds(prev => {
        const set = new Set(prev);
        set.delete(blogPostId);
        return set;
      });
    }
  };

  const generatePodcastForPost = async (blogPostId: string, title: string) => {
    await generateScriptForPost(blogPostId, title);

    try {
      const { data: podcast, error } = await supabase
        .from('blog_podcasts')
        .select('id')
        .eq('blog_post_id', blogPostId)
        .single();

      if (error) {
        throw error;
      }

      if (podcast) {
        await generateAudioForPodcast(podcast.id, blogPostId, title);
      }
    } catch (err: any) {
      toast({
        title: 'Fehler beim Podcast-Lookup',
        description: err.message,
        variant: 'destructive',
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
    generateScriptForPost,
    generateAudioForPodcast,
    generatePodcastForPost,
    handlePlayPodcast,
    handleDownloadPodcast
  };
};
