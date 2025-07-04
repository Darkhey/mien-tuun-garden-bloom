
import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { useQuery } from '@tanstack/react-query';
import BlogPostCard from "@/components/blog/BlogPostCard";
import SmartBlogFilter from "@/components/blog/SmartBlogFilter";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from '@/integrations/supabase/types';
import type { BlogPost } from '@/types/content';
import { useSearchParams } from 'react-router-dom';
import { assignSmartCategory, assignSmartSeason } from '@/utils/smartCategoryMapping';
import { extractTagsFromText } from '@/utils/tagExtractor';

// Blog-Posts aus Supabase laden
const fetchBlogPosts = async () => {
  console.log('[BlogOverview] Fetching blog posts with smart categorization...');
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });
    
  if (error) {
    console.error('[BlogOverview] Error fetching blog posts:', error);
    throw error;
  }
  
  console.log(`[BlogOverview] Fetched ${data?.length || 0} blog posts`);
  return data;
};

const BlogOverview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<'newest' | 'alphabetical' | 'relevance'>('newest');

  // Setze Kategorie aus URL-Parameter
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const { data: blogRows = [], isLoading, error } = useQuery({
    queryKey: ["all-blog-posts"],
    queryFn: fetchBlogPosts,
  });

  // Erweitere Blog-Posts um Smart Categories und Seasons
  const enrichedPosts = useMemo(() => {
    return blogRows.map((post: Tables<'blog_posts'>) => {
      const smartCategory = assignSmartCategory(
        post.tags || [], 
        post.content || '', 
        post.title
      );
      
      const smartSeason = assignSmartSeason(
        post.tags || [],
        post.content || '',
        post.published_at
      );

      return {
        ...post,
        smartCategory,
        smartSeason,
        allTags: [...(post.tags || []), ...extractTagsFromText(post.content + ' ' + post.title, 10)]
      };
    });
  }, [blogRows]);

  // Alle verfügbaren Tags sammeln
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    enrichedPosts.forEach(post => {
      post.allTags?.forEach((tag: string) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [enrichedPosts]);

  // Intelligente Filterung
  const filteredPosts = useMemo(() => {
    return enrichedPosts.filter((post) => {
      // Kategorie-Filter (basierend auf Smart Category)
      if (selectedCategory && post.smartCategory !== selectedCategory) return false;
      
      // Saison-Filter (basierend auf Smart Season)
      if (selectedSeason && post.smartSeason !== selectedSeason) return false;

      // Tag-Filter
      if (selectedTags.length > 0) {
        const hasMatchingTag = selectedTags.some(selectedTag => 
          post.allTags?.some((tag: string) => 
            tag.toLowerCase().includes(selectedTag.toLowerCase())
          )
        );
        if (!hasMatchingTag) return false;
      }

      // Erweiterte Suche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = post.title?.toLowerCase().includes(searchLower);
        const excerptMatch = post.excerpt?.toLowerCase().includes(searchLower);
        const contentMatch = post.content?.toLowerCase().includes(searchLower);
        const tagMatch = post.allTags?.some((tag: string) => 
          tag.toLowerCase().includes(searchLower)
        );
        const categoryMatch = post.smartCategory?.toLowerCase().includes(searchLower);
        
        if (!titleMatch && !excerptMatch && !contentMatch && !tagMatch && !categoryMatch) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedPosts, selectedCategory, selectedSeason, searchTerm, selectedTags]);

  // Sortierung
  const sortedPosts = useMemo(() => {
    const sorted = [...filteredPosts];
    
    sorted.sort((a, b) => {
      switch (sortOption) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'relevance':
          // Einfache Relevanz basierend auf Tag-Matches und Suchbegriff
          let scoreA = 0, scoreB = 0;
          
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            if (a.title.toLowerCase().includes(searchLower)) scoreA += 10;
            if (b.title.toLowerCase().includes(searchLower)) scoreB += 10;
            if (a.excerpt?.toLowerCase().includes(searchLower)) scoreA += 5;
            if (b.excerpt?.toLowerCase().includes(searchLower)) scoreB += 5;
          }
          
          if (selectedTags.length > 0) {
            selectedTags.forEach(tag => {
              if (a.allTags?.some(t => t.toLowerCase().includes(tag.toLowerCase()))) scoreA += 3;
              if (b.allTags?.some(t => t.toLowerCase().includes(tag.toLowerCase()))) scoreB += 3;
            });
          }
          
          return scoreB - scoreA;
        case 'newest':
        default:
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      }
    });
    
    return sorted;
  }, [filteredPosts, sortOption, searchTerm, selectedTags]);

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
          
          <SmartBlogFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSeason={selectedSeason}
            setSelectedSeason={setSelectedSeason}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            availableTags={availableTags}
            sortOption={sortOption}
            setSortOption={setSortOption}
            resultCount={sortedPosts.length}
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
                  content: post.content || '',
                  author: post.author,
                  userId: post.user_id ?? undefined,
                  publishedAt: post.published_at,
                  updatedAt: post.updated_at || undefined,
                  featuredImage: post.featured_image || '/placeholder.svg',
                  category: post.smartCategory || '',
                  season: post.smartSeason || undefined,
                  tags: post.allTags || [],
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
                  if (searchTerm) return `Keine Artikel gefunden für "${searchTerm}".`;
                  if (selectedTags.length > 0) return `Keine Artikel mit den Tags "${selectedTags.join(', ')}" gefunden.`;
                  if (selectedCategory && selectedSeason) return `Keine Artikel in dieser Kategorie und Saison gefunden.`;
                  if (selectedCategory) return `Keine Artikel in dieser Kategorie gefunden.`;
                  if (selectedSeason) return `Keine Artikel für diese Saison gefunden.`;
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
