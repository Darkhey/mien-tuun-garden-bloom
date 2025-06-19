import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Tag } from "lucide-react";
import { getRandomUnsplashImage } from '@/utils/unsplashService';

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

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  const [imgError, setImgError] = useState(false);
  const [fallbackImage, setFallbackImage] = useState<string | null>(null);

  useEffect(() => {
    // If the image source is empty or invalid, try to get a fallback from Unsplash
    if (!post.featuredImage || post.featuredImage === '/placeholder.svg' || post.featuredImage.trim() === '') {
      fetchFallbackImage();
    }
  }, [post.featuredImage, post.category]);

  const fetchFallbackImage = async () => {
    try {
      // Use the category and title to find a relevant image
      const searchQuery = post.category || post.title || 'garden nature';
      const image = await getRandomUnsplashImage(searchQuery);
      
      if (image) {
        setFallbackImage(image.urls.regular);
      }
    } catch (error) {
      console.warn('Error fetching fallback image for card:', error);
    }
  };

  const getImageUrl = (imagePath: string): string => {
    if (!imagePath || imagePath.trim() === '' || imagePath === '/placeholder.svg') {
      return fallbackImage || "/placeholder.svg";
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
      fetchFallbackImage();
    }
  };

  const imageSource = imgError 
    ? (fallbackImage || "/placeholder.svg") 
    : getImageUrl(post.featuredImage);

  return (
    <article className="bg-white rounded-2xl shadow group hover:shadow-lg transition-all duration-200 overflow-hidden h-full flex flex-col">
      <Link to={`/blog/${post.slug}`} className="block overflow-hidden">
        <img 
          src={imageSource} 
          alt={post.title} 
          className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105" 
          onError={handleImageError}
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
