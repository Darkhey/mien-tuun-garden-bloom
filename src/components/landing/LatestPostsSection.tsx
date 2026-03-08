import React, { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import BlogPostCard from '@/components/blog/BlogPostCard';
import type { BlogPost } from '@/types/content';
import { fetchLatestPosts } from '@/queries/content';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LatestPostsSection: React.FC = memo(() => {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['latest-posts'],
    queryFn: fetchLatestPosts,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-muted rounded w-72 mx-auto"></div>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-muted rounded-2xl h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !data.length) return null;

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Neueste Beiträge
          </h2>
          <p className="text-muted-foreground text-lg">
            Frische Artikel aus Mariannes Garten-Welt
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {data.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            to="/blog"
            className="inline-flex items-center text-primary font-semibold hover:gap-3 gap-2 transition-all duration-300 text-lg"
          >
            Alle Beiträge ansehen <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
});

LatestPostsSection.displayName = 'LatestPostsSection';

export default LatestPostsSection;
