import React, { useState, useEffect } from 'react';
import { getRandomUnsplashImage } from '@/utils/unsplashService';

type BlogPostImageProps = {
  src: string;
  alt: string;
  category?: string;
};

// Universal garden fallback image
const GARDEN_FALLBACK_IMAGE = "/lovable-uploads/2a3ad273-430b-4675-b1c4-33dbaac0b6cf.png";

const BlogPostImage: React.FC<BlogPostImageProps> = ({ src, alt, category }) => {
  const [imgError, setImgError] = useState(false);
  const [fallbackImage, setFallbackImage] = useState<string | null>(null);

  useEffect(() => {
    // If the image source is empty or invalid, try to get a fallback from Unsplash
    if (!src || src === '/placeholder.svg' || src.trim() === '') {
      fetchFallbackImage();
    }
  }, [src, category]);

  const fetchFallbackImage = async () => {
    try {
      // Use the category and alt text to find a relevant image
      const searchQuery = category || alt || 'garden nature';
      const image = await getRandomUnsplashImage(searchQuery);
      
      if (image) {
        setFallbackImage(image.urls.regular);
      }
    } catch (error) {
      console.warn('Error fetching fallback image:', error);
      // Use garden fallback if Unsplash fails
      setFallbackImage(GARDEN_FALLBACK_IMAGE);
    }
  };

  function getImageUrl(imagePath: string): string {
    if (!imagePath || imagePath.trim() === '') return fallbackImage || GARDEN_FALLBACK_IMAGE;
    
    // If it's already a full URL, use it directly
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it's a placeholder, use fallback
    if (imagePath === '/placeholder.svg' || imagePath === 'placeholder.svg') {
      return fallbackImage || GARDEN_FALLBACK_IMAGE;
    }
    
    // Otherwise, assume it's a path in the Supabase storage
    const SUPABASE_BLOG_IMG_URL = "https://ublbxvpmoccmegtwaslh.supabase.co/storage/v1/object/public/blog-images/";
    return SUPABASE_BLOG_IMG_URL + imagePath;
  }

  const handleImageError = () => {
    setImgError(true);
    if (!fallbackImage) {
      setFallbackImage(GARDEN_FALLBACK_IMAGE);
    }
  };

  const imageSource = imgError 
    ? (fallbackImage || GARDEN_FALLBACK_IMAGE) 
    : getImageUrl(src);

  return (
    <div className="mb-12 relative">
      <img
        src={imageSource}
        alt={alt}
        className="w-full h-96 object-cover rounded-xl shadow-lg"
        onError={handleImageError}
      />
      {imageSource.includes('unsplash.com') && (
        <div className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
          Photo by Unsplash
        </div>
      )}
    </div>
  );
};

export default BlogPostImage;
