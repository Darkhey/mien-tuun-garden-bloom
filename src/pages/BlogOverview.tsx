
import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { useQuery } from '@tanstack/react-query';
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogFilter from "@/components/blog/BlogFilter";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from '@/integrations/supabase/types';
import type { BlogPost } from '@/types/content';
import { useSearchParams } from 'react-router-dom';

// Mapping der Kategorie-Values zu den Labels für das Frontend
const CATEGORY_MAPPING = {
  'Gartenplanung': 'Gartenplanung',
  'Aussaat & Pflanzung': 'Aussaat & Pflanzung', 
  'Pflanzenpflege': 'Pflanzenpflege',
  'Schädlingsbekämpfung': 'Schädlingsbekämpfung',
  'Kompostierung': 'Kompostierung',
  'Saisonale Küche': 'Saisonale Küche',
  'Konservieren & Haltbarmachen': 'Konservieren & Haltbarmachen',
  'Kräuter & Heilpflanzen': 'Kräuter & Heilpflanzen',
  'Nachhaltigkeit': 'Nachhaltigkeit',
  'Wassersparen & Bewässerung': 'Wassersparen & Bewässerung',
  'DIY Projekte': 'DIY Projekte',
  'Gartengeräte & Werkzeuge': 'Gartengeräte & Werkzeuge',
  'Ernte': 'Ernte',
  'Lagerung & Vorratshaltung': 'Lagerung & Vorratshaltung',
  'Selbstversorgung': 'Selbstversorgung',
  'Permakultur': 'Permakultur',
  'Urban Gardening': 'Urban Gardening',
  'Balkon & Terrasse': 'Balkon & Terrasse',
  'Indoor Gardening': 'Indoor Gardening',
  'Tipps & Tricks': 'Tipps & Tricks',
  'Jahreszeitliche Arbeiten': 'Jahreszeitliche Arbeiten',
  'Bodenpflege': 'Bodenpflege',
  'Sonstiges': 'Sonstiges'
};

// Blog-Posts aus Supabase laden - mit content Feld
const fetchBlogPosts = async () => {
  console.log('[BlogOverview] Fetching blog posts with full content...');
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*') // Alle Felder inklusive content
    .eq('published', true) // Nur veröffentlichte Artikel zeigen
    .order('published_at', { ascending: false });
    
  if (error) {
    console.error('[BlogOverview] Error fetching blog posts:', error);
    throw error;
  }
  
  console.log(`[BlogOverview] Fetched ${data?.length || 0} blog posts`);
  if (data && data.length > 0) {
    console.log('[BlogOverview] Sample post content length:', data[0].content?.length || 0);
  }
  
  return data;
};

const BlogOverview: React.FC = () => {
  // URL-Parameter auslesen
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Setze Kategorie aus URL-Parameter, wenn vorhanden
  useEffect(() => {
    if (categoryParam && Object.keys(CATEGORY_MAPPING).includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const { data: blogRows = [], isLoading, error } = useQuery({
    queryKey: ["all-blog-posts"],
    queryFn: fetchBlogPosts,
  });

  // Dynamische Kategorien aus den tatsächlichen Posts extrahieren
  const availableCategories = useMemo(() => {
    const categoriesFromPosts = Array.from(new Set(
      blogRows
        .map((post: Tables<'blog_posts'>) => post.category)
        .filter(Boolean)
    ));
    
    // Verwende die tatsächlich vorhandenen Kategorien
    return categoriesFromPosts.sort();
  }, [blogRows]);

  // Enhanced Filter-Logik mit verbessertem Typ-Handling
  const filteredPosts = useMemo(() => {
    const posts = blogRows as Tables<'blog_posts'>[];
    return posts.filter((post: Tables<'blog_posts'>) => {
      // Kategorie-Filter
      if (selectedCategory && post.category !== selectedCategory) return false;
      
      // Suchbegriff - verbesserte Suche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = post.title?.toLowerCase().includes(searchLower);
        const excerptMatch = post.excerpt?.toLowerCase().includes(searchLower);
        const descriptionMatch = post.description?.toLowerCase().includes(searchLower);
        const contentMatch = post.content?.toLowerCase().includes(searchLower);
        const tagMatch = post.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        const categoryMatch = post.category?.toLowerCase().includes(searchLower);
        
        if (!titleMatch && !excerptMatch && !descriptionMatch && !contentMatch && !tagMatch && !categoryMatch) {
          return false;
        }
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
            categories={availableCategories}
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
                  content: post.content || '', // Stelle sicher dass content verfügbar ist
                  author: post.author,
                  userId: post.user_id ?? undefined,
                  publishedAt: post.published_at,
                  updatedAt: post.updated_at || undefined,
                  featuredImage: post.featured_image || '/placeholder.svg',
                  category: post.category || '',
                  season: post.season || undefined,
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
                  description: post.description || undefined,
                };
                return <BlogPostCard post={mappedPost} key={post.id} />;
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-earth-500 text-lg">
                {selectedCategory || searchTerm 
                  ? `Keine Artikel gefunden für "${selectedCategory || searchTerm}". Versuche andere Filter oder Suchbegriffe.`
                  : "Noch keine Artikel verfügbar."
                }
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogOverview;
