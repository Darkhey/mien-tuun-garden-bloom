
import { supabase } from '@/integrations/supabase/client';
import type { BlogPost } from '@/types/content';
import { WEATHER_BASE_URL, WEATHER_LATITUDE, WEATHER_LONGITUDE, WEATHER_TIMEZONE } from '@/config/weather.config';
import { isBlogPost, isWeatherResponse } from '@/utils/typeguards';

export interface CommentRow {
  id: string;
  blog_slug: string;
  content: string;
  created_at: string;
}

export const fetchLatestPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(3);
  if (error) throw error;
  
  const rows = Array.isArray(data) ? data : [];
  const posts = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    author: row.author,
    publishedAt: row.published_at,
    updatedAt: row.updated_at || undefined,
    featuredImage: row.featured_image || '/placeholder.svg',
    category: row.category || '',
    tags: row.tags || [],
    readingTime: row.reading_time || 5,
    seo: {
      title: row.seo_title || row.title,
      description: row.seo_description || '',
      keywords: row.seo_keywords || [],
    },
    featured: !!row.featured,
    published: !!row.published,
    structuredData: row.structured_data || undefined,
    originalTitle: row.original_title || undefined,
    ogImage: row.og_image || undefined,
  })) as BlogPost[];
  return posts;
};

export const fetchLatestComments = async (): Promise<CommentRow[]> => {
  const { data, error } = await supabase
    .from('blog_comments')
    .select('id, blog_slug, content, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  if (error) throw error;
  return data || [];
};

export const fetchRainForecast = async (): Promise<number | null> => {
  const latitude = WEATHER_LATITUDE;
  const longitude = WEATHER_LONGITUDE;
  const timezone = WEATHER_TIMEZONE;
  
  const url = `${WEATHER_BASE_URL}?latitude=${encodeURIComponent(String(latitude))}&longitude=${encodeURIComponent(String(longitude))}&daily=precipitation_sum&timezone=${encodeURIComponent(timezone)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Weather request failed with status ${res.status}`);
    }
    const data = await res.json();
    if (!isWeatherResponse(data)) {
      throw new Error('Invalid weather API response');
    }
    return data.daily.precipitation_sum[0] ?? null;
  } catch (err) {
    throw new Error(`Error fetching weather data: ${err instanceof Error ? err.message : String(err)}`);
  }
};

export const fetchRainForecastWithCoords = async (
  latitude: number | string = WEATHER_LATITUDE,
  longitude: number | string = WEATHER_LONGITUDE,
  timezone: string = WEATHER_TIMEZONE
): Promise<number | null> => {
  const url = `${WEATHER_BASE_URL}?latitude=${encodeURIComponent(String(latitude))}&longitude=${encodeURIComponent(String(longitude))}&daily=precipitation_sum&timezone=${encodeURIComponent(timezone)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Weather request failed with status ${res.status}`);
    }
    const data = await res.json();
    if (!isWeatherResponse(data)) {
      throw new Error('Invalid weather API response');
    }
    return data.daily.precipitation_sum[0] ?? null;
  } catch (err) {
    throw new Error(`Error fetching weather data: ${err instanceof Error ? err.message : String(err)}`);
  }
};
