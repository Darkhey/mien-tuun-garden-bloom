
import React, { useState, useMemo } from 'react';
import { Helmet } from "react-helmet";
import { siteConfig } from '@/config/site.config';
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogFilter from "@/components/blog/BlogFilter";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import type { BlogPost } from '@/types/content';

// "variant": "blog" | "garten"; falls nicht gesetzt -> blog
const BlogOverview = ({ variant = "blog" }: { variant?: "blog" | "garten" }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Alle', ...siteConfig.categories];

  // Fetch blog posts from Supabase
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['all-blogposts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    }
  });

  // Map to BlogPost type (with minimal fallback for required fields)
  const posts: BlogPost[] = useMemo(() => {
    return data.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      content: row.content,
      author: row.author,
      publishedAt: row.published_at,
      updatedAt: row.updated_at || undefined,
      featuredImage: row.featured_image || '/placeholder.svg',
      category: row.category || '',
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
    }))
  }, [data]);

  // Filter logic
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (selectedCategory !== 'Alle' && p.category !== selectedCategory) return false;
      if (
        searchTerm &&
        !(
          p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) {
        return false;
      }
      return true;
    })
  }, [posts, selectedCategory, searchTerm]);

  // SEO differenziert nach Variante
  const meta =
    variant === "garten"
      ? {
        title: "Gartenblog – Tipps & Inspiration für deinen Garten | Mien Tuun",
        description: "Gartenideen, nachhaltige Gartentipps & saisonale Inspiration – So wird dein Garten ein Wohlfühlort. Lass dich von Expertenwissen und DIY-Anleitungen inspirieren.",
        keywords:
          "Garten, Gartentipps, Gartenideen, nachhaltiges Gärtnern, DIY Garten, Pflanzen, Hochbeet, Gemüse, Permakultur, Gartenblog, Mien Tuun"
      }
      : {
        title: "Mien Tuun Blog – Nachhaltigkeit, Garten & Küche",
        description: "Entdecke saisonale Rezepte, nachhaltige Gartentipps & Inspiration für ein bewusstes Leben im Blog von Mien Tuun. Idee für deinen Garten & deine Küche!",
        keywords:
          "Blog, Garten, Nachhaltigkeit, Rezepte, Gartenblog, Kochen, Pflanzen, Umwelt, Do it yourself, Tipps & Tricks, saisonal, Leben, Inspiration"
      };

  const hero =
    variant === "garten" ? (
      <>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6">
          Gartenblog: Naturnah & kreativ gärtnern
        </h1>
        <p className="text-xl text-earth-600 mb-8">
          Entdecke inspirierende Gartentipps, DIY-Ideen & Ratgeber-Artikel rund ums nachhaltige Gärtnern, Pflanzen und Wohlfühlen im eigenen Grün.
        </p>
      </>
    ) : (
      <>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6">
          Garten & Küche Blog
        </h1>
        <p className="text-xl text-earth-600 mb-8">
          Entdecke saisonale Rezepte, nachhaltige Gartentipps und Inspiration für ein bewusstes Leben
        </p>
      </>
    );

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="keywords" content={meta.keywords} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
      </Helmet>
      <section className="bg-gradient-to-br from-sage-50 to-accent-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {hero}
          <BlogFilter
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </section>
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12 text-earth-500">Lade Artikel...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">Fehler beim Laden der Blogartikel.</div>
          ) : filteredPosts.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <BlogPostCard post={{
                  id: post.id,
                  slug: post.slug,
                  title: post.title,
                  excerpt: post.excerpt,
                  featuredImage: post.featuredImage,
                  category: post.category,
                  publishedAt: new Date(post.publishedAt).toLocaleDateString('de-DE'),
                  readingTime: post.readingTime,
                  author: post.author,
                  tags: post.tags,
                }} key={post.id} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-earth-500 text-lg">
                Keine Artikel gefunden. Versuche eine andere Kategorie oder Suchbegriff.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogOverview;

