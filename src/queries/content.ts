
import { supabase } from '@/integrations/supabase/client';
import type { BlogPost } from '@/types/content';
import { WEATHER_BASE_URL, WEATHER_LATITUDE, WEATHER_LONGITUDE, WEATHER_TIMEZONE } from '@/config/weather.config';
import { isBlogPost, isWeatherResponse, isHourlyWeatherResponse } from '@/utils/typeguards';

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

export interface HourlyPrecipitation {
  time: string[];
  precipitation: number[];
}

export const fetchHourlyPrecipitation = async (
  latitude: number | string = WEATHER_LATITUDE,
  longitude: number | string = WEATHER_LONGITUDE,
  timezone: string = WEATHER_TIMEZONE
): Promise<HourlyPrecipitation> => {
  const url = `${WEATHER_BASE_URL}?latitude=${encodeURIComponent(String(latitude))}&longitude=${encodeURIComponent(String(longitude))}&hourly=precipitation&forecast_days=1&timezone=${encodeURIComponent(timezone)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Weather request failed with status ${res.status}`);
    }
    const data = await res.json();
    if (!isHourlyWeatherResponse(data)) {
      throw new Error('Invalid weather API response');
    }
    return {
      time: data.hourly.time,
      precipitation: data.hourly.precipitation,
    };
  } catch (err) {
    throw new Error(`Error fetching weather data: ${err instanceof Error ? err.message : String(err)}`);
  }
};

export interface CombinedWeatherData {
  dailyPrecipitation: number | null;
  hourly: HourlyPrecipitation;
}

export const fetchCombinedWeatherData = async (
  latitude: number | string = WEATHER_LATITUDE,
  longitude: number | string = WEATHER_LONGITUDE,
  timezone: string = WEATHER_TIMEZONE
): Promise<CombinedWeatherData> => {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: 'precipitation_sum',
    hourly: 'precipitation',
    forecast_days: '1',
    timezone
  });
  const url = `${WEATHER_BASE_URL}?${params.toString()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Weather request failed with status ${res.status}`);
    }
    const data = await res.json();
    if (!isWeatherResponse(data) || !isHourlyWeatherResponse(data)) {
      throw new Error('Invalid weather API response');
    }
    return {
      dailyPrecipitation: data.daily.precipitation_sum[0] ?? null,
      hourly: {
        time: data.hourly.time,
        precipitation: data.hourly.precipitation,
      },
    };
  } catch (err) {
    throw new Error(
      `Error fetching weather data: ${err instanceof Error ? err.message : String(err)}`
    );
  }
};

export const fetchCityName = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${encodeURIComponent(
    String(latitude)
  )}&longitude=${encodeURIComponent(String(longitude))}&count=1&language=de`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Geocoding request failed with status ${res.status}`);
    }
    const data = await res.json();
    if (
      data &&
      Array.isArray(data.results) &&
      data.results.length > 0 &&
      typeof data.results[0].name === 'string'
    ) {
      return data.results[0].name as string;
    }
    return null;
  } catch (err) {
    console.error('Error fetching city name:', err);
    return null;
  }
};
