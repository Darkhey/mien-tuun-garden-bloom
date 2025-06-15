import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogFilter from "@/components/blog/BlogFilter";
import { Helmet } from "react-helmet";
import { Database } from "@/integrations/supabase/types";

type BlogPostRow = Database['public']['Tables']['blog_posts']['Row'];

interface BlogOverviewProps {
  variant?: string;
}

const BlogOverview: React.FC<BlogOverviewProps> = ({ variant }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [showDrafts, setShowDrafts] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: posts, isLoading, error } = useQuery<BlogPostRow[]>({
    queryKey: ['blog-posts', selectedCategory, selectedSeason, showDrafts, searchTerm],
    queryFn: async (): Promise<BlogPostRow[]> => {
      console.log('[BlogOverview] Lade Blog-Posts...');
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      // Filter nur anwenden wenn nicht alle Artikel (inklusive Entwürfe) angezeigt werden sollen
      if (!showDrafts) {
        query = query.eq('published', true);
      }

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      if (selectedSeason) {
        query = query.eq('season', selectedSeason);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('[BlogOverview] Fehler beim Laden der Posts:', error);
        throw error;
      }

      console.log('[BlogOverview] Posts geladen:', data?.length, 'Artikel gefunden');
      return data || [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('category')
        .not('category', 'is', null);
      
      const uniqueCategories = [...new Set(data?.map(post => post.category))];
      return uniqueCategories.filter(Boolean);
    },
  });

  // Transform database posts to match BlogPostCard interface
  const transformedPosts = posts?.map(post => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    featuredImage: post.featured_image || "/placeholder.svg",
    category: post.category || "",
    publishedAt: post.published_at ? new Date(post.published_at).toLocaleDateString('de-DE') : 'Unbekannt',
    readingTime: post.reading_time || 5,
    author: post.author || "Mien Tuun Team",
    tags: post.tags || []
  })) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Lade Blog-Artikel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Fehler beim Laden der Artikel: {error.message}
        </div>
      </div>
    );
  }

  const pageTitle = variant === "garten" ? "Garten - Mien Tuun" : "Blog - Mien Tuun";
  const pageHeading = variant === "garten" ? "Unser Garten" : "Unser Blog";
  const pageDescription = variant === "garten" 
    ? "Entdecke praktische Gartentipps und saisonale Anleitungen für deinen eigenen Garten"
    : "Entdecke inspirierende Artikel rund um Garten, Nachhaltigkeit und saisonales Leben";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-earth-800 mb-4">{pageHeading}</h1>
          <p className="text-lg text-earth-600 max-w-2xl mx-auto">
            {pageDescription}
          </p>
        </div>

        {/* Debug Toggle für Entwürfe */}
        <div className="mb-6 text-center">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={showDrafts}
              onChange={(e) => setShowDrafts(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">
              Entwürfe anzeigen (Debug-Modus)
            </span>
          </label>
        </div>

        <BlogFilter
          categories={categories || []}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <div className="mt-8">
          {transformedPosts && transformedPosts.length > 0 ? (
            <>
              <div className="text-sm text-gray-600 mb-4">
                {transformedPosts.length} Artikel gefunden {showDrafts && "(inkl. Entwürfe)"}
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {transformedPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {showDrafts 
                  ? "Keine Artikel gefunden (auch keine Entwürfe)." 
                  : "Keine veröffentlichten Artikel gefunden. Aktiviere den Debug-Modus, um Entwürfe zu sehen."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogOverview;
