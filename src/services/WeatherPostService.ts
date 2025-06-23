import { supabase } from '@/integrations/supabase/client';
import type { BlogPost } from '@/types/content';
import { fetchRainForecast } from '@/queries/content';
import { isBlogPost } from '@/utils/typeguards';

export async function fetchSuggestedPostsByWeather(
  latitude: number,
  longitude: number,
  timezone: string
): Promise<BlogPost[]> {
  const rain = await fetchRainForecast(latitude, longitude, timezone);
  const tag = rain !== null && rain > 0 ? 'regen' : 'sonnig';
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .contains('tags', [tag])
    .order('published_at', { ascending: false })
    .limit(3);
  if (error) throw error;
  const rows = Array.isArray(data) ? data.filter(isBlogPost) : [];
  return rows as BlogPost[];
}
