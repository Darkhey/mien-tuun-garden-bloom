
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mic, Play, AlertCircle } from 'lucide-react';
import BlogPodcastPlayer from './BlogPodcastPlayer';
import { useToast } from '@/hooks/use-toast';

interface BlogPodcastSectionProps {
  blogPostId: string;
  blogTitle: string;
}

const BlogPodcastSection: React.FC<BlogPodcastSectionProps> = ({
  blogPostId,
  blogTitle
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Query für bestehenden Podcast
  const { data: podcast, refetch, isLoading } = useQuery({
    queryKey: ['blog-podcast', blogPostId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_podcasts')
        .select('*')
        .eq('blog_post_id', blogPostId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    }
  });

  const generatePodcast = async () => {
    setIsGenerating(true);
    try {
      toast({
        title: "Podcast wird erstellt",
        description: "Generiere Script und Audio - das kann einige Minuten dauern...",
      });

      // 1. Generiere Script
      const { data: scriptData, error: scriptError } = await supabase.functions.invoke(
        'generate-podcast-script',
        {
          body: { blog_post_id: blogPostId }
        }
      );

      if (scriptError) {
        throw new Error(`Script-Generierung fehlgeschlagen: ${scriptError.message}`);
      }

      // 2. Generiere Audio
      const { data: audioData, error: audioError } = await supabase.functions.invoke(
        'generate-podcast-audio',
        {
          body: { podcast_id: scriptData.podcast_id }
        }
      );

      if (audioError) {
        throw new Error(`Audio-Generierung fehlgeschlagen: ${audioError.message}`);
      }

      toast({
        title: "Podcast erstellt!",
        description: "Der Podcast ist jetzt verfügbar.",
      });

      refetch();

    } catch (error: any) {
      console.error('Podcast-Generierung Fehler:', error);
      toast({
        title: "Fehler bei Podcast-Erstellung",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-8 border-t pt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-sage-600 rounded-full flex items-center justify-center">
          <Mic className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-earth-800">Podcast Version</h3>
          <p className="text-sm text-earth-600">Höre dir diesen Artikel als Audio an</p>
        </div>
      </div>

      {!podcast && (
        <div className="text-center py-8">
          <p className="text-earth-600 mb-4">
            Für diesen Artikel ist noch kein Podcast verfügbar.
          </p>
          <Button 
            onClick={generatePodcast}
            disabled={isGenerating}
            className="bg-sage-600 hover:bg-sage-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Podcast wird erstellt...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Podcast erstellen
              </>
            )}
          </Button>
        </div>
      )}

      {podcast?.status === 'pending' && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Podcast wird vorbereitet...
          </AlertDescription>
        </Alert>
      )}

      {podcast?.status === 'generating_script' && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Script wird generiert...
          </AlertDescription>
        </Alert>
      )}

      {podcast?.status === 'generating_audio' && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Audio wird erstellt - das kann einige Minuten dauern...
          </AlertDescription>
        </Alert>
      )}

      {podcast?.status === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Fehler bei der Podcast-Erstellung: {podcast.error_message}
          </AlertDescription>
        </Alert>
      )}

      {podcast?.status === 'ready' && podcast.audio_url && (
        <BlogPodcastPlayer
          audioUrl={podcast.audio_url}
          title={podcast.title}
          duration={podcast.duration_seconds}
        />
      )}
    </div>
  );
};

export default BlogPodcastSection;
