
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Volume2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BlogPodcastFilter from './views/BlogPodcastFilter';
import BlogPodcastList from './views/BlogPodcastList';
import { Button } from '@/components/ui/button';

const BlogPodcastManager: React.FC = () => {
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [podcastFilter, setPodcastFilter] = useState<'all' | 'with-podcast' | 'without-podcast'>('all');
  const [category, setCategory] = useState('all');
  const { toast } = useToast();

  // Blog-Posts laden
  const { data: blogPosts = [], refetch: refetchBlogPosts, isLoading: loadingBlogPosts } = useQuery({
    queryKey: ['admin-blog-posts-podcast'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, category, published_at, excerpt')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Podcasts laden
  const { data: podcasts = [], refetch: refetchPodcasts, isLoading: loadingPodcasts } = useQuery({
    queryKey: ['admin-podcasts-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_podcasts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Gefilterte Blog-Posts
  const filteredBlogPosts = useMemo(() => {
    let filtered = blogPosts;

    // Text-Filter
    if (search) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Kategorie-Filter
    if (category !== 'all') {
      filtered = filtered.filter(post => post.category === category);
    }

    // Podcast-Status-Filter
    if (podcastFilter !== 'all') {
      filtered = filtered.filter(post => {
        const hasPodcast = podcasts.some(podcast => podcast.blog_post_id === post.id);
        return podcastFilter === 'with-podcast' ? hasPodcast : !hasPodcast;
      });
    }

    return filtered;
  }, [blogPosts, podcasts, search, category, podcastFilter]);

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

  const handleRefresh = () => {
    refetchBlogPosts();
    refetchPodcasts();
  };

  const isLoading = loadingBlogPosts || loadingPodcasts;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Blog-Artikel und Podcasts werden geladen...</span>
      </div>
    );
  }

  const podcastCount = podcasts.length;
  const blogPostsWithPodcast = blogPosts.filter(post => 
    podcasts.some(podcast => podcast.blog_post_id === post.id)
  ).length;
  const blogPostsWithoutPodcast = blogPosts.length - blogPostsWithPodcast;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Podcast Manager</h2>
          <p className="text-gray-600">
            Verwalte Podcasts für Blog-Artikel mit Mariannes liebevoller Stimme
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-sage-600" />
              <div>
                <p className="text-sm text-gray-600">Gesamt Podcasts</p>
                <p className="text-xl font-semibold">{podcastCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Mit Podcast</p>
              <p className="text-xl font-semibold text-green-600">{blogPostsWithPodcast}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Ohne Podcast</p>
              <p className="text-xl font-semibold text-orange-600">{blogPostsWithoutPodcast}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Gesamt Artikel</p>
              <p className="text-xl font-semibold">{blogPosts.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <BlogPodcastFilter
        search={search}
        setSearch={setSearch}
        podcastFilter={podcastFilter}
        setPodcastFilter={setPodcastFilter}
        category={category}
        setCategory={setCategory}
        onRefresh={handleRefresh}
      />

      {/* Blog-Posts Liste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Blog-Artikel ({filteredBlogPosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BlogPodcastList
            blogPosts={filteredBlogPosts}
            podcasts={podcasts}
            generatingIds={generatingIds}
            onGeneratePodcast={generatePodcastForPost}
            onPlayPodcast={handlePlayPodcast}
            onDownloadPodcast={handleDownloadPodcast}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPodcastManager;
