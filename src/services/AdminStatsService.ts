import { supabase } from "@/integrations/supabase/client";

export interface AutomationDashboardStats {
  activeWorkflows: number;
  executionsToday: number;
  successRate: number;
}

class AdminStatsService {
  async getTodayBlogPostCount(): Promise<number> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
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
      .select('quality_score');
    if (error) {
      console.error('[AdminStats] blog quality score failed', error);
      return 0;
    }
    const scores = (data || [])
      .map((p: any) => p.quality_score)
      .filter((n: number | null) => typeof n === 'number');
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  async getTodayRecipeCount(): Promise<number> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
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
    const ratings = (data || []).map((r: any) => r.rating);
    if (ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }

  async getTodaySecurityWarningCount(): Promise<number> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
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
    start.setHours(0, 0, 0, 0);
    const [pipelines, executions] = await Promise.all([
      supabase.from('automation_pipelines').select('status'),
      supabase.from('pipeline_executions').select('status, started_at')
    ]);

    let activeWorkflows = 0;
    if (!pipelines.error) {
      activeWorkflows = (pipelines.data || []).filter(p => p.status === 'active').length;
    } else {
      console.error('[AdminStats] load pipelines failed', pipelines.error);
    }

    let executionsToday = 0;
    let successRate = 0;
    if (!executions.error) {
      const execs = executions.data || [];
      executionsToday = execs.filter((e: any) => new Date(e.started_at) >= start).length;
      const total = execs.length;
      const completed = execs.filter((e: any) => e.status === 'completed').length;
      successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    } else {
      console.error('[AdminStats] load executions failed', executions.error);
    }

    return { activeWorkflows, executionsToday, successRate };
  }
}

export const adminStatsService = new AdminStatsService();
export type { AdminStatsService };
