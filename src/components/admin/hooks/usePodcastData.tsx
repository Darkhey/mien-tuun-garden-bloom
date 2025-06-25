
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePodcastData = () => {
  const [search, setSearch] = useState('');
  const [podcastFilter, setPodcastFilter] = useState<'all' | 'with-podcast' | 'without-podcast'>('all');
  const [category, setCategory] = useState('all');

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

  const handleRefresh = () => {
    refetchBlogPosts();
    refetchPodcasts();
  };

  return {
    blogPosts,
    podcasts,
    filteredBlogPosts,
    search,
    setSearch,
    podcastFilter,
    setPodcastFilter,
    category,
    setCategory,
    refetchBlogPosts,
    refetchPodcasts,
    handleRefresh,
    isLoading: loadingBlogPosts || loadingPodcasts
  };
};
