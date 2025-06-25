
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Volume2, RefreshCw } from 'lucide-react';
import BlogPodcastFilter from './views/BlogPodcastFilter';
import BlogPodcastList from './views/BlogPodcastList';
import BlogPodcastStats from './views/BlogPodcastStats';
import { Button } from '@/components/ui/button';
import { usePodcastData } from './hooks/usePodcastData';
import { usePodcastActions } from './hooks/usePodcastActions';

const BlogPodcastManager: React.FC = () => {
  const {
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
    isLoading
  } = usePodcastData();

  const {
    generatingIds,
    generatePodcastForPost,
    handlePlayPodcast,
    handleDownloadPodcast
  } = usePodcastActions(refetchPodcasts, refetchBlogPosts);

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
      <BlogPodcastStats
        podcastCount={podcastCount}
        blogPostsWithPodcast={blogPostsWithPodcast}
        blogPostsWithoutPodcast={blogPostsWithoutPodcast}
        totalBlogPosts={blogPosts.length}
      />

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
