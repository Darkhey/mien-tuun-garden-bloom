import React, { useEffect, useState } from 'react';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { fetchSuggestedPostsByWeather } from '@/services/WeatherPostService';
import { WEATHER_LATITUDE, WEATHER_LONGITUDE, WEATHER_TIMEZONE } from '@/config/weather.config';
import type { BlogPost } from '@/types/content';
import { Sparkles } from 'lucide-react';

const SuggestedPostsSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestedPostsByWeather(Number(WEATHER_LATITUDE), Number(WEATHER_LONGITUDE), WEATHER_TIMEZONE)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-10 bg-muted rounded w-80 mx-auto mb-8"></div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="bg-muted rounded-2xl h-96"></div>)}
          </div>
        </div>
      </section>
    );
  }

  if (!posts.length) return null;

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 garden-badge mb-4 text-sm">
            <Sparkles className="w-4 h-4" /> Für dich empfohlen
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Passend zu deinem Wetter
          </h2>
          <p className="text-muted-foreground text-lg">
            Artikel, die gerade besonders relevant für deinen Garten sind
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuggestedPostsSection;
