
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type CronJob = Database['public']['Tables']['cron_jobs']['Row'];
export type JobExecutionLog = Database['public']['Tables']['job_execution_logs']['Row'];
export type JobTemplate = Database['public']['Tables']['job_templates']['Row'];
export type ScheduledTask = Database['public']['Tables']['scheduled_tasks']['Row'];

type CronJobInsert = Database['public']['Tables']['cron_jobs']['Insert'];
type JobExecutionLogInsert = Database['public']['Tables']['job_execution_logs']['Insert'];
type ScheduledTaskInsert = Database['public']['Tables']['scheduled_tasks']['Insert'];

export interface CronJobStats {
  totalJobs: number;
  activeJobs: number;
  successRate: number;
  lastExecutions: JobExecutionLog[];
}

export interface CreateCronJobParams {
  name: string;
  description?: string;
  cron_expression: string;
  job_type: Database['public']['Enums']['job_type'];
  function_name: string;
  function_payload?: Record<string, any>;
  enabled?: boolean;
  retry_count?: number;
  timeout_seconds?: number;
  tags?: string[];
  dependencies?: string[];
  conditions?: Record<string, any>;
}

export interface CreateScheduledTaskParams {
  name: string;
  description?: string;
  function_name: string;
  function_payload?: Record<string, any>;
  scheduled_for: string;
  priority?: number;
}

class CronJobService {
  async getAllJobs(): Promise<CronJob[]> {
    const { data, error } = await supabase
      .from('cron_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCronJobs(): Promise<CronJob[]> {
    return this.getAllJobs();
  }

  async getJobById(id: string): Promise<CronJob | null> {
    const { data, error } = await supabase
      .from('cron_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createJob(params: CreateCronJobParams): Promise<CronJob> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) throw new Error('Not authenticated');

    const jobData: CronJobInsert = {
      name: params.name,
      description: params.description,
      cron_expression: params.cron_expression,
      job_type: params.job_type,
      function_name: params.function_name,
      function_payload: params.function_payload || {},
      created_by: session.session.user.id,
      enabled: params.enabled ?? true,
      retry_count: params.retry_count ?? 3,
      timeout_seconds: params.timeout_seconds ?? 300,
      tags: params.tags || [],
      dependencies: params.dependencies || [],
      conditions: params.conditions || {}
    };

    const { data, error } = await supabase
      .from('cron_jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createCronJob(params: CreateCronJobParams): Promise<CronJob> {
    return this.createJob(params);
  }

  async updateJob(id: string, updates: Partial<CreateCronJobParams>): Promise<CronJob> {
    const updateData: any = { ...updates };
    
    // Ensure job_type is properly typed
    if (updateData.job_type && typeof updateData.job_type === 'string') {
      updateData.job_type = updateData.job_type as Database['public']['Enums']['job_type'];
    }

    const { data, error } = await supabase
      .from('cron_jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteJob(id: string): Promise<void> {
    const { error } = await supabase
      .from('cron_jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async deleteCronJob(id: string): Promise<void> {
    return this.deleteJob(id);
  }

  async toggleJob(id: string, enabled: boolean): Promise<CronJob> {
    const { data, error } = await supabase
      .from('cron_jobs')
      .update({ enabled })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async toggleCronJob(id: string, enabled: boolean): Promise<CronJob> {
    return this.toggleJob(id, enabled);
  }

  async executeJob(id: string): Promise<{ success: boolean; executionId?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('cron-executor', {
        body: { jobId: id, action: 'execute' }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Job execution failed:', error);
      return { success: false, error: error.message };
    }
  }

  async executeJobManually(id: string): Promise<{ success: boolean; executionId?: string; error?: string }> {
    return this.executeJob(id);
  }

  async getJobLogs(jobId?: string, limit = 50): Promise<JobExecutionLog[]> {
    let query = supabase
      .from('job_execution_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (jobId) {
      query = query.eq('cron_job_id', jobId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getJobTemplates(): Promise<JobTemplate[]> {
    const { data, error } = await supabase
      .from('job_templates')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createJobFromTemplate(templateId: string, customParams?: Partial<CreateCronJobParams>): Promise<CronJob> {
    const template = await this.getTemplateById(templateId);
    if (!template) throw new Error('Template not found');

    const defaultPayload = typeof template.default_payload === 'object' && template.default_payload !== null 
      ? template.default_payload as Record<string, any>
      : {};

    const jobParams: CreateCronJobParams = {
      name: customParams?.name || template.name,
      description: customParams?.description || template.description || '',
      cron_expression: customParams?.cron_expression || template.default_cron_expression,
      job_type: template.job_type,
      function_name: template.function_name,
      function_payload: { ...defaultPayload, ...(customParams?.function_payload || {}) },
      ...customParams
    };

    return this.createJob(jobParams);
  }

  async getTemplateById(id: string): Promise<JobTemplate | null> {
    const { data, error } = await supabase
      .from('job_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async getScheduledTasks(): Promise<ScheduledTask[]> {
    const { data, error } = await supabase
      .from('scheduled_tasks')
      .select('*')
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createScheduledTask(params: CreateScheduledTaskParams): Promise<ScheduledTask> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) throw new Error('Not authenticated');

    const taskData: ScheduledTaskInsert = {
      name: params.name,
      description: params.description,
      function_name: params.function_name,
      function_payload: params.function_payload || {},
      scheduled_for: params.scheduled_for,
      priority: params.priority || 0,
      created_by: session.session.user.id,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('scheduled_tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getJobStats(): Promise<CronJobStats> {
    const [jobsResult, logsResult] = await Promise.all([
      supabase.from('cron_jobs').select('*'),
      supabase
        .from('job_execution_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10)
    ]);

    if (jobsResult.error) throw jobsResult.error;
    if (logsResult.error) throw logsResult.error;

    const jobs = jobsResult.data || [];
    const logs = logsResult.data || [];

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.enabled && job.status === 'active').length;
    
    const completedLogs = logs.filter(log => log.status === 'completed');
    const successRate = logs.length > 0 ? (completedLogs.length / logs.length) * 100 : 0;

    return {
      totalJobs,
      activeJobs,
      successRate: Math.round(successRate),
      lastExecutions: logs
    };
  }

  async getJobStatistics(): Promise<CronJobStats> {
    return this.getJobStats();
  }

  parseCronExpression(expression: string): string {
    // Simple cron expression parser
    const parts = expression.split(' ');
    if (parts.length !== 5) return 'Invalid expression';
    
    const [minute, hour, day, month, weekday] = parts;
    
    if (minute === '0' && hour !== '*') {
      return `Täglich um ${hour}:00 Uhr`;
    }
    if (minute === '0' && hour === '0' && weekday !== '*') {
      const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
      return `Jeden ${days[parseInt(weekday)]} um Mitternacht`;
    }
    if (minute === '0' && hour === '0' && day === '1') {
      return 'Monatlich am ersten Tag';
    }
    
    return expression;
  }
}

export const cronJobService = new CronJobService();
