import { supabase } from "@/integrations/supabase/client";

export interface BlogPostInfo {
  title: string;
  tags: string[];
  seo_keywords: string[];
  category: string;
  content: string;
}

export interface TrendKeyword {
  keyword: string;
  relevance: number;
  category: string;
}

class BlogAnalyticsService {
  async fetchBlogPosts(): Promise<BlogPostInfo[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('title,tags,seo_keywords,category,content');
    if (error) throw error;
    return (data as BlogPostInfo[]) || [];
  }

  extractKeywords(posts: BlogPostInfo[]): string[] {
    const freq: Record<string, number> = {};
    for (const post of posts) {
      const keywords = [...(post.tags || []), ...(post.seo_keywords || [])];
      for (const kw of keywords) {
        const key = kw.toLowerCase();
        freq[key] = (freq[key] || 0) + 1;
      }
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k);
  }

  async fetchCurrentTrends(): Promise<TrendKeyword[]> {
    const { data, error } = await supabase.functions.invoke('fetch-current-trends');
    if (error) throw error;
    return (data?.trends || data) as TrendKeyword[];
  }

  findKeywordGaps(trends: TrendKeyword[], existing: string[]): TrendKeyword[] {
    const lowerExisting = existing.map(k => k.toLowerCase());
    return trends.filter(t => !lowerExisting.includes(t.keyword.toLowerCase()));
  }
}

export const blogAnalyticsService = new BlogAnalyticsService();
export type { BlogAnalyticsService };
