
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogFilter from "@/components/blog/BlogFilter";
import { Helmet } from "react-helmet";

const BlogOverview = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [showDrafts, setShowDrafts] = useState(false);

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['blog-posts', selectedCategory, selectedSeason, showDrafts],
    queryFn: async () => {
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

  return (
    <>
      <Helmet>
        <title>Blog - Mien Tuun</title>
        <meta name="description" content="Entdecke inspirierende Artikel rund um Garten, Nachhaltigkeit und saisonales Leben." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-earth-800 mb-4">Unser Blog</h1>
          <p className="text-lg text-earth-600 max-w-2xl mx-auto">
            Entdecke inspirierende Artikel rund um Garten, Nachhaltigkeit und saisonales Leben
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
          selectedSeason={selectedSeason}
          onCategoryChange={setSelectedCategory}
          onSeasonChange={setSelectedSeason}
        />

        <div className="mt-8">
          {posts && posts.length > 0 ? (
            <>
              <div className="text-sm text-gray-600 mb-4">
                {posts.length} Artikel gefunden {showDrafts && "(inkl. Entwürfe)"}
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, index) => (
                  <BlogPostCard key={post.id} post={post} index={index} />
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
