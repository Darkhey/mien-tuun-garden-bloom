import React, { useState, useMemo } from 'react';
import { Helmet } from "react-helmet";
import { useQuery } from '@tanstack/react-query';
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogFilter from "@/components/blog/BlogFilter";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from '@/integrations/supabase/types';
import type { BlogPost } from '@/types/content';

// Die Kategorien
const categories = ['Gartenpflege', 'Rezepte', 'Nachhaltigkeit', 'DIY'];

// Blog-Posts aus Supabase laden
const fetchBlogPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return data;
};

const BlogOverview: React.FC = () => {
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: blogRows = [], isLoading, error } = useQuery({
    queryKey: ["all-blog-posts"],
    queryFn: fetchBlogPosts,
  });

  // Filter-Logik mit explizitem Typ
  const filteredPosts = useMemo(() => {
    const posts = blogRows as Tables<'blog_posts'>[];
    return posts.filter((post: Tables<'blog_posts'>) => {
      // Kategorie
      if (selectedCategory && post.category !== selectedCategory) return false;
      // Suchbegriff
      if (
        searchTerm &&
        !(
          post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) {
        return false;
      }
      return true;
    });
  }, [blogRows, selectedCategory, searchTerm]);

  return (
    <>
      <Helmet>
        <title>Blog | Mien Tuun</title>
        <meta name="description" content="Entdecke spannende Artikel rund um Gartenpflege, saisonale Rezepte, Nachhaltigkeit und DIY-Projekte. Lass dich inspirieren und erweitere dein Wissen!" />
        <meta name="keywords" content="Blog, Gartenpflege, Rezepte, Nachhaltigkeit, DIY, Mien Tuun, Garten, Kochen, Selbermachen, Inspiration" />
        <meta property="og:title" content="Blog | Mien Tuun" />
        <meta property="og:description" content="Entdecke spannende Artikel rund um Gartenpflege, saisonale Rezepte, Nachhaltigkeit und DIY-Projekte. Lass dich inspirieren und erweitere dein Wissen!" />
      </Helmet>
      {/* Header */}
      <section className="bg-gradient-to-br from-accent-50 to-sage-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6">
            Inspiration & Wissen für deinen Garten
          </h1>
          <p className="text-xl text-earth-600 mb-8">
            Entdecke spannende Artikel, praktische Tipps und kreative Ideen rund um Garten, Küche und einen nachhaltigen Lebensstil.
          </p>
          {/* Filter UI */}
          <BlogFilter
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </section>
      {/* Blog Posts Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12 text-earth-500">Lade Artikel...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">Fehler beim Laden der Artikel.</div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => {
                const mappedPost: BlogPost = {
                  id: post.id,
                  slug: post.slug,
                  title: post.title,
                  excerpt: post.excerpt,
                  content: post.content,
                  author: post.author,
                  publishedAt: post.published_at,
                  updatedAt: post.updated_at || undefined,
                  featuredImage: post.featured_image || '/placeholder.svg',
                  category: post.category || '',
                  tags: post.tags || [],
                  readingTime: post.reading_time || 5,
                  seo: {
                      title: post.seo_title || post.title,
                      description: post.seo_description || '',
                      keywords: post.seo_keywords || [],
                  },
                  featured: !!post.featured,
                  published: !!post.published,
                  structuredData: post.structured_data || undefined,
                  originalTitle: post.original_title || undefined,
                  ogImage: post.og_image || undefined,
                };
                return <BlogPostCard post={mappedPost} key={post.id} />;
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-earth-500 text-lg">
                Keine Artikel gefunden. Versuche andere Filter oder Suchbegriffe.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogOverview;
