import React, { useEffect, useState } from 'react';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { fetchSuggestedPostsByWeather } from '@/services/WeatherPostService';
import { WEATHER_LATITUDE, WEATHER_LONGITUDE, WEATHER_TIMEZONE } from '@/config/weather.config';
import type { BlogPost } from '@/types/content';

const SuggestedPostsSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fallback = () =>
      loadPosts(Number(WEATHER_LATITUDE), Number(WEATHER_LONGITUDE));
    if (!navigator.geolocation) {
      fallback();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => loadPosts(pos.coords.latitude, pos.coords.longitude),
      fallback
    );
  }, []);

  const loadPosts = async (lat: number, lon: number) => {
    try {
      const res = await fetchSuggestedPostsByWeather(lat, lon, WEATHER_TIMEZONE);
      setPosts(res);
    } catch (e) {
      setError('Vorschläge konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4 text-center">
        <p className="text-sage-600">Lade Empfehlungen...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 text-center">
        <p className="text-sage-600">{error}</p>
      </section>
    );
  }

  if (!posts.length) return null;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-8 text-center">
          Empfohlene Beiträge für dein Wetter
        </h2>
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
