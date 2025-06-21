// ⚠️ PARTIALLY SIMULATED DATA SERVICE - Uses edge functions when available

import { blogAnalyticsService, BlogPostInfo, TrendKeyword } from "./BlogAnalyticsService";
import { cronJobService, ScheduledTask } from "./CronJobService";
import { supabase } from "@/integrations/supabase/client";

export interface ContentInsight {
  id: string;
  title: string;
  description: string;
  metric: number;
  change: number;
  type: 'positive' | 'negative' | 'neutral';
  category: 'performance' | 'engagement' | 'seo' | 'content';
}

export interface ContentRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedImpact: string;
}

export interface TrendingTopic {
  id: string;
  topic: string;
  searchVolume: number;
  growth: number;
  difficulty: number;
  relevanceScore: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  engagement: number;
  performance: number;
}

export interface ContentSuggestion {
  topic: string;
  category: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ScheduledPost {
  title: string;
  date: string;
  status: string;
  category: string;
}

interface AutoBlogPostPayload {
  category?: string;
  [key: string]: any;
}

export class ContentInsightsService {
  async getContentInsights(): Promise<ContentInsight[]> {
    console.log('[ContentInsights] ⚠️ SIMULATED: RETURNING INSIGHTS DATA');
    
    // ⚠️ SIMULATED: Hardcoded insights
    return [
      {
        id: '1',
        title: 'Blog-Traffic gestiegen',
        description: 'Organischer Traffic ist um 23% gestiegen',
        metric: 23,
        change: 5.2,
        type: 'positive',
        category: 'performance'
      },
      {
        id: '2',
        title: 'Engagement-Rate optimieren',
        description: 'Durchschnittliche Verweildauer könnte verbessert werden',
        metric: 2.4,
        change: -0.3,
        type: 'negative',
        category: 'engagement'
      },
      {
        id: '3',
        title: 'SEO-Score verbessert',
        description: 'Durchschnittlicher SEO-Score der letzten Artikel',
        metric: 87,
        change: 12,
        type: 'positive',
        category: 'seo'
      },
      {
        id: '4',
        title: 'Content-Produktion stabil',
        description: 'Regelmäßige Veröffentlichung beibehalten',
        metric: 8,
        change: 0,
        type: 'neutral',
        category: 'content'
      }
    ];
  }

  async getContentRecommendations(): Promise<ContentRecommendation[]> {
    console.log('[ContentInsights] ⚠️ SIMULATED: RETURNING RECOMMENDATIONS');
    
    // ⚠️ SIMULATED: Hardcoded recommendations
    return [
      {
        id: '1',
        title: 'Saisonale Gartentipps für Winter',
        description: 'Wintervorbereitungen sind ein beliebtes Thema im Herbst',
        priority: 'high',
        category: 'Gartentipps',
        estimatedImpact: '+15% Traffic'
      },
      {
        id: '2',
        title: 'Indoor-Kräutergarten Artikel',
        description: 'Steigende Nachfrage nach Indoor-Gardening',
        priority: 'medium',
        category: 'Kräuter',
        estimatedImpact: '+8% Engagement'
      },
      {
        id: '3',
        title: 'Nachhaltigkeit im Garten',
        description: 'Umweltthemen sind sehr gefragt',
        priority: 'high',
        category: 'Nachhaltigkeit',
        estimatedImpact: '+20% Shares'
      }
    ];
  }

  async getTrendingTopics(): Promise<TrendingTopic[]> {
    try {
      const [trends, posts] = await Promise.all([
        blogAnalyticsService.fetchCurrentTrends(),
        blogAnalyticsService.fetchBlogPosts()
      ]);
      return trends.map((t, idx) => ({
        id: `trend-${idx}`,
        topic: t.keyword,
        searchVolume: Math.round(t.relevance * 1000),
        growth: Math.round(t.relevance * 100),
        difficulty: this.calculateDifficulty(t.keyword, t.category, posts),
        relevanceScore: Math.round(t.relevance * 100)
      }));
    } catch (error) {
      console.error('[ContentInsights] Error fetching trending topics:', error);
      return [];
    }
  }

  async fetchInsights(): Promise<{
    categoryStats: CategoryStat[];
    suggestions: ContentSuggestion[];
    scheduled: ScheduledPost[];
  }> {
    try {
      const [posts, recipes, trends, tasks] = await Promise.all([
        blogAnalyticsService.fetchBlogPosts(),
        this.fetchRecipes(),
        blogAnalyticsService.fetchCurrentTrends(),
        cronJobService.getScheduledTasks()
      ]);

      const categoryStats = this.computeCategoryStats(posts, recipes);
      const suggestions = this.generateSuggestions(trends, posts, recipes, categoryStats);
      const scheduled = this.mapScheduledPosts(tasks);

      return {
        categoryStats,
        suggestions,
        scheduled
      };
    } catch (error) {
      console.error('[ContentInsights] Error fetching insights:', error);
      return { categoryStats: [], suggestions: [], scheduled: [] };
    }
  }

  private computeCategoryStats(
    blogPosts: { category: string }[],
    recipes: { category: string }[] = []
  ): CategoryStat[] {
    const counts: Record<string, number> = {};
    for (const p of blogPosts) {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    }
    for (const r of recipes) {
      if (r.category) counts[r.category] = (counts[r.category] || 0) + 1;
    }
    return Object.entries(counts).map(([category, count]) => ({
      category,
      count,
      engagement: 0,
      performance: 0
    }));
  }

  private generateSuggestions(
    trends: TrendKeyword[],
    blogPosts: { tags: string[]; seo_keywords?: string[] }[],
    recipes: { tags: string[] }[] = [],
    stats: CategoryStat[]
  ): ContentSuggestion[] {
    const existing = new Set<string>();
    for (const p of blogPosts) {
      [...(p.tags || []), ...(p.seo_keywords || [])].forEach(t =>
        existing.add(t.toLowerCase())
      );
    }
    for (const r of recipes) {
      (r.tags || []).forEach(t => existing.add(t.toLowerCase()));
    }

    const lowCategories = stats.filter(s => s.count < 3).map(s => s.category);
    const suggestions: ContentSuggestion[] = [];

    for (const trend of trends) {
      if (
        !existing.has(trend.keyword.toLowerCase()) &&
        lowCategories.includes(trend.category)
      ) {
        suggestions.push({
          topic: trend.keyword,
          category: trend.category,
          reason: `Trendthema '${trend.keyword}' fehlt in Kategorie ${trend.category}`,
          priority: trend.relevance > 0.8 ? 'high' : trend.relevance > 0.5 ? 'medium' : 'low'
        });
      }
    }

    return suggestions;
  }

  private async fetchRecipes(): Promise<{ category: string; tags: string[] }[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('category,tags');
    if (error) throw error;
    return (data as { category: string; tags: string[] }[]) || [];
  }

  private mapScheduledPosts(tasks: ScheduledTask[]): ScheduledPost[] {
    return tasks
      .filter(t => t.function_name === 'auto-blog-post')
      .map(t => {
        const payload = t.function_payload as AutoBlogPostPayload;
        return {
          title: t.name,
          date: t.scheduled_for,
          status: t.status,
          category: payload?.category || ''
        };
      });
  }

  private calculateDifficulty(
    keyword: string,
    category: string,
    posts: BlogPostInfo[]
  ): number {
    const matches = posts.filter(p => {
      const inCategory = p.category === category;
      const keywords = [...(p.tags || []), ...(p.seo_keywords || [])];
      const keywordMatch = keywords.some(k =>
        k.toLowerCase().includes(keyword.toLowerCase())
      );
      return inCategory && keywordMatch;
    }).length;

    if (matches > 20) return 5;
    if (matches > 10) return 4;
    if (matches > 5) return 3;
    if (matches > 2) return 2;
    return 1;
  }

  async analyzeContentPerformance(contentId: string): Promise<any> {
    console.log('[ContentInsights] ⚠️ SIMULATED: CONTENT PERFORMANCE ANALYSIS for:', contentId);
    
    // ⚠️ SIMULATED: Hardcoded performance data
    return {
      views: Math.floor(Math.random() * 5000) + 500,
      engagement: Math.floor(Math.random() * 30) + 10,
      shares: Math.floor(Math.random() * 100) + 5,
      comments: Math.floor(Math.random() * 20) + 1,
      timeOnPage: Math.floor(Math.random() * 300) + 120,
      bounceRate: Math.floor(Math.random() * 30) + 20
    };
  }

  async predictContentSuccess(contentData: any): Promise<number> {
    console.log('[ContentInsights] ⚠️ SIMULATED: CONTENT SUCCESS PREDICTION for:', contentData.title);
    
    // ⚠️ SIMULATED: Einfacher Score basierend auf Titel-Länge und Kategorie
    let score = 50;
    
    if (contentData.title && contentData.title.length > 10) score += 10;
    if (contentData.category === 'Gartentipps') score += 15;
    if (contentData.category === 'Kräuter') score += 10;
    if (contentData.tags && contentData.tags.length > 2) score += 5;
    
    // Zufälliger Faktor für Realismus
    score += Math.floor(Math.random() * 20) - 10;
    
    return Math.min(100, Math.max(0, score));
  }
}

export const contentInsightsService = new ContentInsightsService();
