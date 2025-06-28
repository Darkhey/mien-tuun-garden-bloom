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
    try {
      const { data, error } = await supabase
        .from('cron_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all jobs:', error);
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }
  }

  async getCronJobs(): Promise<CronJob[]> {
    return this.getAllJobs();
  }

  async getJobById(id: string): Promise<CronJob | null> {
    try {
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
    } catch (error) {
      console.error(`Error fetching job with ID ${id}:`, error);
      throw new Error(`Failed to fetch job: ${error.message}`);
    }
  }

  async createJob(params: CreateCronJobParams): Promise<CronJob> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) throw new Error('Not authenticated');

      // Validate cron expression
      if (!this.validateCronExpression(params.cron_expression)) {
        throw new Error('Invalid cron expression format');
      }

      // Calculate next run time
      const nextRunAt = this.calculateNextRunTime(params.cron_expression);
      if (!nextRunAt) {
        throw new Error('Could not calculate next run time');
      }

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
        conditions: params.conditions || {},
        next_run_at: nextRunAt.toISOString()
      };

      const { data, error } = await supabase
        .from('cron_jobs')
        .insert(jobData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw new Error(`Failed to create job: ${error.message}`);
    }
  }

  async createCronJob(params: CreateCronJobParams): Promise<CronJob> {
    return this.createJob(params);
  }

  async updateJob(id: string, updates: Partial<CreateCronJobParams>): Promise<CronJob> {
    try {
      const updateData: any = { ...updates };
      
      // Ensure job_type is properly typed
      if (updateData.job_type && typeof updateData.job_type === 'string') {
        updateData.job_type = updateData.job_type as Database['public']['Enums']['job_type'];
      }

      // If cron expression is updated, validate and calculate next run time
      if (updateData.cron_expression) {
        if (!this.validateCronExpression(updateData.cron_expression)) {
          throw new Error('Invalid cron expression format');
        }
        
        const nextRunAt = this.calculateNextRunTime(updateData.cron_expression);
        if (nextRunAt) {
          updateData.next_run_at = nextRunAt.toISOString();
        }
      }

      const { data, error } = await supabase
        .from('cron_jobs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating job with ID ${id}:`, error);
      throw new Error(`Failed to update job: ${error.message}`);
    }
  }

  async deleteJob(id: string): Promise<void> {
    try {
      // First check if the job exists
      const { data: job, error: checkError } = await supabase
        .from('cron_jobs')
        .select('id, name')
        .eq('id', id)
        .single();
        
      if (checkError) {
        if (checkError.code === 'PGRST116') {
          throw new Error(`Job with ID ${id} not found`);
        }
        throw checkError;
      }
      
      // Delete associated execution logs first to avoid foreign key constraints
      const { error: logsError } = await supabase
        .from('job_execution_logs')
        .delete()
        .eq('cron_job_id', id);
        
      if (logsError) {
        console.warn(`Warning: Could not delete execution logs for job ${id}:`, logsError);
      }

      // Now delete the job
      const { error } = await supabase
        .from('cron_jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      console.log(`Job "${job.name}" (${id}) successfully deleted`);
    } catch (error) {
      console.error(`Error deleting job with ID ${id}:`, error);
      throw new Error(`Failed to delete job: ${error.message}`);
    }
  }

  async deleteCronJob(id: string): Promise<void> {
    return this.deleteJob(id);
  }

  async toggleJob(id: string, enabled: boolean): Promise<CronJob> {
    try {
      const { data, error } = await supabase
        .from('cron_jobs')
        .update({ 
          enabled,
          status: enabled ? 'active' : 'inactive'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error toggling job with ID ${id}:`, error);
      throw new Error(`Failed to toggle job: ${error.message}`);
    }
  }

  async toggleCronJob(id: string, enabled: boolean): Promise<CronJob> {
    return this.toggleJob(id, enabled);
  }

  async executeJob(id: string): Promise<{ success: boolean; executionId?: string; error?: string }> {
    try {
      // First check if the job is enabled
      const { data: job, error: jobError } = await supabase
        .from('cron_jobs')
        .select('enabled, name, function_name')
        .eq('id', id)
        .single();

      if (jobError) {
        console.error('Error checking job status:', jobError);
        return { success: false, error: `Job nicht gefunden: ${jobError.message}` };
      }

      if (!job.enabled) {
        return { 
          success: false, 
          error: `Job "${job.name}" ist deaktiviert. Bitte aktivieren Sie den Job zuerst.` 
        };
      }

      console.log(`Executing job "${job.name}" (${id}) with function: ${job.function_name}`);

      const { data, error } = await supabase.functions.invoke('cron-executor', {
        body: { jobId: id, action: 'execute' }
      });

      if (error) {
        console.error('Error invoking cron-executor function:', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Unbekannter Fehler' };
      }

      return { 
        success: true, 
        executionId: data.executionId 
      };
    } catch (error) {
      console.error('Job execution failed:', error);
      return { success: false, error: error.message };
    }
  }

  async executeJobManually(id: string): Promise<{ success: boolean; executionId?: string; error?: string }> {
    return this.executeJob(id);
  }

  async getJobLogs(jobId?: string, limit = 50): Promise<JobExecutionLog[]> {
    try {
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
    } catch (error) {
      console.error('Error fetching job logs:', error);
      throw new Error(`Failed to fetch job logs: ${error.message}`);
    }
  }

  async getJobTemplates(): Promise<JobTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('job_templates')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching job templates:', error);
      throw new Error(`Failed to fetch job templates: ${error.message}`);
    }
  }

  async createJobFromTemplate(templateId: string, customParams?: Partial<CreateCronJobParams>): Promise<CronJob> {
    try {
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
    } catch (error) {
      console.error('Error creating job from template:', error);
      throw new Error(`Failed to create job from template: ${error.message}`);
    }
  }

  async getTemplateById(id: string): Promise<JobTemplate | null> {
    try {
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
    } catch (error) {
      console.error(`Error fetching template with ID ${id}:`, error);
      throw new Error(`Failed to fetch template: ${error.message}`);
    }
  }

  async getScheduledTasks(): Promise<ScheduledTask[]> {
    try {
      const { data, error } = await supabase
        .from('scheduled_tasks')
        .select('*')
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching scheduled tasks:', error);
      throw new Error(`Failed to fetch scheduled tasks: ${error.message}`);
    }
  }

  async createScheduledTask(params: CreateScheduledTaskParams): Promise<ScheduledTask> {
    try {
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
    } catch (error) {
      console.error('Error creating scheduled task:', error);
      throw new Error(`Failed to create scheduled task: ${error.message}`);
    }
  }

  async getJobStats(): Promise<CronJobStats> {
    try {
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
    } catch (error) {
      console.error('Error fetching job statistics:', error);
      throw new Error(`Failed to fetch job statistics: ${error.message}`);
    }
  }

  async getJobStatistics(): Promise<CronJobStats> {
    return this.getJobStats();
  }

  parseCronExpression(expression: string): string {
    try {
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
    } catch (error) {
      console.error('Error parsing cron expression:', error);
      return expression;
    }
  }

  // Validate cron expression
  validateCronExpression(expression: string): boolean {
    // Basic validation for cron expression format
    const parts = expression.split(' ');
    if (parts.length !== 5) return false;
    
    // Check each part for valid format
    const [minute, hour, day, month, weekday] = parts;
    
    // Simple regex patterns for each part
    const minutePattern = /^(\*|([0-5]?[0-9])(-([0-5]?[0-9]))?(\/([0-5]?[0-9]))?(,([0-5]?[0-9])(-([0-5]?[0-9]))?(\/([0-5]?[0-9]))?)*)?$/;
    const hourPattern = /^(\*|([01]?[0-9]|2[0-3])(-([01]?[0-9]|2[0-3]))?(\/([01]?[0-9]|2[0-3]))?(,([01]?[0-9]|2[0-3])(-([01]?[0-9]|2[0-3]))?(\/([01]?[0-9]|2[0-3]))?)*)?$/;
    const dayPattern = /^(\*|([0-2]?[1-9]|3[01])(-([0-2]?[1-9]|3[01]))?(\/([0-2]?[1-9]|3[01]))?(,([0-2]?[1-9]|3[01])(-([0-2]?[1-9]|3[01]))?(\/([0-2]?[1-9]|3[01]))?)*)?$/;
    const monthPattern = /^(\*|([0]?[1-9]|1[0-2])(-([0]?[1-9]|1[0-2]))?(\/([0]?[1-9]|1[0-2]))?(,([0]?[1-9]|1[0-2])(-([0]?[1-9]|1[0-2]))?(\/([0]?[1-9]|1[0-2]))?)*)?$/;
    const weekdayPattern = /^(\*|[0-6](-[0-6])?(\/[0-6])?(,[0-6](-[0-6])?(\/[0-6])?)*)?$/;
    
    return (
      minutePattern.test(minute) &&
      hourPattern.test(hour) &&
      dayPattern.test(day) &&
      monthPattern.test(month) &&
      weekdayPattern.test(weekday)
    );
  }

  // Calculate next run time based on cron expression
  calculateNextRunTime(cronExpression: string): Date | null {
    try {
      if (!this.validateCronExpression(cronExpression)) {
        return null;
      }
      
      // This is a simplified implementation
      // In a real-world scenario, you would use a library like cron-parser
      const now = new Date();
      const [minute, hour, day, month, weekday] = cronExpression.split(' ');
      
      // Simple case: daily at specific hour
      if (minute === '0' && hour !== '*' && day === '*' && month === '*' && weekday === '*') {
        const nextRun = new Date(now);
        nextRun.setHours(parseInt(hour), 0, 0, 0);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        return nextRun;
      }
      
      // Simple case: hourly at specific minute
      if (minute !== '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
        const nextRun = new Date(now);
        nextRun.setMinutes(parseInt(minute), 0, 0);
        if (nextRun <= now) {
          nextRun.setHours(nextRun.getHours() + 1);
        }
        return nextRun;
      }
      
      // Simple case: weekly on specific day and time
      if (minute === '0' && hour !== '*' && day === '*' && month === '*' && weekday !== '*') {
        const nextRun = new Date(now);
        nextRun.setHours(parseInt(hour), 0, 0, 0);
        
        const currentDay = nextRun.getDay();
        const targetDay = parseInt(weekday);
        
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0 || (daysToAdd === 0 && nextRun <= now)) {
          daysToAdd += 7;
        }
        
        nextRun.setDate(nextRun.getDate() + daysToAdd);
        return nextRun;
      }
      
      // Simple case: monthly on specific day and time
      if (minute === '0' && hour !== '*' && day !== '*' && month === '*' && weekday === '*') {
        const nextRun = new Date(now);
        nextRun.setHours(parseInt(hour), 0, 0, 0);
        nextRun.setDate(parseInt(day));
        
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        
        return nextRun;
      }
      
      // For more complex cases, return tomorrow same time as fallback
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // Default to 9 AM
      return tomorrow;
    } catch (error) {
      console.error('Error calculating next run time:', error);
      return null;
    }
  }

  // Generate a cron pattern from schedule type
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
      
      case 'hourly':
        const hourlyMinute = options.minute || 0;
        return `${hourlyMinute} * * * *`;
        
      case 'custom':
        return options.pattern || '0 9 * * *';
      
      default:
        return '0 9 * * *'; // Default to daily at 9 AM
    }
  }

  // Get human-readable schedule description
  getHumanReadableSchedule(cronExpression: string): string {
    try {
      const parts = cronExpression.split(' ');
      if (parts.length !== 5) return 'Ungültiger Zeitplan';
      
      const [minute, hour, day, month, weekday] = parts;
      
      // Daily at specific time
      if (minute !== '*' && hour !== '*' && day === '*' && month === '*' && weekday === '*') {
        return `Täglich um ${hour}:${minute.padStart(2, '0')} Uhr`;
      }
      
      // Hourly at specific minute
      if (minute !== '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
        return `Stündlich bei Minute ${minute}`;
      }
      
      // Weekly on specific day and time
      if (minute !== '*' && hour !== '*' && day === '*' && month === '*' && weekday !== '*') {
        const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        return `Wöchentlich am ${days[parseInt(weekday)]} um ${hour}:${minute.padStart(2, '0')} Uhr`;
      }
      
      // Monthly on specific day and time
      if (minute !== '*' && hour !== '*' && day !== '*' && month === '*' && weekday === '*') {
        return `Monatlich am ${day}. um ${hour}:${minute.padStart(2, '0')} Uhr`;
      }
      
      // Every X minutes
      if (minute.includes('/') && hour === '*' && day === '*' && month === '*' && weekday === '*') {
        const interval = minute.split('/')[1];
        return `Alle ${interval} Minuten`;
      }
      
      return this.parseCronExpression(cronExpression);
    } catch (error) {
      console.error('Error getting human-readable schedule:', error);
      return cronExpression;
    }
  }

  // Get available functions for job creation
  getAvailableFunctions(): { name: string; description: string; category: string }[] {
    return [
      { 
        name: 'generate-blog-post', 
        description: 'Generiert einen neuen Blog-Artikel mit KI', 
        category: 'Content-Generierung' 
      },
      { 
        name: 'generate-recipe', 
        description: 'Erstellt ein neues Rezept mit KI', 
        category: 'Content-Generierung' 
      },
      { 
        name: 'auto-blog-post', 
        description: 'Automatisierte Blog-Post-Erstellung', 
        category: 'Content-Generierung' 
      },
      { 
        name: 'content-automation-executor', 
        description: 'Führt Content-Automatisierungen aus', 
        category: 'Automatisierung' 
      },
      { 
        name: 'ai-content-insights', 
        description: 'Analysiert Content und generiert Insights', 
        category: 'Analyse' 
      },
      { 
        name: 'fetch-current-trends', 
        description: 'Holt aktuelle Trends für Content-Planung', 
        category: 'Analyse' 
      }
    ];
  }

  // Get job health status
  async getJobHealthStatus(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    lastSuccessfulRun: Date | null;
  }> {
    try {
      const [stats, recentLogs] = await Promise.all([
        this.getJobStats(),
        this.getJobLogs(undefined, 20)
      ]);
      
      const issues: string[] = [];
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      // Check success rate
      if (stats.successRate < 50) {
        issues.push(`Niedrige Erfolgsrate (${stats.successRate}%)`);
        status = 'critical';
      } else if (stats.successRate < 80) {
        issues.push(`Mäßige Erfolgsrate (${stats.successRate}%)`);
        status = 'warning';
      }
      
      // Check for recent failures
      const recentFailures = recentLogs.filter(log => log.status === 'failed');
      if (recentFailures.length > 5) {
        issues.push(`${recentFailures.length} fehlgeschlagene Ausführungen in letzter Zeit`);
        status = status === 'healthy' ? 'warning' : status;
      }
      
      // Check for inactive jobs
      const inactiveJobs = stats.totalJobs - stats.activeJobs;
      if (inactiveJobs > 0 && stats.totalJobs > 0) {
        issues.push(`${inactiveJobs} inaktive Jobs (${Math.round((inactiveJobs / stats.totalJobs) * 100)}%)`);
        status = status === 'healthy' ? 'warning' : status;
      }
      
      // Find last successful run
      const lastSuccessful = recentLogs.find(log => log.status === 'completed');
      const lastSuccessfulRun = lastSuccessful ? new Date(lastSuccessful.completed_at || lastSuccessful.started_at) : null;
      
      return {
        status,
        issues,
        lastSuccessfulRun
      };
    } catch (error) {
      console.error('Error getting job health status:', error);
      return {
        status: 'critical',
        issues: ['Fehler beim Abrufen des Job-Status'],
        lastSuccessfulRun: null
      };
    }
  }
}

export const cronJobService = new CronJobService();