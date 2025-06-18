
import { supabase } from "@/integrations/supabase/client";
import type { TrendKeyword } from "./BlogAnalyticsService";

export interface CategoryStat {
  category: string;
  count: number;
}

export interface ScheduledPost {
  date: string;
  title: string;
  slug: string;
  status: string | null;
}

export interface ContentSuggestion {
  topic: string;
  category: string;
  reason: string;
}

interface ContentInsights {
  categoryStats: CategoryStat[];
  suggestions: ContentSuggestion[];
  scheduled: ScheduledPost[];
}

class ContentInsightsService {
  async fetchInsights(): Promise<ContentInsights> {
    try {
      const [blogRes, recipeRes, versionRes, trendsRes] = await Promise.all([
        supabase.from('blog_posts').select('category,tags,seo_keywords,season'),
        supabase.from('recipes').select('category,tags,season'),
        supabase.from('blog_post_versions').select('title,slug,created_at,status'),
        supabase.functions.invoke('fetch-current-trends')
      ]);

      if (blogRes.error) throw blogRes.error;
      if (recipeRes.error) throw recipeRes.error;
      if (versionRes.error) throw versionRes.error;
      if (trendsRes.error) throw trendsRes.error;

      const blogPosts = blogRes.data as { category: string; tags: string[]; seo_keywords: string[]; season?: string }[];
      const recipes = recipeRes.data as { category: string; tags: string[]; season?: string }[];
      const versions = versionRes.data as { title: string; slug: string; created_at: string; status: string | null }[];
      const trends = (trendsRes.data?.trends || trendsRes.data) as TrendKeyword[];

      const categoryStats = this.computeCategoryStats(blogPosts, recipes);
      const suggestions = this.generateSuggestions(trends, blogPosts, recipes, categoryStats);
      const scheduled = versions.map(v => ({
        date: v.created_at,
        title: v.title,
        slug: v.slug,
        status: v.status
      }));

      return { categoryStats, suggestions, scheduled };
    } catch (error) {
      console.error('Fehler beim Laden der Content-Insights:', error);
      // Rückgabe von Standardwerten bei Fehlern
      return {
        categoryStats: [],
        suggestions: [],
        scheduled: []
      };
    }
  }

  private computeCategoryStats(
    blogPosts: { category: string }[],
    recipes: { category: string }[]
  ): CategoryStat[] {
    const counts: Record<string, number> = {};
    
    for (const p of blogPosts) {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    }
    for (const r of recipes) {
      if (r.category) counts[r.category] = (counts[r.category] || 0) + 1;
    }
    
    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count); // Sortiere nach Häufigkeit
  }

  private generateSuggestions(
    trends: TrendKeyword[],
    blogPosts: { tags: string[]; seo_keywords?: string[] }[],
    recipes: { tags: string[] }[],
    stats: CategoryStat[]
  ): ContentSuggestion[] {
    const existing = new Set<string>();
    
    // Sammle existierende Keywords
    for (const p of blogPosts) {
      [...(p.tags || []), ...(p.seo_keywords || [])].forEach(t => existing.add(t.toLowerCase()));
    }
    for (const r of recipes) {
      (r.tags || []).forEach(t => existing.add(t.toLowerCase()));
    }
    
    const lowCategories = stats.filter(s => s.count < 3).map(s => s.category);
    const suggestions: ContentSuggestion[] = [];
    
    for (const trend of trends) {
      if (!existing.has(trend.keyword.toLowerCase()) && 
          (lowCategories.includes(trend.category) || lowCategories.length === 0)) {
        suggestions.push({
          topic: trend.keyword,
          category: trend.category,
          reason: `Trendthema '${trend.keyword}' fehlt${lowCategories.includes(trend.category) ? ` in unterrepräsentierter Kategorie ${trend.category}` : ''}`
        });
      }
    }
    
    return suggestions.slice(0, 10); // Begrenze auf 10 Vorschläge
  }
}

export const contentInsightsService = new ContentInsightsService();
export type { ContentInsightsService };
export type { ContentInsights };
