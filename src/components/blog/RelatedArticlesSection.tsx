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

  const nextPost = posts[0];

  return (
    <section className="mt-16">
      {/* Prominent "Next Article" banner */}
      <Link
        to={`/blog/${nextPost.slug}`}
        className="group block mb-10 rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-300"
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/5 overflow-hidden">
            <img
              src={nextPost.featuredImage || "/placeholder.svg"}
              alt={nextPost.title}
              className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-center md:w-3/5">
            <span className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">Weiterlesen →</span>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors mb-3">
              {nextPost.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2">{nextPost.excerpt || ""}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{nextPost.category}</span> · <span>{nextPost.readingTime} min Lesezeit</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Remaining related articles */}
      {posts.length > 1 && (
        <>
          <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">Verwandte Artikel</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {posts.slice(1).map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default RelatedArticlesSection;
