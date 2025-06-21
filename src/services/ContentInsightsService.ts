// Content insights service that fetches and analyzes real data from Supabase and OpenAI

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
  private insightsCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  private async getCachedOrFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.insightsCache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    
    const data = await fetchFn();
    this.insightsCache.set(key, { data, timestamp: now });
    return data;
  }

  async getContentInsights(): Promise<ContentInsight[]> {
    console.log('[ContentInsights] Fetching AI-powered insights from database');

    return this.getCachedOrFetch('content-insights', async () => {
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, category, published_at, published, engagement_score, quality_score');
      
      if (error) {
        console.error('[ContentInsights] Error loading blog posts:', error.message);
        return [];
      }

      // Get AI-powered insights
      const aiInsights = await this.getAIContentInsights(posts);
      
      const now = Date.now();
      const last30 = posts.filter(p =>
        p.published_at && new Date(p.published_at).getTime() > now - 30 * 24 * 60 * 60 * 1000
      );
      const prev30 = posts.filter(p =>
        p.published_at &&
        new Date(p.published_at).getTime() <= now - 30 * 24 * 60 * 60 * 1000 &&
        new Date(p.published_at).getTime() > now - 60 * 24 * 60 * 60 * 1000
      );

      const growth = prev30.length > 0 ? ((last30.length - prev30.length) / prev30.length) * 100 : 0;
      const avgEngagement = posts.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / (posts.length || 1);
      const avgQuality = posts.reduce((sum, p) => sum + (p.quality_score || 0), 0) / (posts.length || 1);
      const publishRate = (posts.filter(p => p.published).length / (posts.length || 1)) * 100;

      return [
        {
          id: 'traffic',
          title: 'Neue Artikel (30 Tage)',
          description: 'Anzahl neuer Artikel im letzten Monat',
          metric: last30.length,
          change: parseFloat(growth.toFixed(1)),
          type: growth >= 0 ? 'positive' : 'negative',
          category: 'performance'
        },
        {
          id: 'engagement',
          title: 'Durchschnittlicher Engagement-Score',
          description: 'AI-bewerteter Engagement-Score aller Artikel',
          metric: parseFloat(avgEngagement.toFixed(1)),
          change: aiInsights?.engagementTrend || 0,
          type: aiInsights?.engagementTrend >= 0 ? 'positive' : 'negative',
          category: 'engagement'
        },
        {
          id: 'quality',
          title: 'Durchschnittlicher Qualitäts-Score',
          description: 'AI-analysierte Qualitätsbewertung der Inhalte',
          metric: parseFloat(avgQuality.toFixed(1)),
          change: aiInsights?.qualityTrend || 0,
          type: aiInsights?.qualityTrend >= 0 ? 'positive' : 'negative',
          category: 'seo'
        },
        {
          id: 'publish-rate',
          title: 'Veröffentlichungsquote',
          description: 'Prozentualer Anteil veröffentlichter Artikel',
          metric: parseFloat(publishRate.toFixed(1)),
          change: 0,
          type: 'neutral',
          category: 'content'
        }
      ];
    });
  }

  private async getAIContentInsights(posts: any[]): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-insights', {
        body: { 
          action: 'generate_insights',
          data: posts.slice(0, 10) // Send recent posts for analysis
        }
      });

      if (error) {
        console.warn('[ContentInsights] AI insights failed, using fallback:', error);
        return { engagementTrend: 0, qualityTrend: 0 };
      }

      return data.insights || { engagementTrend: 0, qualityTrend: 0 };
    } catch (error) {
      console.warn('[ContentInsights] AI insights error:', error);
      return { engagementTrend: 0, qualityTrend: 0 };
    }
  }

  async getContentRecommendations(): Promise<ContentRecommendation[]> {
    console.log('[ContentInsights] Generating AI-powered content recommendations');

    return this.getCachedOrFetch('content-recommendations', async () => {
      try {
        // Get AI-powered trend predictions
        const { data: trendsData, error } = await supabase.functions.invoke('ai-content-insights', {
          body: { action: 'predict_trends' }
        });

        if (error) throw error;

        const trends = trendsData.trends?.emergingTrends || [];
        const posts = await blogAnalyticsService.fetchBlogPosts();
        
        const existing = new Set<string>();
        for (const p of posts) {
          if (p.tags) {
            for (const tag of p.tags) {
              existing.add(tag.toLowerCase());
            }
          }
          if (p.seo_keywords) {
            for (const keyword of p.seo_keywords) {
              existing.add(keyword.toLowerCase());
            }
          }
        }

        return trends
          .filter((t: any) => !existing.has(t.trend.toLowerCase()))
          .slice(0, 6)
          .map((t: any, idx: number) => ({
            id: `ai-rec-${idx}`,
            title: `Artikel über ${t.trend}`,
            description: `AI-identifizierter Trend: "${t.description}"`,
            priority: t.potential > 80 ? 'high' : t.potential > 60 ? 'medium' : 'low',
            category: 'AI-Trends',
            estimatedImpact: `${Math.round(t.potential)}% Potential`
          }));
      } catch (error) {
        console.error('[ContentInsights] Error generating AI recommendations:', error);
        
        // Fallback to traditional method
        const [trends, posts] = await Promise.all([
          blogAnalyticsService.fetchCurrentTrends(),
          blogAnalyticsService.fetchBlogPosts()
        ]);

        const existing = new Set<string>();
        for (const p of posts) {
          if (p.tags) {
            for (const tag of p.tags) {
              existing.add(tag.toLowerCase());
            }
          }
          if (p.seo_keywords) {
            for (const keyword of p.seo_keywords) {
              existing.add(keyword.toLowerCase());
            }
          }
        }

        return trends
          .filter(t => !existing.has(t.keyword.toLowerCase()))
          .slice(0, 5)
          .map((t, idx) => ({
            id: `rec-${idx}`,
            title: `Artikel über ${t.keyword}`,
            description: `Trendthema "${t.keyword}" in Kategorie ${t.category}`,
            priority: t.relevance > 0.8 ? 'high' : t.relevance > 0.5 ? 'medium' : 'low',
            category: t.category,
            estimatedImpact: `${Math.round(t.relevance * 100)}% Traffic`
          }));
      }
    });
  }

  async getTrendingTopics(): Promise<TrendingTopic[]> {
    return this.getCachedOrFetch('trending-topics', async () => {
      try {
        // Get AI-powered trend analysis
        const { data: trendsData, error } = await supabase.functions.invoke('ai-content-insights', {
          body: { action: 'predict_trends' }
        });

        if (!error && trendsData?.trends?.emergingTrends) {
          const posts = await blogAnalyticsService.fetchBlogPosts();
          
          return trendsData.trends.emergingTrends.map((t: any, idx: number) => ({
            id: `ai-trend-${idx}`,
            topic: t.trend,
            searchVolume: Math.round(t.potential * 10), // Convert potential to search volume estimate
            growth: Math.round(t.potential),
            difficulty: this.calculateDifficulty(t.trend, 'AI-Trend', posts),
            relevanceScore: Math.round(t.potential)
          }));
        }
      } catch (error) {
        console.warn('[ContentInsights] AI trends failed, using fallback:', error);
      }

      // Fallback to existing method
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
    });
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
    console.log('[ContentInsights] AI-analyzing performance for:', contentId);

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .or(`id.eq.${contentId},slug.eq.${contentId}`)
      .single();

    if (error || !post) {
      console.error('[ContentInsights] Post not found:', error?.message);
      return null;
    }

    try {
      // Get AI-powered performance analysis
      const { data: analysisData, error: aiError } = await supabase.functions.invoke('ai-content-insights', {
        body: { 
          action: 'analyze_performance',
          data: {
            title: post.title,
            content: post.content,
            category: post.category,
            tags: post.tags,
            seoKeywords: post.seo_keywords
          }
        }
      });

      if (!aiError && analysisData?.analysis) {
        const analysis = analysisData.analysis;
        
        const { count: commentCount } = await supabase
          .from('blog_comments')
          .select('*', { count: 'exact', head: true })
          .eq('blog_slug', post.slug);

        const { data: ratings } = await supabase
          .from('blog_ratings')
          .select('rating')
          .eq('blog_slug', post.slug);

        const ratingAvg = ratings && ratings.length > 0 
          ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length 
          : 0;

        return {
          views: analysis.estimatedViews || post.engagement_score || 0,
          engagement: analysis.engagementPrediction || ratingAvg * 20 || 0,
          shares: Math.round((analysis.engagementPrediction || 50) / 10),
          comments: commentCount || 0,
          timeOnPage: (post.reading_time || 3) * 60,
          bounceRate: Math.max(0, 100 - (analysis.engagementPrediction || 70)),
          aiInsights: {
            performanceScore: analysis.performanceScore,
            seoOptimization: analysis.seoOptimization,
            recommendations: analysis.recommendations,
            competitiveness: analysis.competitiveness
          }
        };
      }
    } catch (error) {
      console.warn('[ContentInsights] AI analysis failed, using basic metrics:', error);
    }

    // Fallback to basic analysis
    const { count: commentCount } = await supabase
      .from('blog_comments')
      .select('*', { count: 'exact', head: true })
      .eq('blog_slug', post.slug);

    const { data: ratings } = await supabase
      .from('blog_ratings')
      .select('rating')
      .eq('blog_slug', post.slug);

    const ratingAvg = ratings && ratings.length > 0 
      ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length 
      : 0;

    return {
      views: post.engagement_score || 0,
      engagement: ratingAvg || 0,
      shares: 0,
      comments: commentCount || 0,
      timeOnPage: (post.reading_time || 0) * 60,
      bounceRate: 0
    };
  }

  async predictContentSuccess(contentData: any): Promise<number> {
    console.log('[ContentInsights] AI-predicting content success for:', contentData.title);

    try {
      // Use AI for prediction
      const { data: analysisData, error } = await supabase.functions.invoke('ai-content-insights', {
        body: { 
          action: 'analyze_performance',
          data: contentData
        }
      });

      if (!error && analysisData?.analysis?.performanceScore) {
        return Math.min(100, Math.max(0, analysisData.analysis.performanceScore));
      }
    } catch (error) {
      console.warn('[ContentInsights] AI prediction failed, using heuristic:', error);
    }

    // Fallback to heuristic method
    let score = 50;

    if (contentData.title && contentData.title.length > 10) score += 10;
    if (contentData.category === 'Gartentipps') score += 15;
    if (contentData.category === 'Kräuter') score += 10;
    if (contentData.tags && contentData.tags.length > 2) score += 5;

    if (typeof contentData.quality_score === 'number') score += contentData.quality_score * 0.15;
    if (typeof contentData.engagement_score === 'number') score += contentData.engagement_score * 0.10;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  async optimizeContent(contentData: any): Promise<any> {
    console.log('[ContentInsights] Getting AI optimization suggestions for:', contentData.title);

    try {
      const { data: optimizationData, error } = await supabase.functions.invoke('ai-content-insights', {
        body: { 
          action: 'optimize_content',
          data: contentData
        }
      });

      if (error) throw error;

      return optimizationData.optimization;
    } catch (error) {
      console.error('[ContentInsights] Content optimization failed:', error);
      throw new Error(`Content-Optimierung fehlgeschlagen: ${error.message}`);
    }
  }

  clearCache(): void {
    this.insightsCache.clear();
    console.log('[ContentInsights] Cache cleared');
  }
}

export const contentInsightsService = new ContentInsightsService();
