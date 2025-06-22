
import { unifiedImageService, type UnsplashImage } from '@/services/UnifiedImageService';

// Re-export types for backward compatibility
export type { UnsplashImage };

/**
 * @deprecated Use unifiedImageService.searchUnsplashImages() instead
 * Search for images on Unsplash based on keywords (now uses secure Edge Function)
 */
export async function searchUnsplashImages(
  query: string,
  page: number = 1,
  perPage: number = 10
): Promise<UnsplashImage[]> {
  console.warn('searchUnsplashImages is deprecated. Use unifiedImageService.searchUnsplashImages() instead.');
  return unifiedImageService.searchUnsplashImages(query, page, perPage);
}

/**
 * @deprecated Use unifiedImageService.searchUnsplashSecure() instead
 * Get a random image from Unsplash based on keywords (now uses secure Edge Function)
 */
export async function getRandomUnsplashImage(query: string): Promise<UnsplashImage | null> {
  console.warn('getRandomUnsplashImage is deprecated. Use unifiedImageService.searchUnsplashSecure() instead.');
  return unifiedImageService.searchUnsplashSecure(query);
}

/**
 * @deprecated Use unifiedImageService.getImageForContent() instead
 * Get a relevant image for a blog post based on its content
 */
export async function getBlogPostImage(
  title: string,
  content: string,
  category?: string,
  tags?: string[]
): Promise<UnsplashImage | null> {
  console.warn('getBlogPostImage is deprecated. Use unifiedImageService.getImageForContent() instead.');
  
  try {
    const imageUrl = await unifiedImageService.getImageForContent({
      title,
      content,
      category,
      tags,
      preferredSource: 'unsplash'
    });
    
    // Return a mock UnsplashImage object for backward compatibility
    return {
      id: 'unified-service',
      urls: {
        raw: imageUrl,
        full: imageUrl,
        regular: imageUrl,
        small: imageUrl,
        thumb: imageUrl,
      },
      alt_description: title,
      description: title,
      user: { name: 'Unified Service', username: 'unified' },
    };
  } catch (error) {
    console.error('Error getting blog post image:', error);
    return null;
  }
}

export default {
  searchUnsplashImages,
  getRandomUnsplashImage,
  getBlogPostImage,
};
