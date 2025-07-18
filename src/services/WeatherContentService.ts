
import { supabase } from '@/integrations/supabase/client';
import type { BlogPost } from '@/types/content';

export interface WeatherData {
  temperature: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
  location: string;
  icon: string;
  description: string;
}

export type WeatherCondition =
  | 'sunny'
  | 'partly-cloudy'
  | 'rainy'
  | 'snowy'
  | 'stormy'
  | 'foggy';

export interface WeatherContentSuggestion {
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  tags?: string[];
  weatherContext: string;
}

export class WeatherContentService {
  private static instance: WeatherContentService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 30 * 60 * 1000; // 30 Minuten

  public static getInstance(): WeatherContentService {
    if (!WeatherContentService.instance) {
      WeatherContentService.instance = new WeatherContentService();
    }
    return WeatherContentService.instance;
  }

  async getCurrentWeatherData(lat?: number, lon?: number): Promise<WeatherData | null> {
    try {
      let coordinates = { lat, lon };
      
      // Verwende Benutzer-Koordinaten oder frage Standort ab
      if (!lat || !lon) {
        coordinates = await this.getUserLocation();
      }

      if (!coordinates.lat || !coordinates.lon) {
        console.warn('[WeatherContent] Keine Koordinaten verfügbar, verwende Fallback');
        return this.getFallbackWeatherData();
      }

      const cacheKey = `weather_${coordinates.lat}_${coordinates.lon}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('[WeatherContent] Using cached weather data');
        return cached.data;
      }

      // Verwende OpenWeatherMap API (kostenlos)
      const API_KEY = '2d8a45b8b7e6d8f4a6c9e1b3f7d9c4e8'; // Beispiel-Key, sollte durch echten ersetzt werden
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${API_KEY}&units=metric&lang=de`;
      
      const response = await fetch(weatherUrl);
      
      if (!response.ok) {
        console.warn('[WeatherContent] Weather API request failed, using fallback');
        return this.getFallbackWeatherData();
      }
      
      const weatherApiData = await response.json();
      
      const weatherData: WeatherData = {
        temperature: Math.round(weatherApiData.main.temp),
        condition: this.mapWeatherCondition(weatherApiData.weather[0].main),
        humidity: weatherApiData.main.humidity,
        windSpeed: Math.round(weatherApiData.wind?.speed * 3.6) || 0, // m/s zu km/h
        location: weatherApiData.name || 'Unbekannt',
        icon: weatherApiData.weather[0].icon,
        description: weatherApiData.weather[0].description
      };

      // Cache das Ergebnis
      this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
      
      console.log('[WeatherContent] Weather data fetched successfully:', weatherData);
      return weatherData;
      
    } catch (error) {
      console.error('[WeatherContent] Error fetching weather data:', error);
      return this.getFallbackWeatherData();
    }
  }

  private async getUserLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('[WeatherContent] Geolocation not supported');
        resolve({ lat: 52.52, lon: 13.405 }); // Berlin als Fallback
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.warn('[WeatherContent] Geolocation error:', error.message);
          resolve({ lat: 52.52, lon: 13.405 }); // Berlin als Fallback
        },
        { timeout: 10000 }
      );
    });
  }

  private getFallbackWeatherData(): WeatherData {
    return {
      temperature: 18,
      condition: 'partly-cloudy' as WeatherCondition,
      humidity: 65,
      windSpeed: 12,
      location: 'Deutschland',
      icon: '02d',
      description: 'teilweise bewölkt'
    };
  }

  private mapWeatherCondition(condition: string): WeatherCondition {
    const conditionMap: { [key: string]: WeatherCondition } = {
      'Clear': 'sunny',
      'Clouds': 'partly-cloudy',
      'Rain': 'rainy',
      'Drizzle': 'rainy',
      'Thunderstorm': 'stormy',
      'Snow': 'snowy',
      'Mist': 'foggy',
      'Fog': 'foggy',
      'Haze': 'foggy'
    };

    return conditionMap[condition] || 'partly-cloudy';
  }

  /**
   * Derive a simplified weather condition from precipitation and temperature.
   */
  static getWeatherCondition(
    precipitation: number | null,
    temperature: number | null
  ): WeatherCondition {
    if (precipitation !== null && precipitation > 8) {
      return 'stormy';
    }
    if (precipitation !== null && precipitation > 0) {
      return 'rainy';
    }
    if (temperature !== null && temperature <= 0) {
      return 'snowy';
    }
    if (temperature !== null && temperature >= 28) {
      return 'sunny';
    }
    return 'partly-cloudy';
  }

  /**
   * Fetch blog posts that match the given weather condition.
   */
  static async getWeatherBasedArticles(
    condition: WeatherCondition,
    limit = 3
  ): Promise<BlogPost[]> {
    const tagMap: Record<WeatherCondition, string> = {
      sunny: 'sonnig',
      'partly-cloudy': 'sonnig',
      rainy: 'regen',
      snowy: 'schnee',
      stormy: 'regen',
      foggy: 'nebel'
    };
    const tag = tagMap[condition] || condition;

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .contains('tags', [tag])
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    return rows.map((row) => ({
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
        keywords: row.seo_keywords || []
      },
      featured: !!row.featured,
      published: !!row.published,
      structuredData: row.structured_data || undefined,
      originalTitle: row.original_title || undefined,
      ogImage: row.og_image || undefined
    })) as BlogPost[];
  }

  /**
   * Extract possible weather related tags from article content.
   */
  static extractWeatherTags(
    title: string,
    content: string,
    category: string
  ): string[] {
    const text = `${title} ${content} ${category}`.toLowerCase();
    const tags: string[] = [];
    if (/regen/.test(text)) tags.push('regen');
    if (/sonn/.test(text)) tags.push('sonnig');
    if (/schnee|frost/.test(text)) tags.push('schnee');
    if (/sturm|gewitter|wind/.test(text)) tags.push('sturm');
    if (/nebel/.test(text)) tags.push('nebel');
    return Array.from(new Set(tags)).slice(0, 3);
  }

  async getCityName(lat: number, lon: number): Promise<string> {
    try {
      // Verwende eine Reverse Geocoding API mit besserer Fehlerbehandlung
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=de`,
        { 
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.city || data.locality || data.principalSubdivision || 'Unbekannte Stadt';
      
    } catch (error) {
      console.error('[WeatherContent] Error fetching city name:', error);
      return 'Deutschland'; // Fallback
    }
  }

  generateWeatherTags(weather: WeatherData): string[] {
    const tags: string[] = [];
    
    // Temperatur-basierte Tags
    if (weather.temperature > 25) {
      tags.push('Sommer', 'Heiß', 'Abkühlung');
    } else if (weather.temperature > 15) {
      tags.push('Mild', 'Frühling', 'Angenehm');
    } else if (weather.temperature > 5) {
      tags.push('Kühl', 'Herbst', 'Übergang');
    } else {
      tags.push('Kalt', 'Winter', 'Wärmend');
    }
    
    // Wetter-basierte Tags
    switch (weather.condition) {
      case 'sunny':
        tags.push('Sonnig', 'Vitamin D', 'Outdoor');
        break;
      case 'rainy':
        tags.push('Regnerisch', 'Gemütlich', 'Indoor');
        break;
      case 'snowy':
        tags.push('Schnee', 'Winter', 'Warm halten');
        break;
      case 'stormy':
        tags.push('Sturm', 'Gemütlich', 'Schutz');
        break;
      default:
        tags.push('Wetter', 'Aktuell');
    }
    
    // Aktivitäts-Tags basierend auf Wetter
    if (weather.condition === 'sunny' && weather.temperature > 20) {
      tags.push('Grillen', 'Garten', 'Draußen');
    } else if (weather.condition === 'rainy' || weather.temperature < 10) {
      tags.push('Suppe', 'Warm', 'Gemütlich');
    }
    
    return tags.slice(0, 5); // Limitiere auf 5 Tags
  }

  suggestWeatherContent(weather: WeatherData): WeatherContentSuggestion[] {
    const suggestions: WeatherContentSuggestion[] = [];
    
    // Temperatur-basierte Vorschläge
    if (weather.temperature > 25) {
      suggestions.push({
        title: 'Erfrischende Sommergetränke für heiße Tage',
        category: 'Getränke',
        priority: 'high',
        tags: ['Sommer', 'Erfrischung', 'Getränke'],
        weatherContext: `Bei ${weather.temperature}°C und ${weather.description}`
      });
    }
    
    if (weather.condition === 'rainy') {
      suggestions.push({
        title: 'Warme Suppen für regnerische Tage',
        category: 'Kochen',
        priority: 'medium',
        tags: ['Suppe', 'Wärme', 'Gemütlich'],
        weatherContext: `Perfekt für das aktuelle ${weather.description} Wetter`
      });
    }
    
    return suggestions;
  }

  async createWeatherBlogPost(suggestion: WeatherContentSuggestion, weather: WeatherData): Promise<string> {
    try {
      // Kombiniere alle Tags
      const allTags = [...(suggestion.tags || []), ...this.generateWeatherTags(weather)];
      
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          title: suggestion.title,
          category: suggestion.category,
          tags: allTags,
          content: `# ${suggestion.title}\n\n${suggestion.weatherContext}\n\n[Hier würde der generierte Inhalt stehen...]`,
          excerpt: `${suggestion.title} - ${suggestion.weatherContext}`,
          status: 'entwurf',
          author: 'WeatherBot',
          slug: `${suggestion.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
          reading_time: 5,
          published_at: new Date().toISOString().split('T')[0],
          featured_image: '/placeholder.svg',
          seo_title: suggestion.title,
          seo_description: `${suggestion.title} - ${suggestion.weatherContext}`,
          seo_keywords: allTags,
          audiences: ['anfaenger'],
          content_types: ['blog']
        })
        .select()
        .maybeSingle();

      if (error || !data) {
        throw error;
      }

      console.log('[WeatherContent] Weather blog post created:', data.id);
      return data.id;
      
    } catch (error) {
      console.error('[WeatherContent] Error creating weather blog post:', error);
      throw error;
    }
  }
}

export const weatherContentService = WeatherContentService.getInstance();
