
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Mic, Clock, Download, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  published_at: string;
  excerpt?: string;
}

interface Podcast {
  id: string;
  blog_post_id: string;
  title: string;
  status: string;
  audio_url?: string;
  duration_seconds?: number;
  created_at: string;
}

interface BlogPodcastListProps {
  blogPosts: BlogPost[];
  podcasts: Podcast[];
  generatingIds: Set<string>;
  onGeneratePodcast: (blogPostId: string, title: string) => void;
  onPlayPodcast: (audioUrl: string) => void;
  onDownloadPodcast: (audioUrl: string, title: string) => void;
}

const BlogPodcastList: React.FC<BlogPodcastListProps> = ({
  blogPosts,
  podcasts,
  generatingIds,
  onGeneratePodcast,
  onPlayPodcast,
  onDownloadPodcast
}) => {
  const getPodcastForPost = (blogPostId: string) => {
    return podcasts.find(p => p.blog_post_id === blogPostId);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { variant: 'secondary' as const, text: 'Wartend' },
      'generating_script': { variant: 'default' as const, text: 'Script wird erstellt' },
      'generating_audio': { variant: 'default' as const, text: 'Audio wird erstellt' },
      'ready': { variant: 'default' as const, text: 'Bereit' },
      'error': { variant: 'destructive' as const, text: 'Fehler' }
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    
    return (
      <Badge 
        variant={config.variant} 
        className={status === 'ready' ? 'bg-green-100 text-green-800' : undefined}
      >
        {config.text}
      </Badge>
    );
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {blogPosts.map((post) => {
        const podcast = getPodcastForPost(post.id);
        const isGenerating = generatingIds.has(post.id);

        return (
          <Card key={post.id} className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-1 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="outline">{post.category}</Badge>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(post.published_at), { 
                            addSuffix: true, 
                            locale: de 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  {podcast ? (
                    <div className="flex items-center gap-2">
                      {getStatusBadge(podcast.status)}
                      
                      {podcast.duration_seconds && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(podcast.duration_seconds)}</span>
                        </div>
                      )}

                      {podcast.audio_url && podcast.status === 'ready' && (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onPlayPodcast(podcast.audio_url!)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDownloadPodcast(podcast.audio_url!, podcast.title)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onGeneratePodcast(post.id, post.title)}
                      disabled={isGenerating}
                      className="bg-sage-600 hover:bg-sage-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Wird erstellt...
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Podcast erstellen
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {blogPosts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Keine Blog-Artikel gefunden, die den Filterkriterien entsprechen.
        </div>
      )}
    </div>
  );
};

export default BlogPodcastList;
