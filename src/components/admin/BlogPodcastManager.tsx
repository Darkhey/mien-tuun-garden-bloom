
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Download, RefreshCw, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const BlogPodcastManager: React.FC = () => {
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: podcasts, refetch, isLoading } = useQuery({
    queryKey: ['admin-podcasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_podcasts')
        .select(`
          *,
          blog_posts (
            title,
            slug,
            category
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: blogPostsWithoutPodcast } = useQuery({
    queryKey: ['blog-posts-without-podcast'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, category')
        .not('id', 'in', `(${podcasts?.map(p => p.blog_post_id).join(',') || 'null'})`)
        .eq('published', true)
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!podcasts
  });

  const generatePodcastForPost = async (blogPostId: string, title: string) => {
    setGeneratingIds(prev => new Set(prev).add(blogPostId));
    
    try {
      toast({
        title: "Podcast-Generierung gestartet",
        description: `Erstelle Podcast für "${title}"`,
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
        description: `Podcast für "${title}" ist verfügbar`,
      });

      refetch();

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

  const regenerateAudio = async (podcastId: string, title: string) => {
    try {
      toast({
        title: "Audio wird neu generiert",
        description: `Erstelle neues Audio für "${title}"`,
      });

      const { error } = await supabase.functions.invoke(
        'generate-podcast-audio',
        { body: { podcast_id: podcastId } }
      );

      if (error) {
        throw new Error(`Audio-Regenerierung fehlgeschlagen: ${error.message}`);
      }

      toast({
        title: "Audio erfolgreich regeneriert",
        description: `Neues Audio für "${title}" ist verfügbar`,
      });

      refetch();

    } catch (error: any) {
      toast({
        title: "Fehler bei Audio-Regenerierung",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { variant: 'secondary' as const, text: 'Wartend' },
      'generating_script': { variant: 'default' as const, text: 'Script wird erstellt' },
      'generating_audio': { variant: 'default' as const, text: 'Audio wird erstellt' },
      'ready': { variant: 'default' as const, text: 'Bereit', className: 'bg-green-100 text-green-800' },
      'error': { variant: 'destructive' as const, text: 'Fehler' }
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.text}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Podcast-Manager</h2>
          <p className="text-gray-600">Verwalte automatisch generierte Podcasts</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {/* Bestehende Podcasts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Bestehende Podcasts ({podcasts?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {podcasts?.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Noch keine Podcasts erstellt</p>
          ) : (
            <div className="space-y-4">
              {podcasts?.map((podcast) => (
                <div key={podcast.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{podcast.title}</h3>
                    <p className="text-sm text-gray-600">
                      {podcast.blog_posts?.title} • {podcast.blog_posts?.category}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(podcast.status)}
                      {podcast.duration_seconds && (
                        <span className="text-xs text-gray-500">
                          {Math.round(podcast.duration_seconds / 60)} Min
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(podcast.created_at), { 
                          addSuffix: true, 
                          locale: de 
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {podcast.audio_url && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(podcast.audio_url, '_blank')}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = podcast.audio_url;
                            link.download = `${podcast.title}.mp3`;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => regenerateAudio(podcast.id, podcast.title)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blog-Posts ohne Podcast */}
      {blogPostsWithoutPodcast && blogPostsWithoutPodcast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Blog-Posts ohne Podcast ({blogPostsWithoutPodcast.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blogPostsWithoutPodcast.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{post.title}</h4>
                    <p className="text-sm text-gray-600">{post.category}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => generatePodcastForPost(post.id, post.title)}
                    disabled={generatingIds.has(post.id)}
                  >
                    {generatingIds.has(post.id) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Wird erstellt...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Podcast erstellen
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlogPodcastManager;
