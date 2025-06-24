import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BlogPostHeader from "@/components/blog/BlogPostHeader";
import BlogPostImage from "@/components/blog/BlogPostImage";
import BlogPostContent from "@/components/blog/BlogPostContent";
import BlogPostShareSection from "@/components/blog/BlogPostShareSection";
import RelatedArticlesSection from "@/components/blog/RelatedArticlesSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BlogPost } from '@/types/content';
import BlogComments from "@/components/blog/BlogComments";
import BlogStructuredData from "@/components/blog/BlogStructuredData";
import { Helmet } from "react-helmet";
import CallToActionSection from '@/components/blog/CallToActionSection';
import DynamicMetaTags from "@/components/seo/DynamicMetaTags";

const BlogPostPage = () => {
  const { slug } = useParams();

  // Lade Post mit Query
  const { data: row, isLoading, error } = useQuery({
    queryKey: ['blogpost', slug],
    queryFn: async () => {
      if (!slug) throw new Error("Kein Slug angegeben");
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Session holen für UserId (nur für Kommentare relevant)
  const [userId, setUserId] = React.useState<string | null>(null);
  // Bewertung state
  const [blogRating, setBlogRating] = React.useState<{
    average: number | null;
    count: number;
  }>({ average: null, count: 0 });

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  // Lese Bewertungsdaten aus Supabase für strukturierte Daten
  React.useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_ratings")
      .select("rating", { count: "exact" })
      .eq("blog_slug", slug)
      .then(({ data, count }) => {
        if (!data || data.length === 0) {
          setBlogRating({ average: null, count: 0 });
        } else {
          const sum = data.reduce((acc, cur) => acc + cur.rating, 0);
          const avg = Math.round((sum / data.length) * 10) / 10;
          setBlogRating({ average: avg, count: data.length });
        }
      });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-40 text-center text-earth-600">Lade Artikel...</div>
    );
  }

  if (!row) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-40 text-center text-earth-500">Artikel nicht gefunden.</div>
    );
  }

  // Enhanced Mapping auf BlogPost Type mit neuen Feldern
  const post: BlogPost = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    author: row.author,
    userId: row.user_id ?? undefined,
    publishedAt: row.published_at,
    updatedAt: row.updated_at || undefined,
    featuredImage: row.featured_image || '/placeholder.svg',
    category: row.category || '',
    season: row.season || undefined, // Jetzt verfügbar in der Haupttabelle
    tags: row.tags || [],
    readingTime: row.reading_time || 5,
    seo: {
      title: row.seo_title || row.title,
      description: row.seo_description || '',
      keywords: row.seo_keywords || [],
    },
    featured: !!row.featured,
    published: !!row.published,
    structuredData: row.structured_data || undefined,
    originalTitle: row.original_title || undefined,
    ogImage: row.og_image || undefined,
    description: row.description || undefined, // Neue Beschreibung verfügbar
  };

  // Generate canonical URL
  const canonicalUrl = `https://mien-tuun.de/blog/${post.slug}`;

  return (
    <>
      {/* Enhanced SEO Meta Tags */}
      <DynamicMetaTags
        title={post.seo.title}
        description={post.seo.description}
        keywords={post.seo.keywords}
        ogTitle={post.seo.title}
        ogDescription={post.seo.description}
        ogImage={post.ogImage || post.featuredImage}
        ogUrl={canonicalUrl}
        canonicalUrl={canonicalUrl}
        author={post.author}
        publishedAt={post.publishedAt || undefined}
        updatedAt={post.updatedAt}
        structuredData={post.structuredData ? JSON.parse(post.structuredData) : undefined}
      />

      {/* Entferne die alten Helmet-Tags da sie jetzt in DynamicMetaTags sind */}
      
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link
          to="/blog"
          className="inline-flex items-center text-sage-600 hover:text-sage-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Blog
        </Link>
      </div>
      <article className="max-w-4xl mx-auto px-4 pb-16">
        <BlogPostHeader
          category={post.category}
          title={post.title}
          author={post.author}
          publishedAt={post.publishedAt}
          readingTime={post.readingTime}
          tags={post.tags}
        />
        <BlogPostImage
          src={post.featuredImage}
          alt={post.title}
          category={post.category}
          tags={post.tags}
        />
        <BlogPostContent content={post.content} />
        <BlogPostShareSection
          title={post.title}
          imageUrl={post.featuredImage}
          excerpt={post.excerpt}
        />
        
        {/* Call to Action Section */}
        <CallToActionSection category={post.category} />
        
        {/* Verwandte Artikel */}
        <RelatedArticlesSection
          currentSlug={post.slug}
          category={post.category}
          tags={post.tags}
        />

        {/* Blog Kommentare */}
        <BlogComments blogSlug={post.slug} userId={userId} />
      </article>
    </>
  );
};

export default BlogPostPage;
