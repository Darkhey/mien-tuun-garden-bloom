
import { supabase } from "@/integrations/supabase/client";

export interface JobConfig {
  id?: string;
  name: string;
  description?: string;
  cron_expression: string;
  job_type: 'content_generation' | 'seo_optimization' | 'performance_analysis' | 'cleanup' | 'backup' | 'custom';
  function_name: string;
  function_payload: Record<string, any>;
  status: 'active' | 'inactive' | 'paused' | 'error';
  enabled: boolean;
}

export interface JobExecution {
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
}

export interface JobStats {
  totalJobs: number;
  activeJobs: number;
  successRate: number;
  lastExecutions: JobExecution[];
}

class ScheduledJobService {
  /**
   * Get all job configurations
   */
  async getJobConfigs(): Promise<JobConfig[]> {
    const { data, error } = await supabase
      .from('cron_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map database fields to our interface
    return (data || []).map(job => ({
      id: job.id,
      name: job.name,
      description: job.description || '',
      cron_expression: job.cron_expression,
      job_type: job.job_type as any,
      function_name: job.function_name,
      function_payload: job.function_payload as Record<string, any>,
      status: job.status as any,
      enabled: job.enabled
    }));
  }

  /**
   * Get a job configuration by ID
   */
  async getJobConfigById(id: string): Promise<JobConfig | null> {
    const { data, error } = await supabase
      .from('cron_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      cron_expression: data.cron_expression,
      job_type: data.job_type as any,
      function_name: data.function_name,
      function_payload: data.function_payload as Record<string, any>,
      status: data.status as any,
      enabled: data.enabled
    };
  }

  /**
   * Create a new job configuration
   */
  async createJobConfig(config: Omit<JobConfig, 'id'>): Promise<JobConfig> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) throw new Error('Not authenticated');

    const jobData = {
      name: config.name,
      description: config.description,
      cron_expression: config.cron_expression,
      job_type: config.job_type,
      function_name: config.function_name,
      function_payload: config.function_payload,
      status: config.status,
      enabled: config.enabled,
      created_by: session.session.user.id
    };

    const { data, error } = await supabase
      .from('cron_jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      cron_expression: data.cron_expression,
      job_type: data.job_type as any,
      function_name: data.function_name,
      function_payload: data.function_payload as Record<string, any>,
      status: data.status as any,
      enabled: data.enabled
    };
  }

  /**
   * Update a job configuration
   */
  async updateJobConfig(id: string, updates: Partial<JobConfig>): Promise<JobConfig> {
    const { data, error } = await supabase
      .from('cron_jobs')
      .update({
        name: updates.name,
        description: updates.description,
        cron_expression: updates.cron_expression,
        job_type: updates.job_type,
        function_name: updates.function_name,
        function_payload: updates.function_payload,
        status: updates.status,
        enabled: updates.enabled
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      cron_expression: data.cron_expression,
      job_type: data.job_type as any,
      function_name: data.function_name,
      function_payload: data.function_payload as Record<string, any>,
      status: data.status as any,
      enabled: data.enabled
    };
  }

  /**
   * Delete a job configuration
   */
  async deleteJobConfig(id: string): Promise<void> {
    const { error } = await supabase
      .from('cron_jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Toggle a job's active status
   */
  async toggleJobActive(id: string, isActive: boolean): Promise<JobConfig> {
    const { data, error } = await supabase
      .from('cron_jobs')
      .update({ enabled: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      cron_expression: data.cron_expression,
      job_type: data.job_type as any,
      function_name: data.function_name,
      function_payload: data.function_payload as Record<string, any>,
      status: data.status as any,
      enabled: data.enabled
    };
  }

  /**
   * Get execution history for a job
   */
  async getJobExecutions(jobId?: string, limit = 50): Promise<JobExecution[]> {
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
    
    return (data || []).map(execution => ({
      id: execution.id,
      cron_job_id: execution.cron_job_id,
      execution_id: execution.execution_id,
      status: execution.status as any,
      started_at: execution.started_at,
      completed_at: execution.completed_at || undefined,
      duration_ms: execution.duration_ms || undefined,
      output: execution.output as Record<string, any> || undefined,
      error_message: execution.error_message || undefined,
      retry_attempt: execution.retry_attempt
    }));
  }

  /**
   * Run a job manually
   */
  async runJobManually(id: string): Promise<{ success: boolean; executionId?: string; error?: string }> {
    try {
      // Use edge function instead of RPC
      const { data, error } = await supabase.functions.invoke('cron-executor', {
        body: { jobId: id, action: 'execute' }
      });

      if (error) throw error;
      
      // Get the latest execution for this job
      const { data: executions } = await supabase
        .from('job_execution_logs')
        .select('id')
        .eq('cron_job_id', id)
        .order('started_at', { ascending: false })
        .limit(1);
      
      return { 
        success: true, 
        executionId: executions?.[0]?.id 
      };
    } catch (error) {
      console.error('Job execution failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get job statistics
   */
  async getJobStats(): Promise<JobStats> {
    const [jobsResult, executionsResult] = await Promise.all([
      supabase.from('cron_jobs').select('*'),
      supabase
        .from('job_execution_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10)
    ]);

    if (jobsResult.error) throw jobsResult.error;
    if (executionsResult.error) throw executionsResult.error;

    const jobs = jobsResult.data || [];
    const executions = (executionsResult.data || []).map(execution => ({
      id: execution.id,
      cron_job_id: execution.cron_job_id,
      execution_id: execution.execution_id,
      status: execution.status as any,
      started_at: execution.started_at,
      completed_at: execution.completed_at || undefined,
      duration_ms: execution.duration_ms || undefined,
      output: execution.output as Record<string, any> || undefined,
      error_message: execution.error_message || undefined,
      retry_attempt: execution.retry_attempt
    }));

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.enabled).length;
    
    const allExecutions = await supabase
      .from('job_execution_logs')
      .select('status', { count: 'exact' });
    
    const successfulExecutions = await supabase
      .from('job_execution_logs')
      .select('status', { count: 'exact' })
      .in('status', ['completed']);
    
    const totalExecutions = allExecutions.count || 0;
    const successCount = successfulExecutions.count || 0;
    
    const successRate = totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 0;

    return {
      totalJobs,
      activeJobs,
      successRate: Math.round(successRate),
      lastExecutions: executions
    };
  }

  /**
   * Generate a cron pattern from schedule type
   */
  generateCronPattern(scheduleType: string, options: Record<string, any> = {}): string {
    switch (scheduleType) {
      case 'daily':
        const hour = options.hour || 9;
        const minute = options.minute || 0;
        return `${minute} ${hour} * * *`;
      
      case 'weekly':
        const dayOfWeek = options.dayOfWeek || 1; // Monday
        const weeklyHour = options.hour || 9;
        const weeklyMinute = options.minute || 0;
        return `${weeklyMinute} ${weeklyHour} * * ${dayOfWeek}`;
      
      case 'monthly':
        const dayOfMonth = options.dayOfMonth || 1;
        const monthlyHour = options.hour || 9;
        const monthlyMinute = options.minute || 0;
        return `${monthlyMinute} ${monthlyHour} ${dayOfMonth} * *`;
      
      case 'custom':
        return options.pattern || '0 9 * * *';
      
      default:
        return '0 9 * * *'; // Default to daily at 9 AM
    }
  }

  /**
   * Parse a cron pattern to human-readable text
   */
  parseCronPattern(pattern: string): string {
    const parts = pattern.split(' ');
    if (parts.length !== 5) return 'Invalid pattern';
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    if (minute === '0' && hour !== '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return `Daily at ${hour}:00`;
    }
    
    if (minute === '0' && hour !== '*' && dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `Weekly on ${days[parseInt(dayOfWeek)]} at ${hour}:00`;
    }
    
    if (minute === '0' && hour !== '*' && dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') {
      return `Monthly on day ${dayOfMonth} at ${hour}:00`;
    }
    
    return pattern;
  }

  /**
   * Get available target tables for job configuration
   */
  async getAvailableTargetTables(): Promise<string[]> {
    // This is a simplified version. In a real implementation, you would query
    // the database for available tables that can be used as targets.
    return [
      'blog_posts',
      'recipes',
      'blog_comments',
      'recipe_comments',
      'blog_ratings',
      'recipe_ratings'
    ];
  }
}

export const scheduledJobService = new ScheduledJobService();
