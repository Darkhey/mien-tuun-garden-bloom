import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BlogPostCard from "./BlogPostCard";
import type { BlogPost } from "@/types/content";

interface RelatedArticlesSectionProps {
  currentSlug: string;
  category: string;
  tags: string[];
}

const RelatedArticlesSection: React.FC<RelatedArticlesSectionProps> = ({ currentSlug, category, tags }) => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["related_articles", category, tags, currentSlug],
    queryFn: async () => {
      const query = supabase
        .from("blog_posts")
        .select("*")
        .neq("slug", currentSlug)
        .or([
          `category.eq.${category}`,
          ...(tags.length > 0 ? tags.map(tag => `tags.cs.{${tag}}`) : [])
        ].join(","))
        .limit(3);
      const { data, error } = await query;
      if (error) throw error;
      const filtered = (data || []).filter((row: any) => !!row.published);
      const unique = filtered.filter(
        (post: any, idx: number, arr: any[]) =>
          arr.findIndex((x) => x.slug === post.slug) === idx
      );
      return unique.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        content: row.content,
        author: row.author,
        publishedAt: row.published_at,
        updatedAt: row.updated_at || undefined,
        featuredImage: row.featured_image || "/placeholder.svg",
        category: row.category || "",
        tags: row.tags || [],
        readingTime: row.reading_time || 5,
        seo: {
          title: row.seo_title || row.title,
          description: row.seo_description || "",
          keywords: row.seo_keywords || [],
        },
        featured: !!row.featured,
        published: !!row.published,
        structuredData: row.structured_data || undefined,
        originalTitle: row.original_title || undefined,
        ogImage: row.og_image || undefined,
      })) as BlogPost[];
    },
  });

  if (isLoading || posts === undefined || posts.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-serif font-bold mb-6 text-sage-900">Verwandte Artikel</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
};

export default RelatedArticlesSection;
