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

const SEASON_TAGS: Record<string, string[]> = {
  spring: ["frühling", "aussaat", "frühjahr"],
  summer: ["sommer", "ernte", "grillen"],
  autumn: ["herbst", "einkochen", "einmachen"],
  winter: ["winter", "vorkultur", "planung"],
};

const isCurrentSeason = (tags: string[]): boolean => {
  const month = new Date().getMonth();
  const season = month <= 1 || month === 11 ? "winter" : month <= 4 ? "spring" : month <= 7 ? "summer" : "autumn";
  const seasonTags = SEASON_TAGS[season] || [];
  return tags.some(t => seasonTags.some(st => t.toLowerCase().includes(st)));
};

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  const [imgError, setImgError] = useState(false);
  const [optimizedImageUrl, setOptimizedImageUrl] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const prepareImage = useCallback(async () => {
    try {
      if (!post.featuredImage || post.featuredImage === '/placeholder.svg' || post.featuredImage.trim() === '') {
        const fallbackUrl = await unifiedImageService.getImageForContent({
          title: post.title, category: post.category, tags: post.tags, preferredSource: 'unsplash'
        });
        setOptimizedImageUrl(unifiedImageService.optimizeUnsplashUrl(fallbackUrl, { width: 400, height: 224, quality: 80 }));
      } else {
        const imageUrl = getImageUrl(post.featuredImage);
        setOptimizedImageUrl(unifiedImageService.optimizeUnsplashUrl(imageUrl, { width: 400, height: 224, quality: 80 }));
      }
    } catch {
      setOptimizedImageUrl(unifiedImageService.getFallbackImage(post.category));
    }
  }, [post.featuredImage, post.category, post.tags, post.title]);

  useEffect(() => {
    if (isVisible) prepareImage();
  }, [isVisible, prepareImage]);

  const getImageUrl = (imagePath: string): string => {
    if (!imagePath || imagePath.trim() === '' || imagePath === '/placeholder.svg') {
      return unifiedImageService.getFallbackImage(post.category);
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `https://ublbxvpmoccmegtwaslh.supabase.co/storage/v1/object/public/blog-images/${imagePath}`;
  };

  const handleImageError = () => {
    setImgError(true);
    setOptimizedImageUrl(unifiedImageService.getFallbackImage(post.category));
  };

  const getContentPreview = (content: string, maxLength: number = 150): string => {
    if (!content || content.trim() === '') return post.excerpt || 'Inhalt wird geladen...';
    const cleanContent = content
      .replace(/#{1,6}\s+/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1').replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, ' ')
      .replace(/\s+/g, ' ').trim();
    return cleanContent.length <= maxLength ? cleanContent : cleanContent.substring(0, maxLength).trim() + '...';
  };

  const imageSource = imgError ? unifiedImageService.getFallbackImage(post.category) : optimizedImageUrl;

  return (
    <article
      ref={cardRef}
      className="garden-card overflow-hidden h-full flex flex-col group"
    >
      <Link to={`/blog/${post.slug}`} className="block overflow-hidden">
        {isVisible ? (
          <img
            src={imageSource}
            alt={post.title}
            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
            onError={handleImageError}
            loading="lazy"
            width="400"
            height="224"
            decoding="async"
          />
        ) : (
          <div className="w-full h-56 bg-muted animate-pulse flex items-center justify-center">
            <div className="w-16 h-16 bg-muted-foreground/10 rounded-lg"></div>
          </div>
        )}
      </Link>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3 text-sm flex-wrap">
          <span className="garden-badge">{post.category}</span>
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
            {post.readingTime} min
          </span>
          {isCurrentSeason(post.tags) && (
            <span className="bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full text-xs font-medium animate-pulse">
              🌱 Jetzt aktuell
            </span>
          )}
          <span className="text-muted-foreground flex items-center gap-1 ml-auto text-xs">
            <Calendar className="h-3.5 w-3.5" /> {new Date(post.publishedAt).toLocaleDateString('de-DE')}
          </span>
        </div>
        <h3 className="text-lg font-bold mb-2 leading-snug">
          <Link to={`/blog/${post.slug}`} className="text-foreground hover:text-primary transition-colors">
            {post.title}
          </Link>
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-3 flex-grow text-sm leading-relaxed">
          {getContentPreview(post.content)}
        </p>
        <div className="flex gap-1.5 flex-wrap mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md text-xs flex items-center gap-1">
              <Tag className="h-3 w-3" /> {tag}
            </span>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-auto pt-3 border-t border-border">
          von {post.author} · {post.readingTime} min Lesezeit
        </div>
      </div>
    </article>
  );
};

export default BlogPostCard;
