import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Tag } from "lucide-react";
import { unifiedImageService } from '@/services/UnifiedImageService';

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  publishedAt: string;
  readingTime: number;
  author: string;
  tags: string[];
};

interface BlogPostCardProps {
  post: BlogPost;
}

// Universal garden fallback image
const GARDEN_FALLBACK_IMAGE = "/lovable-uploads/2a3ad273-430b-4675-b1c4-33dbaac0b6cf.png";

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  const [imgError, setImgError] = useState(false);
  const [fallbackImage, setFallbackImage] = useState<string | null>(null);

  useEffect(() => {
    // If the image source is empty or invalid, try to get a fallback from the unified service
    if (!post.featuredImage || post.featuredImage === '/placeholder.svg' || post.featuredImage.trim() === '') {
      fetchFallbackImage();
    }
  }, [post.featuredImage, post.category]);

  const fetchFallbackImage = async () => {
    try {
      const imageUrl = await unifiedImageService.getImageForContent({
        title: post.title,
        category: post.category,
        tags: post.tags,
        preferredSource: 'unsplash'
      });
      setFallbackImage(imageUrl);
    } catch (error) {
      console.warn('Error fetching fallback image for card:', error);
      setFallbackImage(unifiedImageService.getFallbackImage(post.category));
    }
  };

  const getImageUrl = (imagePath: string): string => {
    if (!imagePath || imagePath.trim() === '' || imagePath === '/placeholder.svg') {
      return fallbackImage || unifiedImageService.getFallbackImage(post.category);
    }
    
    // If it's already a full URL, use it directly
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Otherwise, assume it's a path in the Supabase storage
    return `https://ublbxvpmoccmegtwaslh.supabase.co/storage/v1/object/public/blog-images/${imagePath}`;
  };

  const handleImageError = () => {
    setImgError(true);
    if (!fallbackImage) {
      setFallbackImage(unifiedImageService.getFallbackImage(post.category));
    }
  };

  const imageSource = imgError 
    ? (fallbackImage || unifiedImageService.getFallbackImage(post.category))
    : getImageUrl(post.featuredImage);

  // Optimize the image URL
  const optimizedImageSource = unifiedImageService.optimizeUnsplashUrl(imageSource, {
    width: 800,
    height: 400,
    quality: 80
  });

  return (
    <article className="bg-white rounded-2xl shadow group hover:shadow-lg transition-all duration-200 overflow-hidden h-full flex flex-col">
      <Link to={`/blog/${post.slug}`} className="block overflow-hidden">
        <img 
          src={optimizedImageSource} 
          alt={post.title} 
          className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105" 
          onError={handleImageError}
          loading="lazy"
        />
      </Link>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-sm">
          <span className="text-sage-700">{post.category}</span>
          <span>·</span>
          <span className="text-sage-400 flex items-center gap-1">
            <Calendar className="h-4 w-4" /> {new Date(post.publishedAt).toLocaleDateString('de-DE')}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2 font-serif">
          <Link to={`/blog/${post.slug}`} className="hover:text-sage-700">{post.title}</Link>
        </h3>
        <p className="text-earth-600 mb-4 line-clamp-2 flex-grow">{post.excerpt}</p>
        <div className="flex gap-1 flex-wrap">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="bg-sage-50 text-sage-700 px-2 py-1 rounded text-xs flex items-center gap-1">
              <Tag className="h-3 w-3" /> {tag}
            </span>
          ))}
        </div>
        <div className="text-xs text-sage-600 mt-2">von {post.author} · {post.readingTime} min</div>
      </div>
    </article>
  );
};

export default BlogPostCard;
