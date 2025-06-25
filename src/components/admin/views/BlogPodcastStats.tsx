
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2 } from 'lucide-react';

interface BlogPodcastStatsProps {
  podcastCount: number;
  blogPostsWithPodcast: number;
  blogPostsWithoutPodcast: number;
  totalBlogPosts: number;
}

const BlogPodcastStats: React.FC<BlogPodcastStatsProps> = ({
  podcastCount,
  blogPostsWithPodcast,
  blogPostsWithoutPodcast,
  totalBlogPosts
}) => {
  return (
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
            <p className="text-xl font-semibold">{totalBlogPosts}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPodcastStats;
