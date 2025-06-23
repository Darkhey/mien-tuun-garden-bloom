
import { supabase } from '@/integrations/supabase/client';
import type { BlogPost } from '@/types/content';
import { fetchRainForecastWithCoords } from '@/queries/content';

export async function fetchSuggestedPostsByWeather(
  latitude: number,
  longitude: number,
  timezone: string
): Promise<BlogPost[]> {
  const rain = await fetchRainForecastWithCoords(latitude, longitude, timezone);
  const tag = rain !== null && rain > 0 ? 'regen' : 'sonnig';
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .contains('tags', [tag])
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
}
