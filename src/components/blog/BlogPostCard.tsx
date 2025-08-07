
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Calendar, Tag } from "lucide-react";
import { unifiedImageService } from '@/services/UnifiedImageService';

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
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
  const [optimizedImageUrl, setOptimizedImageUrl] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Load 50px before entering viewport
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const prepareImage = useCallback(async () => {
    try {
      // If no featured image or placeholder, get a fallback
      if (!post.featuredImage || post.featuredImage === '/placeholder.svg' || post.featuredImage.trim() === '') {
        const fallbackUrl = await unifiedImageService.getImageForContent({
          title: post.title,
          category: post.category,
          tags: post.tags,
          preferredSource: 'unsplash'
        });
        
        // Optimize the fallback image
        const optimized = unifiedImageService.optimizeUnsplashUrl(fallbackUrl, {
          width: 400,
          height: 224,
          quality: 80
        });
        
        setOptimizedImageUrl(optimized);
      } else {
        // Use existing image and optimize if it's from Unsplash
        const imageUrl = getImageUrl(post.featuredImage);
        const optimized = unifiedImageService.optimizeUnsplashUrl(imageUrl, {
          width: 400,
          height: 224,
          quality: 80
        });
        
        setOptimizedImageUrl(optimized);
      }
    } catch (error) {
      console.warn('Error preparing image for card:', error);
      // Use fallback
      setOptimizedImageUrl(unifiedImageService.getFallbackImage(post.category));
    }
  }, [post.featuredImage, post.category, post.tags, post.title]);

  useEffect(() => {
    if (isVisible) {
      prepareImage();
    }
  }, [isVisible, prepareImage]);

  const getImageUrl = (imagePath: string): string => {
    if (!imagePath || imagePath.trim() === '' || imagePath === '/placeholder.svg') {
      return unifiedImageService.getFallbackImage(post.category);
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
    setOptimizedImageUrl(unifiedImageService.getFallbackImage(post.category));
  };

  // Extract meaningful content preview from the full content
  const getContentPreview = (content: string, maxLength: number = 150): string => {
    if (!content || content.trim() === '') {
      return post.excerpt || 'Inhalt wird geladen...';
    }
    
    // Remove markdown formatting and HTML tags
    const cleanContent = content
      .replace(/#{1,6}\s+/g, '') // Remove markdown headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove markdown links
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n\s*\n/g, ' ') // Replace multiple newlines with space
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    if (cleanContent.length <= maxLength) {
      return cleanContent;
    }
    
    return cleanContent.substring(0, maxLength).trim() + '...';
  };

  const imageSource = imgError ? unifiedImageService.getFallbackImage(post.category) : optimizedImageUrl;

  return (
    <article 
      ref={cardRef}
      className="bg-white rounded-2xl shadow group hover:shadow-lg transition-all duration-200 overflow-hidden h-full flex flex-col"
    >
      <Link to={`/blog/${post.slug}`} className="block overflow-hidden">
        {isVisible ? (
          <img 
            src={imageSource} 
            alt={post.title} 
            className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105" 
            onError={handleImageError}
            loading="lazy"
            width="400"
            height="224"
            decoding="async"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-56 bg-sage-50 animate-pulse flex items-center justify-center">
            <div className="w-16 h-16 bg-sage-100 rounded-lg"></div>
          </div>
        )}
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
        <p className="text-earth-600 mb-4 line-clamp-3 flex-grow">
          {getContentPreview(post.content)}
        </p>
        <div className="flex gap-1 flex-wrap mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="bg-sage-50 text-sage-700 px-2 py-1 rounded text-xs flex items-center gap-1">
              <Tag className="h-3 w-3" /> {tag}
            </span>
          ))}
        </div>
        <div className="text-xs text-sage-600 mt-auto">von {post.author} · {post.readingTime} min</div>
      </div>
    </article>
  );
};

export default BlogPostCard;
