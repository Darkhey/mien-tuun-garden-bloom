import { supabase } from "@/integrations/supabase/client";

interface AverageResult {
  avg: number | null;
}

interface PipelineRow {
  status: string;
}

interface ExecutionRow {
  status: string;
  started_at: string;
}

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
      .select('avg(quality_score)', { head: false })
      .single<AverageResult>();
    if (error) {
      console.error('[AdminStats] blog quality score failed', error);
      return 0;
    }
    return data?.avg ?? 0;
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
      .select('avg(rating)', { head: false })
      .single<AverageResult>();
    if (error) {
      console.error('[AdminStats] recipe rating failed', error);
      return 0;
    }
    return data?.avg ?? 0;
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
      supabase.from<PipelineRow>('automation_pipelines').select('status'),
      supabase.from<ExecutionRow>('pipeline_executions').select('status, started_at')
    ]);

    let activeWorkflows = 0;
    if (!pipelines.error) {
      activeWorkflows = (pipelines.data as PipelineRow[] || []).filter(p => p.status === 'active').length;
    } else {
      console.error('[AdminStats] load pipelines failed', pipelines.error);
    }

    let executionsToday = 0;
    let successRate = 0;
    if (!executions.error) {
      const execs: ExecutionRow[] = executions.data || [];
      executionsToday = execs.filter(e => new Date(e.started_at) >= start).length;
      const total = execs.length;
      const completed = execs.filter(e => e.status === 'completed').length;
      successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    } else {
      console.error('[AdminStats] load executions failed', executions.error);
    }

    return { activeWorkflows, executionsToday, successRate };
  }
}

export const adminStatsService = new AdminStatsService();
export type { AdminStatsService };
