
import { supabase } from "@/integrations/supabase/client";

export interface AutomationDashboardStats {
  activeWorkflows: number;
  executionsToday: number;
  successRate: number;
}

class AdminStatsService {
  async getTodayBlogPostCount(): Promise<number> {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const { count, error } = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact', head: true })
      .gte('published_at', start.toISOString());
    if (error) {
      console.error('[AdminStats] blog post count failed', error);
      return 0;
    }
    return count || 0;
  }

  async getAverageBlogQualityScore(): Promise<number> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('quality_score')
      .not('quality_score', 'is', null);
    if (error) {
      console.error('[AdminStats] blog quality score failed', error);
      return 0;
    }
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, row) => acc + (row.quality_score || 0), 0);
    return Math.round(sum / data.length);
  }

  async getTodayRecipeCount(): Promise<number> {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const { count, error } = await supabase
      .from('recipes')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', start.toISOString());
    if (error) {
      console.error('[AdminStats] recipe count failed', error);
      return 0;
    }
    return count || 0;
  }

  async getAverageRecipeRating(): Promise<number> {
    const { data, error } = await supabase
      .from('recipe_ratings')
      .select('rating');
    if (error) {
      console.error('[AdminStats] recipe rating failed', error);
      return 0;
    }
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, row) => acc + row.rating, 0);
    return Math.round((sum / data.length) * 10) / 10;
  }

  async getTodaySecurityWarningCount(): Promise<number> {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const { count, error } = await supabase
      .from('security_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', start.toISOString())
      .in('severity', ['medium', 'high', 'critical']);
    if (error) {
      console.error('[AdminStats] security warnings failed', error);
      return 0;
    }
    return count || 0;
  }

  async getAutomationStats(): Promise<AutomationDashboardStats> {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    
    const [pipelines, executions] = await Promise.all([
      supabase.from('automation_pipelines').select('status'),
      supabase.from('pipeline_executions').select('status, started_at')
    ]);

    let activeWorkflows = 0;
    if (!pipelines.error && pipelines.data) {
      activeWorkflows = pipelines.data.filter(p => p.status === 'active').length;
    }

    let executionsToday = 0;
    let successRate = 0;
    if (!executions.error && executions.data) {
      const execs = executions.data;
      executionsToday = execs.filter(e => new Date(e.started_at) >= start).length;
      const total = execs.length;
      const completed = execs.filter(e => e.status === 'completed').length;
      successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    }

    return { activeWorkflows, executionsToday, successRate };
  }

  async getNewsletterStats(): Promise<{ total: number; confirmed: number; unconfirmed: number }> {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('confirmed');
    if (error) {
      console.error('[AdminStats] newsletter stats failed', error);
      return { total: 0, confirmed: 0, unconfirmed: 0 };
    }
    const total = data?.length || 0;
    const confirmed = data?.filter(s => s.confirmed).length || 0;
    return { total, confirmed, unconfirmed: total - confirmed };
  }
}

export const adminStatsService = new AdminStatsService();
export type { AdminStatsService };
