
import { supabase } from "@/integrations/supabase/client";

export interface CronJob {
  id: string;
  name: string;
  description?: string;
  cron_expression: string;
  job_type: 'content_generation' | 'seo_optimization' | 'performance_analysis' | 'cleanup' | 'backup' | 'custom';
  function_name: string;
  function_payload: Record<string, any>;
  status: 'active' | 'inactive' | 'paused' | 'error';
  created_by: string;
  created_at: string;
  updated_at: string;
  last_run_at?: string;
  next_run_at?: string;
  retry_count: number;
  timeout_seconds: number;
  enabled: boolean;
  tags: string[];
  dependencies: string[];
  conditions: Record<string, any>;
}

export interface JobExecutionLog {
  id: string;
  cron_job_id: string;
  execution_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  output?: Record<string, any>;
  error_message?: string;
  retry_attempt: number;
  resource_usage: Record<string, any>;
  triggered_by: string;
}

export interface JobTemplate {
  id: string;
  name: string;
  description?: string;
  job_type: string;
  default_cron_expression: string;
  function_name: string;
  default_payload: Record<string, any>;
  category: string;
  is_system_template: boolean;
  usage_count: number;
  tags: string[];
}

export interface ScheduledTask {
  id: string;
  name: string;
  description?: string;
  function_name: string;
  function_payload: Record<string, any>;
  scheduled_for: string;
  status: string;
  created_by: string;
  created_at: string;
  executed_at?: string;
  result?: Record<string, any>;
  error_message?: string;
  priority: number;
}

class CronJobService {
  // CRUD Operations for Cron Jobs
  async getCronJobs(): Promise<CronJob[]> {
    const { data, error } = await supabase
      .from('cron_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createCronJob(job: Omit<CronJob, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<string> {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('cron_jobs')
      .insert({
        ...job,
        created_by: sessionData.session.user.id
      })
      .select('id')
      .single();

    if (error) throw error;
    console.log(`[CronJob] Created job: ${job.name}`);
    return data.id;
  }

  async updateCronJob(id: string, updates: Partial<CronJob>): Promise<void> {
    const { error } = await supabase
      .from('cron_jobs')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    console.log(`[CronJob] Updated job: ${id}`);
  }

  async deleteCronJob(id: string): Promise<void> {
    const { error } = await supabase
      .from('cron_jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    console.log(`[CronJob] Deleted job: ${id}`);
  }

  async toggleCronJob(id: string, enabled: boolean): Promise<void> {
    await this.updateCronJob(id, { 
      enabled, 
      status: enabled ? 'active' : 'inactive' 
    });
  }

  // Job Execution Logs
  async getJobLogs(cronJobId?: string, limit = 50): Promise<JobExecutionLog[]> {
    let query = supabase
      .from('job_execution_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (cronJobId) {
      query = query.eq('cron_job_id', cronJobId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createJobLog(log: Omit<JobExecutionLog, 'id' | 'started_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('job_execution_logs')
      .insert(log)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async updateJobLog(id: string, updates: Partial<JobExecutionLog>): Promise<void> {
    const { error } = await supabase
      .from('job_execution_logs')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  // Job Templates
  async getJobTemplates(): Promise<JobTemplate[]> {
    const { data, error } = await supabase
      .from('job_templates')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createJobFromTemplate(templateId: string, customConfig: Partial<CronJob>): Promise<string> {
    const { data: template, error: templateError } = await supabase
      .from('job_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    const jobData: Omit<CronJob, 'id' | 'created_at' | 'updated_at' | 'created_by'> = {
      name: customConfig.name || template.name,
      description: customConfig.description || template.description,
      cron_expression: customConfig.cron_expression || template.default_cron_expression,
      job_type: template.job_type,
      function_name: template.function_name,
      function_payload: { ...template.default_payload, ...customConfig.function_payload },
      status: 'inactive',
      retry_count: customConfig.retry_count || 3,
      timeout_seconds: customConfig.timeout_seconds || 300,
      enabled: false,
      tags: customConfig.tags || template.tags || [],
      dependencies: customConfig.dependencies || [],
      conditions: customConfig.conditions || {}
    };

    const jobId = await this.createCronJob(jobData);

    // Update template usage count
    await supabase
      .from('job_templates')
      .update({ usage_count: template.usage_count + 1 })
      .eq('id', templateId);

    return jobId;
  }

  // Scheduled Tasks
  async getScheduledTasks(): Promise<ScheduledTask[]> {
    const { data, error } = await supabase
      .from('scheduled_tasks')
      .select('*')
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createScheduledTask(task: Omit<ScheduledTask, 'id' | 'created_at' | 'created_by'>): Promise<string> {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('scheduled_tasks')
      .insert({
        ...task,
        created_by: sessionData.session.user.id
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  // Analytics and Statistics
  async getJobStatistics() {
    const [jobsData, logsData] = await Promise.all([
      this.getCronJobs(),
      this.getJobLogs(undefined, 100)
    ]);

    const totalJobs = jobsData.length;
    const activeJobs = jobsData.filter(job => job.enabled && job.status === 'active').length;
    const recentLogs = logsData.filter(log => 
      new Date().getTime() - new Date(log.started_at).getTime() < 24 * 60 * 60 * 1000
    );

    const successRate = recentLogs.length > 0 
      ? (recentLogs.filter(log => log.status === 'completed').length / recentLogs.length) * 100
      : 100;

    const avgDuration = recentLogs
      .filter(log => log.duration_ms)
      .reduce((sum, log) => sum + (log.duration_ms || 0), 0) / 
      (recentLogs.filter(log => log.duration_ms).length || 1);

    return {
      totalJobs,
      activeJobs,
      recentExecutions: recentLogs.length,
      successRate: Math.round(successRate),
      avgDuration: Math.round(avgDuration / 1000), // in seconds
      failedJobs: recentLogs.filter(log => log.status === 'failed').length,
      jobsByType: this.groupJobsByType(jobsData)
    };
  }

  private groupJobsByType(jobs: CronJob[]) {
    return jobs.reduce((acc, job) => {
      acc[job.job_type] = (acc[job.job_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // Cron Expression Helpers
  parseCronExpression(expression: string): string {
    const parts = expression.split(' ');
    if (parts.length !== 5) return 'Ungültiger Cron-Ausdruck';

    const [minute, hour, day, month, dayOfWeek] = parts;
    
    if (expression === '0 9 * * *') return 'Täglich um 9:00 Uhr';
    if (expression === '0 8 * * 1') return 'Jeden Montag um 8:00 Uhr';
    if (expression === '0 7 1 * *') return 'Jeden 1. des Monats um 7:00 Uhr';
    if (expression === '0 2 * * *') return 'Täglich um 2:00 Uhr';
    if (expression === '0 3 * * 0') return 'Jeden Sonntag um 3:00 Uhr';
    
    return `${minute} ${hour} ${day} ${month} ${dayOfWeek}`;
  }

  validateCronExpression(expression: string): boolean {
    const parts = expression.split(' ');
    if (parts.length !== 5) return false;

    const [minute, hour, day, month, dayOfWeek] = parts;
    
    const ranges = [
      { value: minute, min: 0, max: 59 },
      { value: hour, min: 0, max: 23 },
      { value: day, min: 1, max: 31 },
      { value: month, min: 1, max: 12 },
      { value: dayOfWeek, min: 0, max: 7 }
    ];

    return ranges.every(({ value, min, max }) => {
      if (value === '*') return true;
      const num = parseInt(value);
      return !isNaN(num) && num >= min && num <= max;
    });
  }

  // Execute job manually
  async executeJobManually(jobId: string): Promise<void> {
    const job = await this.getCronJobs().then(jobs => jobs.find(j => j.id === jobId));
    if (!job) throw new Error('Job not found');

    const executionId = `manual_${Date.now()}`;
    
    // Create execution log
    const logId = await this.createJobLog({
      cron_job_id: jobId,
      execution_id: executionId,
      status: 'running',
      retry_attempt: 0,
      resource_usage: {},
      triggered_by: 'manual'
    });

    try {
      // Call the edge function
      const { data, error } = await supabase.functions.invoke(job.function_name, {
        body: job.function_payload
      });

      if (error) throw error;

      // Update log with success
      await this.updateJobLog(logId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        output: data,
        duration_ms: Date.now() - new Date().getTime()
      });

      // Update job last run
      await this.updateCronJob(jobId, {
        last_run_at: new Date().toISOString()
      });

    } catch (error) {
      // Update log with error
      await this.updateJobLog(logId, {
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}

export const cronJobService = new CronJobService();
