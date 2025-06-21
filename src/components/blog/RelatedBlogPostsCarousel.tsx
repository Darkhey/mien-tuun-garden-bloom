import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import BlogPostCard from "./BlogPostCard";
import type { BlogPost } from "@/types/content";

interface RelatedBlogPostsCarouselProps {
  currentSlug: string;
  category: string;
  tags: string[];
}

const RelatedBlogPostsCarousel: React.FC<RelatedBlogPostsCarouselProps> = ({ currentSlug, category, tags }) => {
  // Holt passende Artikel, außer aktuellen
  const { data: posts, isLoading } = useQuery({
    queryKey: ["related_blog_posts", category, tags, currentSlug],
    queryFn: async () => {
      // Hole Artikel mit gleicher Kategorie ODER überlappenden Tags und nicht currentSlug
      const query = supabase
        .from("blog_posts")
        .select("*")
        .neq("slug", currentSlug)
        .or([
          `category.eq.${category}`,
          ...(tags.length > 0 ? tags.map(tag => `tags.cs.{${tag}}`) : [])
        ].join(","));

      const { data, error } = await query;
      if (error) throw error;
      // Nur veröffentlichte, keine Entwürfe
      const filtered = (data || []).filter((row: any) => !!row.published);

      // Dopplungen entfernen (falls ein Artikel sowohl Tag als auch Kategorie matcht)
      const unique = filtered.filter(
        (post: any, idx: number, arr: any[]) =>
          arr.findIndex((x) => x.slug === post.slug) === idx
      );

      // Mapping auf BlogPost Type  
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

  if (isLoading || posts === undefined) return null;
  if (!posts.length) return null;

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-serif font-bold mb-6 text-sage-900">Das könnte dich auch interessieren</h2>
      <Carousel className="relative">
        <CarouselContent>
          {posts.map((post) => (
            <CarouselItem key={post.slug} className="md:basis-1/2 lg:basis-1/3">
              <BlogPostCard post={post} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};

export default RelatedBlogPostsCarousel;