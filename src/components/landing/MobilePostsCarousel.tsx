import React, { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { fetchLatestPosts } from '@/queries/content';
import type { BlogPost } from '@/types/content';

const MobilePostCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  const imageUrl = post.featuredImage && post.featuredImage !== '/placeholder.svg'
    ? post.featuredImage
    : `https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=75`;

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="flex-shrink-0 w-[75vw] max-w-[300px] snap-start"
    >
      <article className="garden-card overflow-hidden h-full">
        <div className="relative">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-40 object-cover"
            loading="lazy"
          />
          <span className="absolute top-2 left-2 garden-badge text-[10px]">
            {post.category}
          </span>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 mb-1">
            {post.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {post.excerpt}
          </p>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(post.publishedAt).toLocaleDateString('de-DE')}
            <span className="ml-auto">{post.readingTime} min</span>
          </span>
        </div>
      </article>
    </Link>
  );
};

const MobilePostsCarousel: React.FC = memo(() => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['latest-posts'],
    queryFn: fetchLatestPosts,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="py-6 px-4">
        <div className="flex gap-3 overflow-hidden">
          {[1, 2].map(i => (
            <div key={i} className="flex-shrink-0 w-[75vw] max-w-[300px] h-60 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!posts.length) return null;

  return (
    <section className="py-6">
      <div className="px-4 mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Neueste Beiträge</h2>
        <Link to="/blog" className="text-xs text-primary font-medium flex items-center gap-1">
          Alle <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-2 scrollbar-hide">
        {posts.map((post) => (
          <MobilePostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
});

MobilePostsCarousel.displayName = 'MobilePostsCarousel';

export default MobilePostsCarousel;
