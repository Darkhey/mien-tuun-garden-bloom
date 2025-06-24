import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { useQuery } from '@tanstack/react-query';
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogFilter, { Season } from "@/components/blog/BlogFilter";
import SEOService from "@/services/SEOService";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from '@/integrations/supabase/types';
import type { BlogPost } from '@/types/content';
import { useSearchParams } from 'react-router-dom';
import { BLOG_CATEGORIES, SEASONS } from '@/components/admin/blogHelpers';

// Kategorie-Mapping aus zentralen Konstanten erzeugen
const CATEGORY_MAPPING = BLOG_CATEGORIES.reduce((acc, cat) => {
  acc[cat.value] = cat.label;
  return acc;
}, {} as Record<string, string>);

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
  const [selectedSeason, setSelectedSeason] = useState<Season | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'alphabetical' | 'length' | 'seo'>('newest');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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
        .filter(category => Object.keys(CATEGORY_MAPPING).includes(category))
    ));

    // Verwende die tatsächlich vorhandenen Kategorien
    return categoriesFromPosts.sort();
  }, [blogRows]);

  const availableSeasons = useMemo(() => {
    const seasonsFromPosts = Array.from(new Set(
      blogRows
        .map((post: Tables<'blog_posts'>) => post.season)
        .filter(Boolean)
        .filter(season => SEASONS.some(s => s.value === season))
    ));

    return seasonsFromPosts.sort() as Season[];
  }, [blogRows]);

  // Enhanced Filter-Logik mit verbessertem Typ-Handling
  const filteredPosts = useMemo(() => {
    const posts = blogRows as Tables<'blog_posts'>[];
    return posts.filter((post: Tables<'blog_posts'>) => {
      // Kategorie-Filter
      if (selectedCategory && post.category !== selectedCategory) return false;
      // Saison-Filter
      if (selectedSeason && post.season !== selectedSeason) return false;

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
  }, [blogRows, selectedCategory, selectedSeason, searchTerm]);

  const postsWithScores = useMemo(() => {
    const seoService = SEOService.getInstance();
    return filteredPosts.map((p) => ({
      post: p,
      length: (p.content || '').length,
      seo: seoService.analyzeSEO({ title: p.title, content: p.content || '', excerpt: p.excerpt || '' }).score
    }));
  }, [filteredPosts]);

  const sortedPosts = useMemo(() => {
    const sorted = [...postsWithScores];
    sorted.sort((a, b) => {
      let res = 0;
      switch (sortOption) {
        case 'alphabetical':
          res = a.post.title.localeCompare(b.post.title);
          break;
        case 'length':
          res = a.length - b.length;
          break;
        case 'seo':
          res = a.seo - b.seo;
          break;
        case 'newest':
        default:
          res = new Date(a.post.published_at).getTime() - new Date(b.post.published_at).getTime();
          break;
      }
      return sortDirection === 'asc' ? res : -res;
    });
    return sorted.map(s => s.post);
  }, [postsWithScores, sortOption, sortDirection]);

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
            seasons={availableSeasons}
            selectedSeason={selectedSeason}
            setSelectedSeason={setSelectedSeason}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortOption={sortOption}
            setSortOption={setSortOption}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
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
          ) : sortedPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedPosts.map((post) => {
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
                {(() => {
                  if (searchTerm) return `Keine Artikel gefunden für Suchbegriff "${searchTerm}".`;
                  if (selectedCategory && selectedSeason) return `Keine Artikel in Kategorie "${selectedCategory}" für Saison "${selectedSeason}".`;
                  if (selectedCategory) return `Keine Artikel in Kategorie "${selectedCategory}".`;
                  if (selectedSeason) return `Keine Artikel für Saison "${selectedSeason}".`;
                  return 'Noch keine Artikel verfügbar.';
                })()}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogOverview;
