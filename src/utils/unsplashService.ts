import { createApi } from 'unsplash-js';

// Initialize the Unsplash API client with your credentials
const unsplashAccessKey = 'pRdPBWAClQA1MvFuUmY70cOZo_jcB5ufrO17GpnKxqs';
const unsplash = createApi({ accessKey: unsplashAccessKey });

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

/**
 * Search for images on Unsplash based on keywords
 * @param query Search query
 * @param page Page number
 * @param perPage Number of results per page
 * @returns Array of Unsplash images
 */
export async function searchUnsplashImages(
  query: string,
  page: number = 1,
  perPage: number = 10
): Promise<UnsplashImage[]> {
  try {
    // If no API key is set, return fallback images
    if (!unsplashAccessKey) {
      return getFallbackImages(query);
    }

    const result = await unsplash.search.getPhotos({
      query,
      page,
      perPage,
      orientation: 'landscape',
    });

    if (result.errors) {
      console.error('Unsplash API error:', result.errors);
      return getFallbackImages(query);
    }

    return result.response?.results || [];
  } catch (error) {
    console.error('Error fetching images from Unsplash:', error);
    return getFallbackImages(query);
  }
}

/**
 * Get a random image from Unsplash based on keywords
 * @param query Search query
 * @returns A single Unsplash image
 */
export async function getRandomUnsplashImage(query: string): Promise<UnsplashImage | null> {
  try {
    // If no API key is set, return a fallback image
    if (!unsplashAccessKey) {
      const fallbacks = getFallbackImages(query);
      return fallbacks.length > 0 ? fallbacks[0] : null;
    }

    const result = await unsplash.photos.getRandom({
      query,
      orientation: 'landscape',
    });

    if (result.errors) {
      console.error('Unsplash API error:', result.errors);
      const fallbacks = getFallbackImages(query);
      return fallbacks.length > 0 ? fallbacks[0] : null;
    }

    // Handle both single photo and multiple photos response
    const photo = Array.isArray(result.response) 
      ? result.response[0] 
      : result.response;
    
    return photo || null;
  } catch (error) {
    console.error('Error fetching random image from Unsplash:', error);
    const fallbacks = getFallbackImages(query);
    return fallbacks.length > 0 ? fallbacks[0] : null;
  }
}

/**
 * Get a relevant image for a blog post based on its content
 * @param title Blog post title
 * @param content Blog post content
 * @param category Blog post category
 * @returns A suitable Unsplash image
 */
export async function getBlogPostImage(
  title: string,
  content: string,
  category?: string
): Promise<UnsplashImage | null> {
  // Extract keywords from title and content
  const keywords = extractKeywords(title, content, category);
  
  // Join keywords into a search query
  const searchQuery = keywords.slice(0, 3).join(' ');
  
  return await getRandomUnsplashImage(searchQuery);
}

/**
 * Extract relevant keywords from blog post title and content
 */
function extractKeywords(title: string, content: string, category?: string): string[] {
  const keywords: string[] = [];
  
  // Add category if available
  if (category) {
    keywords.push(category);
  }
  
  // Add first word from title (usually most relevant)
  const titleWords = title.split(' ');
  if (titleWords.length > 0) {
    keywords.push(titleWords[0]);
  }
  
  // Add common garden/kitchen keywords based on content
  const gardenKeywords = ['garden', 'plant', 'flower', 'vegetable', 'herb', 'nature'];
  const kitchenKeywords = ['food', 'cooking', 'recipe', 'kitchen', 'meal', 'dish'];
  
  // Check if content contains any of these keywords
  const contentLower = content.toLowerCase();
  const matchingGardenKeywords = gardenKeywords.filter(kw => contentLower.includes(kw));
  const matchingKitchenKeywords = kitchenKeywords.filter(kw => contentLower.includes(kw));
  
  // Add the most relevant keyword
  if (matchingGardenKeywords.length > 0) {
    keywords.push(matchingGardenKeywords[0]);
  } else if (matchingKitchenKeywords.length > 0) {
    keywords.push(matchingKitchenKeywords[0]);
  }
  
  return keywords;
}

/**
 * Fallback images when Unsplash API is not available
 */
function getFallbackImages(query: string): UnsplashImage[] {
  // Map of categories to fallback images
  const fallbackImageMap: Record<string, UnsplashImage> = {
    garden: {
      id: 'garden-fallback',
      urls: {
        raw: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b',
        full: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200',
        regular: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
        small: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        thumb: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200',
      },
      alt_description: 'Garden with flowers and plants',
      description: 'Beautiful garden with various plants and flowers',
      user: {
        name: 'Unsplash',
        username: 'unsplash',
      },
    },
    kitchen: {
      id: 'kitchen-fallback',
      urls: {
        raw: 'https://images.unsplash.com/photo-1556911220-bff31c812dba',
        full: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200',
        regular: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
        small: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400',
        thumb: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200',
      },
      alt_description: 'Kitchen with cooking ingredients',
      description: 'Modern kitchen with fresh cooking ingredients',
      user: {
        name: 'Unsplash',
        username: 'unsplash',
      },
    },
    nature: {
      id: 'nature-fallback',
      urls: {
        raw: 'https://images.unsplash.com/photo-1501854140801-50d01698950b',
        full: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200',
        regular: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800',
        small: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400',
        thumb: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200',
      },
      alt_description: 'Nature landscape with mountains and forest',
      description: 'Beautiful nature landscape with mountains and forest',
      user: {
        name: 'Unsplash',
        username: 'unsplash',
      },
    },
    food: {
      id: 'food-fallback',
      urls: {
        raw: 'https://images.unsplash.com/photo-1542838132-92c53300491e',
        full: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
        regular: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
        small: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
        thumb: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
      },
      alt_description: 'Fresh food ingredients',
      description: 'Fresh and healthy food ingredients',
      user: {
        name: 'Unsplash',
        username: 'unsplash',
      },
    },
    default: {
      id: 'default-fallback',
      urls: {
        raw: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43',
        full: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200',
        regular: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
        small: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        thumb: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
      },
      alt_description: 'Generic nature scene',
      description: 'Generic nature scene',
      user: {
        name: 'Unsplash',
        username: 'unsplash',
      },
    },
  };

  // Determine which fallback to use based on query
  const queryLower = query.toLowerCase();
  let fallbackKey = 'default';

  if (queryLower.includes('garden') || queryLower.includes('plant') || queryLower.includes('flower')) {
    fallbackKey = 'garden';
  } else if (queryLower.includes('kitchen') || queryLower.includes('cook') || queryLower.includes('recipe')) {
    fallbackKey = 'kitchen';
  } else if (queryLower.includes('nature') || queryLower.includes('landscape')) {
    fallbackKey = 'nature';
  } else if (queryLower.includes('food') || queryLower.includes('meal') || queryLower.includes('dish')) {
    fallbackKey = 'food';
  }

  return [fallbackImageMap[fallbackKey]];
}

export default {
  searchUnsplashImages,
  getRandomUnsplashImage,
  getBlogPostImage,
};