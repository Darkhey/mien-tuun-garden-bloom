import React, { useState, useEffect } from 'react';
import { getRandomUnsplashImage } from '@/utils/unsplashService';

type BlogPostImageProps = {
  src: string;
  alt: string;
  category?: string;
};

// Nutze Storage-Bucket für Blogbilder!
const SUPABASE_BLOG_IMG_URL = "https://ublbxvpmoccmegtwaslh.supabase.co/storage/v1/object/public/blog-images/";

const BlogPostImage: React.FC<BlogPostImageProps> = ({ src, alt, category }) => {
  const [imgError, setImgError] = useState(false);
  const [fallbackImage, setFallbackImage] = useState<string | null>(null);

  useEffect(() => {
    // If the image source is empty or invalid, try to get a fallback from Unsplash
    if (!src || src === '/placeholder.svg') {
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
    }
  };

  function getImageUrl(imagePath: string): string {
    if (!imagePath) return fallbackImage || "/placeholder.svg";
    
    // If it's already a full URL, use it directly
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Otherwise, assume it's a path in the Supabase storage
    return SUPABASE_BLOG_IMG_URL + imagePath;
  }

  const handleImageError = () => {
    setImgError(true);
    if (!fallbackImage) {
      fetchFallbackImage();
    }
  };

  const imageSource = imgError 
    ? (fallbackImage || "/placeholder.svg") 
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