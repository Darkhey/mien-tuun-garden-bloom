
import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { useQuery } from '@tanstack/react-query';
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogHeroCard from "@/components/blog/BlogHeroCard";
import BlogGridSkeleton from "@/components/blog/BlogCardSkeleton";
import SimpleBlogFilter from "@/components/blog/SimpleBlogFilter";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from '@/integrations/supabase/types';
import type { BlogPost } from '@/types/content';
import { useSearchParams, useParams } from 'react-router-dom';
import { assignSmartCategory, assignSmartSeason } from '@/utils/smartCategoryMapping';
import { extractTagsFromText } from '@/utils/tagExtractor';
import { Button } from "@/components/ui/button";

const fetchBlogPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

const BlogOverview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { category: routeCategory } = useParams();
  const categoryParam = routeCategory || searchParams.get('category');

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(12);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(decodeURIComponent(categoryParam));
    } else {
      setSelectedCategory('');
    }
  }, [categoryParam]);

  useEffect(() => {
    setDisplayCount(12);
  }, [selectedCategory, selectedSeason, searchTerm]);

  const { data: blogRows = [], isLoading, error } = useQuery({
    queryKey: ["all-blog-posts"],
    queryFn: fetchBlogPosts,
  });

  const enrichedPosts = useMemo(() => {
    return blogRows.map((post: Tables<'blog_posts'>) => {
      const smartCategory = assignSmartCategory(post.tags || [], post.content || '', post.title);
      const smartSeason = assignSmartSeason(post.tags || [], post.content || '', post.published_at);
      return {
        ...post,
        smartCategory,
        smartSeason,
        allTags: [...(post.tags || []), ...extractTagsFromText(post.content + ' ' + post.title, 10)]
      };
    });
  }, [blogRows]);

  const searchSuggestions = useMemo(() => {
    const suggestions = new Set<string>();
    enrichedPosts.forEach(post => {
      post.title.split(/\s+/).filter(word => word.length > 3).forEach(word => suggestions.add(word));
    });
    return Array.from(suggestions).sort();
  }, [enrichedPosts]);

  const filteredPosts = useMemo(() => {
    return enrichedPosts.filter((post) => {
      if (selectedCategory && post.smartCategory !== selectedCategory) return false;
      if (selectedSeason && post.smartSeason !== selectedSeason) return false;

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = post.title?.toLowerCase().includes(searchLower);
        const excerptMatch = post.excerpt?.toLowerCase().includes(searchLower);
        const tagMatch = post.allTags?.some(tag => tag.toLowerCase().includes(searchLower));
        if (!titleMatch && !excerptMatch && !tagMatch) return false;
      }

      return true;
    });
  }, [enrichedPosts, selectedCategory, selectedSeason, searchTerm]);

  const sortedPosts = useMemo(() => {
    const sorted = [...filteredPosts];
    if (searchTerm) {
      sorted.sort((a, b) => {
        const searchLower = searchTerm.toLowerCase();
        const aTitle = a.title.toLowerCase().includes(searchLower);
        const bTitle = b.title.toLowerCase().includes(searchLower);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      });
    } else {
      sorted.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    }
    return sorted;
  }, [filteredPosts, searchTerm]);

  const hasActiveFilters = selectedCategory || selectedSeason || searchTerm;
  const heroPost = !hasActiveFilters && sortedPosts.length > 0 ? sortedPosts[0] : null;
  const gridPosts = heroPost ? sortedPosts.slice(1) : sortedPosts;
  const displayedPosts = gridPosts.slice(0, displayCount);
  const hasMore = displayCount < gridPosts.length;

  const mapToPost = (post: any): BlogPost => ({
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
  });

  return (
    <>
      <Helmet>
        <title>{routeCategory ? `${decodeURIComponent(routeCategory)} Artikel | Mien Tuun Blog` : 'Blog | Mien Tuun'}</title>
        <meta name="description" content={routeCategory ? `Entdecke alle Artikel zum Thema ${decodeURIComponent(routeCategory)} auf Mien Tuun.` : 'Entdecke spannende Artikel rund um Gartenpflege, saisonale Rezepte, Nachhaltigkeit und DIY-Projekte.'} />
        <meta name="keywords" content={`Blog, Gartenpflege, Rezepte, Nachhaltigkeit, DIY, Mien Tuun${routeCategory ? `, ${decodeURIComponent(routeCategory)}` : ''}`} />
        <meta property="og:title" content={routeCategory ? `${decodeURIComponent(routeCategory)} Artikel | Mien Tuun Blog` : 'Blog | Mien Tuun'} />
        <meta property="og:description" content={routeCategory ? `Entdecke alle Artikel zum Thema ${decodeURIComponent(routeCategory)} auf Mien Tuun.` : 'Entdecke spannende Artikel rund um Gartenpflege, saisonale Rezepte, Nachhaltigkeit und DIY-Projekte.'} />
      </Helmet>
      
      <section className="bg-gradient-to-br from-accent/5 to-primary/5 py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4 md:mb-6">
            Inspiration & Wissen für deinen Garten
          </h1>
          <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
            Entdecke spannende Artikel, praktische Tipps und kreative Ideen rund um Garten, Küche und einen nachhaltigen Lebensstil.
          </p>
          
          <SimpleBlogFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSeason={selectedSeason}
            setSelectedSeason={setSelectedSeason}
            resultCount={sortedPosts.length}
            availableSearchSuggestions={searchSuggestions}
          />
        </div>
      </section>
      
      <section className="py-10 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <BlogGridSkeleton count={6} />
          ) : error ? (
            <div className="text-center py-12 text-destructive">Fehler beim Laden der Artikel.</div>
          ) : displayedPosts.length > 0 || heroPost ? (
            <div className="space-y-10">
              {heroPost && <BlogHeroCard post={mapToPost(heroPost)} />}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {displayedPosts.map((post) => (
                  <BlogPostCard post={mapToPost(post)} key={post.id} />
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={() => setDisplayCount(prev => prev + 12)} 
                    variant="outline" 
                    size="lg"
                    className="border-border text-muted-foreground hover:bg-secondary font-medium px-8"
                  >
                    Mehr Artikel laden ({gridPosts.length - displayCount} weitere)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchTerm ? `Keine Artikel gefunden für "${searchTerm}".` :
                 selectedCategory && selectedSeason ? 'Keine Artikel in dieser Kategorie und Saison gefunden.' :
                 selectedCategory ? 'Keine Artikel in dieser Kategorie gefunden.' :
                 selectedSeason ? 'Keine Artikel für diese Saison gefunden.' :
                 'Noch keine Artikel verfügbar.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogOverview;
