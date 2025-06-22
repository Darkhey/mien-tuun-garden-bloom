
import { supabase } from '@/integrations/supabase/client';
import { extractTagsFromText } from '@/utils/tagExtractor';

export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  description: string;
  user: {
    name: string;
    username: string;
  };
}

export interface ImageSearchResult {
  results: UnsplashImage[];
  total: number;
  total_pages: number;
}

// Unified fallback images
const FALLBACK_IMAGES: Record<string, string[]> = {
  garden: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=600&fit=crop",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=600&fit=crop",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=600&fit=crop"
  ],
  kitchen: [
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&h=600&fit=crop",
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=600&fit=crop",
    "https://images.unsplash.com/photo-1586093728648-04db0bd4c827?w=1200&h=600&fit=crop"
  ],
  food: [
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop"
  ],
  default: [
    "/lovable-uploads/2a3ad273-430b-4675-b1c4-33dbaac0b6cf.png",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop"
  ]
};

class UnifiedImageService {
  private static instance: UnifiedImageService;

  public static getInstance(): UnifiedImageService {
    if (!UnifiedImageService.instance) {
      UnifiedImageService.instance = new UnifiedImageService();
    }
    return UnifiedImageService.instance;
  }

  /**
   * Get image with priority: AI-generated > Unsplash > Fallback
   */
  async getImageForContent(options: {
    title: string;
    content?: string;
    category?: string;
    tags?: string[];
    preferredSource?: 'ai' | 'unsplash' | 'fallback';
  }): Promise<string> {
    const { title, content, category, tags, preferredSource = 'unsplash' } = options;

    try {
      // Priority 1: Check if AI-generated image exists
      if (preferredSource !== 'fallback') {
        // Try to find existing AI-generated image first
        // This would be implemented when we have AI image generation
      }

      // Priority 2: Get from Unsplash (secure)
      if (preferredSource === 'unsplash' || preferredSource === 'ai') {
        try {
          const searchQuery = this.buildSearchQuery(title, content, category, tags);
          const unsplashImage = await this.searchUnsplashSecure(searchQuery);
          if (unsplashImage) {
            return unsplashImage.urls.regular;
          }
        } catch (error) {
          console.warn('Unsplash search failed, using fallback:', error);
        }
      }

      // Priority 3: Use fallback
      return this.getFallbackImage(category);
    } catch (error) {
      console.error('Error getting image:', error);
      return this.getFallbackImage(category);
    }
  }

  /**
   * Search Unsplash securely via Edge Function
   */
  async searchUnsplashSecure(
    query: string,
    options: {
      page?: number;
      perPage?: number;
      orientation?: string;
    } = {}
  ): Promise<UnsplashImage | null> {
    try {
      const { data, error } = await supabase.functions.invoke('unsplash-image-search', {
        body: {
          query,
          page: options.page || 1,
          perPage: options.perPage || 1,
          orientation: options.orientation || 'landscape'
        }
      });

      if (error) {
        throw error;
      }

      return data?.results?.[0] || null;
    } catch (error) {
      console.error('Secure Unsplash search failed:', error);
      return null;
    }
  }

  /**
   * Search multiple Unsplash images securely
   */
  async searchUnsplashImages(
    query: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<UnsplashImage[]> {
    try {
      const { data, error } = await supabase.functions.invoke('unsplash-image-search', {
        body: { query, page, perPage }
      });

      if (error) {
        throw error;
      }

      return data?.results || [];
    } catch (error) {
      console.error('Unsplash search failed:', error);
      return [];
    }
  }

  /**
   * Get fallback image based on category
   */
  getFallbackImage(category?: string): string {
    const categoryKey = this.getCategoryKey(category);
    const images = FALLBACK_IMAGES[categoryKey] || FALLBACK_IMAGES.default;
    return images[Math.floor(Math.random() * images.length)];
  }

  /**
   * Build search query from content
   */
  private buildSearchQuery(title: string, content?: string, category?: string, tags?: string[]): string {
    const keywords: string[] = [];

    if (tags && tags.length) {
      keywords.push(...tags.slice(0, 2));
    }
    
    // Add category
    if (category) {
      keywords.push(category);
    }
    
    // Add first meaningful word from title
    const titleWords = title.split(' ').filter(word => word.length > 3);
    if (titleWords.length > 0) {
      keywords.push(titleWords[0]);
    }
    
    // Add content-based keywords
    if (content) {
      const gardenKeywords = ['garten', 'pflanzen', 'blumen', 'gemüse', 'kräuter'];
      const kitchenKeywords = ['kochen', 'rezept', 'küche', 'essen', 'zubereitung'];

      const contentLower = content.toLowerCase();
      const matchingGarden = gardenKeywords.find(kw => contentLower.includes(kw));
      const matchingKitchen = kitchenKeywords.find(kw => contentLower.includes(kw));

      if (matchingGarden) {
        keywords.push('garden');
      } else if (matchingKitchen) {
        keywords.push('cooking');
      } else if (!tags || tags.length === 0) {
        const extracted = extractTagsFromText(content, 2);
        keywords.push(...extracted);
      }
    }
    
    return Array.from(new Set(keywords)).slice(0, 3).join(' ') || 'nature';
  }

  /**
   * Get category key for fallback selection
   */
  private getCategoryKey(category?: string): string {
    if (!category) return 'default';
    
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('garten') || categoryLower.includes('garden')) {
      return 'garden';
    }
    if (categoryLower.includes('koch') || categoryLower.includes('küche') || categoryLower.includes('kitchen')) {
      return 'kitchen';
    }
    if (categoryLower.includes('food') || categoryLower.includes('essen')) {
      return 'food';
    }
    
    return 'default';
  }

  /**
   * Optimize Unsplash URL with parameters
   */
  optimizeUnsplashUrl(url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}): string {
    if (!url.includes('unsplash.com')) {
      return url;
    }

    try {
      const urlObj = new URL(url);
      const { width, height, quality = 85, format = 'auto' } = options;
      
      if (width) urlObj.searchParams.set('w', width.toString());
      if (height) urlObj.searchParams.set('h', height.toString());
      urlObj.searchParams.set('q', quality.toString());
      urlObj.searchParams.set('fm', format);
      urlObj.searchParams.set('fit', 'crop');
      urlObj.searchParams.set('auto', 'format');
      
      return urlObj.toString();
    } catch (error) {
      console.warn('Failed to optimize Unsplash URL:', error);
      return url;
    }
  }
}

export const unifiedImageService = UnifiedImageService.getInstance();
export default unifiedImageService;
