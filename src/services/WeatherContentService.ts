
import { supabase } from '@/integrations/supabase/client';
import type { BlogPost } from '@/types/content';

export type WeatherCondition = 'sunny' | 'rainy' | 'cloudy' | 'cold' | 'hot' | 'windy';

// Wetter-Zuordnungs-Map
const WEATHER_KEYWORDS = {
  sunny: [
    'garten', 'aussaat', 'pflanzen', 'ernten', 'umgraben', 'outdoor', 'terrasse',
    'balkon', 'sonnenschutz', 'bewässerung', 'mulchen', 'kompost'
  ],
  rainy: [
    'zimmerpflanzen', 'indoor', 'gießen', 'pflege', 'topfpflanzen', 'fensterbank',
    'überwinterung', 'stecklinge', 'vermehrung', 'düngen', 'umtopfen'
  ],
  cloudy: [
    'pflanzen', 'säen', 'umpflanzen', 'schneiden', 'rückschnitt', 'pflege',
    'düngen', 'boden', 'vorbereitung'
  ],
  cold: [
    'winterschutz', 'überwinterung', 'frostschutz', 'zimmerpflanzen', 'planung',
    'samenbestellung', 'werkzeugpflege', 'indoor'
  ],
  hot: [
    'bewässerung', 'sonnenschutz', 'mulchen', 'schatten', 'hitze', 'trockenheit',
    'wasserspeicher', 'früh gießen'
  ],
  windy: [
    'stabilisierung', 'windschutz', 'stützen', 'indoor', 'schutz', 'abdeckung'
  ]
};

export class WeatherContentService {
  // Extrahiert Wetter-Tags aus Artikel-Inhalt
  static extractWeatherTags(title: string, content: string, category: string): WeatherCondition[] {
    const text = `${title} ${content} ${category}`.toLowerCase();
    const detectedWeatherTags: WeatherCondition[] = [];

    Object.entries(WEATHER_KEYWORDS).forEach(([weather, keywords]) => {
      const matchCount = keywords.filter(keyword => text.includes(keyword)).length;
      if (matchCount > 0) {
        detectedWeatherTags.push(weather as WeatherCondition);
      }
    });

    return detectedWeatherTags;
  }

  // Bestimmt Wetter-Kondition basierend auf Niederschlag
  static getWeatherCondition(precipitation: number | null): WeatherCondition {
    if (precipitation === null) return 'cloudy';
    if (precipitation > 5) return 'rainy';
    if (precipitation > 0) return 'cloudy';
    return 'sunny';
  }

  // Holt passende Artikel für aktuelle Wetter-Kondition
  static async getWeatherBasedArticles(
    currentWeather: WeatherCondition,
    limit: number = 3
  ): Promise<BlogPost[]> {
    try {
      // Direkter Suche nach Wetter-Tags (falls vorhanden)
      const { data: weatherTaggedPosts, error: weatherError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .contains('weather_tags', [currentWeather])
        .order('published_at', { ascending: false })
        .limit(limit);

      if (weatherError) {
        console.warn('Weather tagged posts query failed:', weatherError);
      }

      // Fallback: Suche nach Keywords im Inhalt
      const keywords = WEATHER_KEYWORDS[currentWeather] || [];
      const { data: keywordPosts, error: keywordError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .or(keywords.map(keyword => `title.ilike.%${keyword}%,content.ilike.%${keyword}%`).join(','))
        .order('published_at', { ascending: false })
        .limit(limit);

      if (keywordError) {
        console.warn('Keyword posts query failed:', keywordError);
      }

      // Kombiniere Ergebnisse
      const allPosts = [...(weatherTaggedPosts || []), ...(keywordPosts || [])];
      const uniquePosts = allPosts.filter((post, index, self) => 
        index === self.findIndex(p => p.id === post.id)
      );

      return uniquePosts.slice(0, limit).map(this.mapToTypedBlogPost);
    } catch (error) {
      console.error('Error fetching weather-based articles:', error);
      return [];
    }
  }

  // Mappt Datenbank-Ergebnis zu TypeScript BlogPost
  private static mapToTypedBlogPost(row: any): BlogPost {
    return {
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
      weatherTags: row.weather_tags || [],
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
    };
  }

  // Generiert Wetter-Tags für bestehende Artikel
  static async generateWeatherTagsForArticle(articleId: string): Promise<WeatherCondition[]> {
    try {
      const { data: article, error } = await supabase
        .from('blog_posts')
        .select('title, content, category')
        .eq('id', articleId)
        .single();

      if (error || !article) {
        throw new Error(`Article not found: ${articleId}`);
      }

      const weatherTags = this.extractWeatherTags(
        article.title,
        article.content,
        article.category
      );

      // Speichere die generierten Tags
      await supabase
        .from('blog_posts')
        .update({ weather_tags: weatherTags })
        .eq('id', articleId);

      return weatherTags;
    } catch (error) {
      console.error('Error generating weather tags:', error);
      return [];
    }
  }
}
