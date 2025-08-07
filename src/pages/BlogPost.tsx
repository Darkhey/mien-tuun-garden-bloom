import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import BlogStructuredData from "@/components/blog/BlogStructuredData";
import BlogPostContent from "@/components/blog/BlogPostContent";
import BlogPostNavigationSidebar, {
  Heading,
} from "@/components/blog/BlogPostNavigationSidebar";
import BlogPostShareSection from "@/components/blog/BlogPostShareSection";
import CallToActionSection from "@/components/blog/CallToActionSection";
import RelatedArticlesSection from "@/components/blog/RelatedArticlesSection";
import BlogComments from "@/components/blog/BlogComments";
import { useToast } from "@/hooks/use-toast";
import { generateUniqueSlug } from "@/utils/slugHelpers";
import { generateSEOTitle, generateSEODescription, generateKeywords, optimizeImageForSEO } from "@/utils/seoHelpers";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { Calendar, User, Tag } from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  usePerformanceMonitor('BlogPost', process.env.NODE_ENV === 'development');

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Slug is required");
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      return data as Tables<"blog_posts">;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache for blog posts
    gcTime: 30 * 60 * 1000, // 30 minutes in memory
  });

  const articleRef = useRef<HTMLElement | null>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const extractHeadings = () => {
      if (!articleRef.current) return;
      const nodes = Array.from(articleRef.current.querySelectorAll("h2, h3"));
      const newHeadings = nodes
        .filter((el) => el.id)
        .map((el) => ({
          id: el.id,
          text: el.textContent || "",
          level: Number(el.tagName.replace("H", "")),
        }));
      setHeadings(newHeadings);
    };

    if (post) {
      const raf = requestAnimationFrame(extractHeadings);
      return () => cancelAnimationFrame(raf);
    }
  }, [post]);

  if (isLoading) {
    return <div className="text-center py-12">Lädt Artikel...</div>;
  }

  if (error || !post) {
    return <div className="text-center py-12">Artikel nicht gefunden.</div>;
  }

  // Generate optimized SEO data
  const seoTitle = generateSEOTitle(post.seo_title || post.title);
  const seoDescription = generateSEODescription(post.content, post.seo_description || post.excerpt);
  const seoKeywords = generateKeywords(post.title, post.content, post.category, post.tags || []);
  const optimizedImage = optimizeImageForSEO(post.featured_image, { width: 1200, height: 630, quality: 85 });

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords.join(", ")} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={optimizedImage} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://mien-tuun.de/blog/${post.slug}`} />
        <meta property="article:author" content={post.author} />
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:section" content={post.category} />
        {post.tags?.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={optimizedImage} />
        <link rel="canonical" href={`https://mien-tuun.de/blog/${post.slug}`} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow" />
      </Helmet>

      <BlogStructuredData
        title={post.title}
        description={post.excerpt}
        author={post.author}
        publishedAt={post.published_at}
        category={post.category}
        tags={post.tags}
        slug={post.slug}
      />

      <div className="relative">
        <article ref={articleRef} className="max-w-4xl mx-auto px-4 py-8">
          {/* Blog Post Header */}
          <header className="mb-8">
            <div className="mb-4">
              <span className="bg-sage-100 text-sage-700 px-3 py-1 rounded-full text-sm font-medium">
                {post.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-earth-500 mb-8">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                {post.author}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(post.published_at).toLocaleDateString("de-DE")}
              </div>
              <span>{post.reading_time} Min Lesezeit</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-sage-50 text-sage-700 px-3 py-1 rounded-full text-sm"
                >
                  <Tag className="h-3 w-3 inline mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <BlogPostContent content={post.content} />

          <BlogPostShareSection title={post.title} excerpt={post.excerpt} />

          <CallToActionSection />

          <RelatedArticlesSection
            currentSlug={post.slug}
            category={post.category}
            tags={post.tags}
          />

          <BlogComments blogSlug={post.slug} userId={user?.id || null} />
        </article>
        <BlogPostNavigationSidebar headings={headings} />
      </div>
    </>
  );
};

export default BlogPost;