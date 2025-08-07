import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.6";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PipelineStage {
  id: string;
  name: string;
  function_name: string;
  payload: any;
  retry_count?: number;
  depends_on?: string[];
}

interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  config: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pipeline_id, trigger_type = 'manual', trigger_data = {} } = await req.json();

    if (!pipeline_id) {
      return new Response(JSON.stringify({
        error: "pipeline_id is required"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[pipeline-executor] Executing pipeline: ${pipeline_id}`);

    // Get pipeline configuration
    const { data: pipeline, error: pipelineError } = await supabase
      .from('automation_pipelines')
      .select('*')
      .eq('id', pipeline_id)
      .eq('status', 'active')
      .single();

    if (pipelineError || !pipeline) {
      console.error("[pipeline-executor] Pipeline not found or inactive:", pipelineError);
      return new Response(JSON.stringify({
        error: "Pipeline not found or inactive"
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create pipeline execution record
    const executionId = crypto.randomUUID();
    const { data: execution, error: executionError } = await supabase
      .from('pipeline_executions')
      .insert({
        id: executionId,
        pipeline_id: pipeline_id,
        status: 'running',
        stages_progress: {}
      })
      .select()
      .single();

    if (executionError) {
      console.error("[pipeline-executor] Failed to create execution record:", executionError);
      throw executionError;
    }

    const stages = pipeline.stages || [];
    const stageResults = {};
    const stageProgress = {};
    let hasErrors = false;

    try {
      // Execute stages in dependency order
      const executedStages = new Set();
      const stageQueue = [...stages];

      while (stageQueue.length > 0 && !hasErrors) {
        const readyStages = stageQueue.filter(stage => {
          if (executedStages.has(stage.id)) return false;
          
          const dependencies = stage.depends_on || [];
          return dependencies.every(dep => executedStages.has(dep));
        });

        if (readyStages.length === 0) {
          console.error("[pipeline-executor] Circular dependency or missing dependencies");
          hasErrors = true;
          break;
        }

        // Execute ready stages in parallel
        const stagePromises = readyStages.map(async (stage) => {
          const stageStartTime = Date.now();
          stageProgress[stage.id] = { status: 'running', started_at: new Date().toISOString() };
          
          // Update progress
          await supabase
            .from('pipeline_executions')
            .update({ stages_progress: stageProgress })
            .eq('id', executionId);

          try {
            console.log(`[pipeline-executor] Executing stage: ${stage.name} (${stage.function_name})`);

            // Prepare stage payload with context
            const stagePayload = {
              ...stage.payload,
              trigger_data,
              previous_results: stageResults,
              pipeline_execution_id: executionId
            };

            // Execute stage function
            const { data: stageResult, error: stageError } = await supabase.functions.invoke(
              stage.function_name,
              {
                body: stagePayload,
                headers: { 'Content-Type': 'application/json' }
              }
            );

            const stageDuration = Date.now() - stageStartTime;

            if (stageError) {
              console.error(`[pipeline-executor] Stage ${stage.name} failed:`, stageError);
              stageProgress[stage.id] = {
                status: 'failed',
                error: stageError.message,
                duration_ms: stageDuration,
                completed_at: new Date().toISOString()
              };
              throw new Error(`Stage ${stage.name} failed: ${stageError.message}`);
            } else {
              console.log(`[pipeline-executor] Stage ${stage.name} completed successfully`);
              stageResults[stage.id] = stageResult;
              stageProgress[stage.id] = {
                status: 'completed',
                result: stageResult,
                duration_ms: stageDuration,
                completed_at: new Date().toISOString()
              };
              executedStages.add(stage.id);
            }

          } catch (error) {
            console.error(`[pipeline-executor] Stage ${stage.name} error:`, error);
            stageProgress[stage.id] = {
              status: 'failed',
              error: error.message,
              completed_at: new Date().toISOString()
            };
            throw error;
          }
        });

        try {
          await Promise.all(stagePromises);
          
          // Remove executed stages from queue
          readyStages.forEach(stage => {
            const index = stageQueue.findIndex(s => s.id === stage.id);
            if (index >= 0) stageQueue.splice(index, 1);
          });

        } catch (error) {
          console.error("[pipeline-executor] Stage execution failed:", error);
          hasErrors = true;
        }

        // Update progress after each batch
        await supabase
          .from('pipeline_executions')
          .update({ stages_progress: stageProgress })
          .eq('id', executionId);
      }

      // Update final execution status
      const finalStatus = hasErrors ? 'failed' : 'completed';
      await supabase
        .from('pipeline_executions')
        .update({
          status: finalStatus,
          results: stageResults,
          stages_progress: stageProgress,
          completed_at: new Date().toISOString()
        })
        .eq('id', executionId);

      // Update pipeline metrics
      await supabase
        .from('automation_pipelines')
        .update({
          last_run_at: new Date().toISOString(),
          efficiency: hasErrors ? Math.max(0, (pipeline.efficiency || 0) - 5) : Math.min(100, (pipeline.efficiency || 0) + 2),
          throughput: (pipeline.throughput || 0) + 1
        })
        .eq('id', pipeline_id);

      console.log(`[pipeline-executor] Pipeline ${pipeline_id} execution completed with status: ${finalStatus}`);

      return new Response(JSON.stringify({
        success: !hasErrors,
        execution_id: executionId,
        status: finalStatus,
        stages_executed: executedStages.size,
        total_stages: stages.length,
        results: stageResults,
        stages_progress: stageProgress
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (error) {
      console.error("[pipeline-executor] Pipeline execution error:", error);
      
      // Update execution with error
      await supabase
        .from('pipeline_executions')
        .update({
          status: 'failed',
          error_message: error.message,
          stages_progress: stageProgress,
          completed_at: new Date().toISOString()
        })
        .eq('id', executionId);

      throw error;
    }

  } catch (error) {
    console.error("[pipeline-executor] Fatal error:", error);
    return new Response(JSON.stringify({
      error: "Pipeline execution failed",
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);