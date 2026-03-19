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
import ReadingProgressBar from "@/components/ReadingProgressBar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useToast } from "@/hooks/use-toast";
import { generateSEOTitle, generateSEODescription, generateKeywords, optimizeImageForSEO } from "@/utils/seoHelpers";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { Calendar, User, Tag, Menu, Clock, ArrowLeft } from "lucide-react";
import { FloatingShareBar } from "@/components/blog/FloatingShareBar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  usePerformanceMonitor('BlogPost', process.env.NODE_ENV === 'development');

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
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

      if (error) throw error;
      return data as Tables<"blog_posts">;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
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
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="w-full h-64 md:h-96 rounded-2xl" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <div className="space-y-3 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground text-lg">Artikel nicht gefunden.</p>
        <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Zurück zum Blog
        </Link>
      </div>
    );
  }

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

      <ReadingProgressBar estimatedTime={post.reading_time} />
      <Breadcrumbs items={[
        { label: "Blog", href: "/blog" },
        { label: post.category, href: `/blog/kategorie/${encodeURIComponent(post.category)}` },
        { label: post.title },
      ]} />

      {/* Full-width featured image */}
      {post.featured_image && post.featured_image !== '/placeholder.svg' && (
        <div className="w-full max-w-5xl mx-auto px-4 mb-0">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img
              src={optimizedImage}
              alt={post.title}
              className="w-full h-48 md:h-80 lg:h-96 object-cover"
              loading="eager"
              width="1200"
              height="630"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                {post.category}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="relative flex">
        <FloatingShareBar 
          url={`https://mien-tuun.de/blog/${post.slug}`} 
          title={post.title} 
          media={optimizedImage} 
        />
        <article ref={articleRef} className="max-w-4xl mx-auto px-4 py-6 md:py-8 flex-1">
          <header className="mb-8">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4 md:mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-muted-foreground text-sm mb-6">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.published_at).toLocaleDateString("de-DE", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{post.reading_time} Min Lesezeit</span>
              </div>
            </div>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs"
                  >
                    <Tag className="h-3 w-3 inline mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
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

      {isMobile && headings.length > 0 && (
        <Sheet>
          <SheetTrigger asChild>
            <button 
              className="fixed bottom-4 right-4 z-40 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:opacity-90 transition-opacity"
              aria-label="Inhaltsverzeichnis öffnen"
            >
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl pt-8 pb-4 px-4 overflow-hidden flex flex-col">
            <div className="font-serif font-bold text-xl text-foreground mb-4 px-2">Inhalt</div>
            <div className="overflow-y-auto flex-1 pb-8 px-2 space-y-3">
              {headings.map((heading) => (
                <button
                  key={heading.id}
                  className={`block w-full text-left text-sm transition-colors hover:text-primary ${
                    heading.level === 2 ? "font-medium text-foreground" : "pl-4 text-muted-foreground"
                  }`}
                  onClick={() => {
                    const el = document.getElementById(heading.id);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {heading.text}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default BlogPost;
