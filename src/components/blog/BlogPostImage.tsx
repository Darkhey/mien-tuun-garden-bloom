import React, { useState, useEffect } from 'react';
import { unifiedImageService } from '@/services/UnifiedImageService';

type BlogPostImageProps = {
  src: string;
  alt: string;
  category?: string;
};

const BlogPostImage: React.FC<BlogPostImageProps> = ({ src, alt, category }) => {
  const [imgError, setImgError] = useState(false);
  const [fallbackImage, setFallbackImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If the image source is empty or invalid, try to get a better image
    if (!src || src === '/placeholder.svg' || src.trim() === '') {
      fetchBetterImage();
    }
  }, [src, category, alt]);

  const fetchBetterImage = async () => {
    setIsLoading(true);
    try {
      const imageUrl = await unifiedImageService.getImageForContent({
        title: alt,
        category,
        preferredSource: 'unsplash'
      });
      setFallbackImage(imageUrl);
    } catch (error) {
      console.warn('Error fetching better image:', error);
      setFallbackImage(unifiedImageService.getFallbackImage(category));
    } finally {
      setIsLoading(false);
    }
  };

  function getImageUrl(imagePath: string): string {
    if (!imagePath || imagePath.trim() === '') {
      return fallbackImage || unifiedImageService.getFallbackImage(category);
    }
    
    // If it's already a full URL, use it directly
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it's a placeholder, use fallback
    if (imagePath === '/placeholder.svg' || imagePath === 'placeholder.svg') {
      return fallbackImage || unifiedImageService.getFallbackImage(category);
    }
    
    // Otherwise, assume it's a path in the Supabase storage
    const SUPABASE_BLOG_IMG_URL = "https://ublbxvpmoccmegtwaslh.supabase.co/storage/v1/object/public/blog-images/";
    return SUPABASE_BLOG_IMG_URL + imagePath;
  }

  const handleImageError = () => {
    setImgError(true);
    if (!fallbackImage) {
      setFallbackImage(unifiedImageService.getFallbackImage(category));
    }
  };

  const imageSource = imgError 
    ? (fallbackImage || unifiedImageService.getFallbackImage(category))
    : getImageUrl(src);

  // Optimize Unsplash URLs
  const optimizedImageSource = unifiedImageService.optimizeUnsplashUrl(imageSource, {
    width: 1200,
    height: 400,
    quality: 85
  });

  return (
    <div className="mb-12 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-earth-100 animate-pulse flex items-center justify-center rounded-xl">
          <div className="w-8 h-8 border-2 border-sage-200 border-t-sage-600 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={optimizedImageSource}
        alt={alt}
        className="w-full h-96 object-cover rounded-xl shadow-lg"
        onError={handleImageError}
        loading="lazy"
      />
      {optimizedImageSource.includes('unsplash.com') && (
        <div className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
          Photo by Unsplash
        </div>
      )}
    </div>
  );
};

export default BlogPostImage;
