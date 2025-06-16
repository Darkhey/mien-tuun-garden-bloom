
import { supabase } from "@/integrations/supabase/client";

export interface AutomationPipeline {
  id: string;
  name: string;
  type: 'blog_creation' | 'recipe_generation' | 'seo_optimization' | 'content_analysis';
  status: 'active' | 'inactive' | 'paused' | 'error';
  throughput: number;
  efficiency: number;
  last_run_at?: string;
  stages: PipelineStage[];
  config: Record<string, any>;
}

export interface PipelineStage {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  duration: number;
}

export interface PipelineExecution {
  id: string;
  pipeline_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  stages_progress: Record<string, any>;
  results: Record<string, any>;
  error_message?: string;
}

export interface PipelineConfig {
  id: string;
  batch_size: number;
  quality_threshold: number;
  auto_publish: boolean;
  target_category: string;
}

export interface PipelineStats {
  totalPipelines: number;
  activePipelines: number;
  totalExecutions: number;
  successRate: number;
  avgThroughput: number;
  totalTimeSaved: number;
}

class PipelineService {
  async getPipelines(): Promise<AutomationPipeline[]> {
    const { data, error } = await supabase
      .from('automation_pipelines')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(pipeline => ({
      ...pipeline,
      stages: JSON.parse((pipeline.stages as string) || '[]'),
      config: typeof pipeline.config === 'string'
        ? JSON.parse(pipeline.config as string)
        : (pipeline.config || {})
    })) as AutomationPipeline[];
  }

  async getConfig(): Promise<PipelineConfig | null> {
    const { data, error } = await supabase
      .from('pipeline_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateConfig(config: Partial<PipelineConfig>): Promise<void> {
    const existingConfig = await this.getConfig();
    
    if (existingConfig) {
      const { error } = await supabase
        .from('pipeline_config')
        .update(config)
        .eq('id', existingConfig.id);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('pipeline_config')
        .insert(config);
      
      if (error) throw error;
    }
  }

  async startPipeline(pipelineId: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('pipeline-executor', {
      body: { pipelineId, action: 'start' }
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error || 'Pipeline start failed');
    
    return data.executionId;
  }

  async stopPipeline(pipelineId: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('pipeline-executor', {
      body: { pipelineId, action: 'stop' }
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error || 'Pipeline stop failed');
  }

  async resetPipeline(pipelineId: string): Promise<void> {
    // Reset stages to idle
    const { data: pipeline, error: pipelineError } = await supabase
      .from('automation_pipelines')
      .select('stages')
      .eq('id', pipelineId)
      .single();

    if (pipelineError) throw pipelineError;

    const stages = JSON.parse((pipeline.stages as string) || '[]');
    const resetStages = stages.map((stage: PipelineStage) => ({
      ...stage,
      status: 'idle',
      progress: 0
    }));

    const { error } = await supabase
      .from('automation_pipelines')
      .update({ 
        status: 'inactive',
        stages: JSON.stringify(resetStages)
      })
      .eq('id', pipelineId);

    if (error) throw error;
  }

  async getExecutions(pipelineId?: string): Promise<PipelineExecution[]> {
    let query = supabase
      .from('pipeline_executions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20);

    if (pipelineId) {
      query = query.eq('pipeline_id', pipelineId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []) as PipelineExecution[];
  }

  async getStats(): Promise<PipelineStats> {
    const [pipelinesResult, executionsResult, cronJobsResult] = await Promise.all([
      supabase.from('automation_pipelines').select('*'),
      supabase.from('pipeline_executions').select('*'),
      supabase.from('cron_jobs').select('*')
    ]);

    const pipelines = pipelinesResult.data || [];
    const executions = executionsResult.data || [];
    const cronJobs = cronJobsResult.data || [];

    const totalPipelines = pipelines.length;
    const activePipelines = pipelines.filter(p => p.status === 'active').length;
    const totalExecutions = executions.length;
    const completedExecutions = executions.filter(e => e.status === 'completed').length;
    const successRate = totalExecutions > 0 ? (completedExecutions / totalExecutions) * 100 : 0;
    const avgThroughput = pipelines.reduce((sum, p) => sum + p.throughput, 0) / (pipelines.length || 1);

    // Calculate time saved (rough estimate based on execution duration)
    const totalTimeSaved = executions
      .filter(e => e.duration_ms)
      .reduce((sum, e) => sum + (e.duration_ms || 0), 0) / (1000 * 60 * 60); // Convert to hours

    return {
      totalPipelines,
      activePipelines,
      totalExecutions,
      successRate: Math.round(successRate),
      avgThroughput: Math.round(avgThroughput),
      totalTimeSaved: Math.round(totalTimeSaved)
    };
  }

  // Real-time updates for pipeline status
  subscribeToPipelineUpdates(callback: (pipeline: AutomationPipeline) => void) {
    return supabase
      .channel('pipeline-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'automation_pipelines'
        },
        (payload) => {
          const pipeline = {
            ...payload.new,
            stages: JSON.parse(payload.new.stages || '[]')
          } as AutomationPipeline;
          callback(pipeline);
        }
      )
      .subscribe();
  }

  subscribeToExecutionUpdates(callback: (execution: PipelineExecution) => void) {
    return supabase
      .channel('execution-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pipeline_executions'
        },
        (payload) => {
          callback(payload.new as PipelineExecution);
        }
      )
      .subscribe();
  }
}

export const pipelineService = new PipelineService();
