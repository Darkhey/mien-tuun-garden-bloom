import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BlogPostCard from '@/components/blog/BlogPostCard';
import type { BlogPost } from '@/types/content';

const fetchLatestPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(3);
  if (error) throw error;
  return (data || []) as BlogPost[];
};

const LatestPostsSection: React.FC = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['latest-posts'],
    queryFn: fetchLatestPosts,
  });

  if (isLoading) {
    return (
      <section className="py-16 px-4 text-center">
        <p className="text-sage-600">Lade neueste Beiträge...</p>
      </section>
    );
  }

  if (!data.length) return null;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-8 text-center">
          Neueste Beiträge
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {data.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestPostsSection;
