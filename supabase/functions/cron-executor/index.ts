import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CronJob {
  id: string;
  name: string;
  function_name: string;
  function_payload: Record<string, any>;
  status: string;
  enabled: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { jobId, action } = await req.json();

    console.log(`[CronExecutor] Processing request - jobId: ${jobId}, action: ${action}`);

    if (action === 'execute') {
      // Get job details
      const { data: job, error: jobError } = await supabaseClient
        .from('cron_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError || !job) {
        console.error(`[CronExecutor] Job not found: ${jobId}`, jobError);
        return new Response(
          JSON.stringify({
            error: `Job not found: ${jobId}`,
            success: false
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          }
        );
      }

      if (!job.enabled) {
        console.warn(`[CronExecutor] Job is disabled: ${jobId}`);
        return new Response(
          JSON.stringify({
            error: `Job "${job.name}" ist deaktiviert. Bitte aktivieren Sie den Job zuerst.`,
            success: false,
            jobName: job.name,
            jobEnabled: false
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create execution log
      const { data: logData, error: logError } = await supabaseClient
        .from('job_execution_logs')
        .insert({
          cron_job_id: jobId,
          execution_id: executionId,
          status: 'running',
          retry_attempt: 0,
          resource_usage: {},
          triggered_by: 'manual'
        })
        .select('id')
        .single();

      if (logError) {
        console.error(`[CronExecutor] Failed to create execution log:`, logError);
        return new Response(
          JSON.stringify({
            error: `Failed to create execution log: ${logError.message}`,
            success: false
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }

      const logId = logData.id;
      const startTime = Date.now();

      try {
        console.log(`[CronExecutor] Executing function: ${job.function_name}`);
        
        // Execute the edge function
        const { data: functionResult, error: functionError } = await supabaseClient.functions.invoke(
          job.function_name,
          {
            body: job.function_payload || {}
          }
        );

        if (functionError) {
          throw new Error(`Function execution failed: ${functionError.message}`);
        }

        const duration = Date.now() - startTime;

        // Update execution log with success
        await supabaseClient
          .from('job_execution_logs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            output: functionResult,
            duration_ms: duration,
            resource_usage: {
              execution_time_ms: duration,
              memory_used: 'unknown'
            }
          })
          .eq('id', logId);

        // Update job last run time
        await supabaseClient
          .from('cron_jobs')
          .update({
            last_run_at: new Date().toISOString(),
            status: 'active'
          })
          .eq('id', jobId);

        console.log(`[CronExecutor] Job executed successfully: ${job.name} (${duration}ms)`);

        return new Response(
          JSON.stringify({
            success: true,
            executionId,
            duration,
            result: functionResult,
            jobName: job.name
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );

      } catch (executionError) {
        const duration = Date.now() - startTime;
        const errorMessage = executionError.message || 'Unknown execution error';
        
        console.error(`[CronExecutor] Job execution failed:`, executionError);
        
        // Update execution log with error
        await supabaseClient
          .from('job_execution_logs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: errorMessage,
            duration_ms: duration
          })
          .eq('id', logId);

        // Update job status to error
        await supabaseClient
          .from('cron_jobs')
          .update({
            status: 'error'
          })
          .eq('id', jobId);

        return new Response(
          JSON.stringify({
            error: errorMessage,
            success: false,
            jobName: job.name,
            executionId,
            duration
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }

    } else if (action === 'get_ready_jobs') {
      // Get jobs that are ready to run (scheduled cron jobs)
      const { data: readyJobs, error: readyJobsError } = await supabaseClient
        .from('cron_jobs')
        .select('*')
        .eq('enabled', true)
        .eq('status', 'active')
        .lte('next_run_at', new Date().toISOString());

      if (readyJobsError) {
        console.error(`[CronExecutor] Failed to get ready jobs:`, readyJobsError);
        return new Response(
          JSON.stringify({
            error: `Failed to get ready jobs: ${readyJobsError.message}`,
            success: false
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          readyJobs: readyJobs || []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'update_next_run') {
      const { nextRunAt } = await req.json();
      
      const { error: updateError } = await supabaseClient
        .from('cron_jobs')
        .update({
          next_run_at: nextRunAt
        })
        .eq('id', jobId);

      if (updateError) {
        console.error(`[CronExecutor] Failed to update next run time:`, updateError);
        return new Response(
          JSON.stringify({
            error: `Failed to update next run time: ${updateError.message}`,
            success: false
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'Unknown action',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );

  } catch (error) {
    console.error('[CronExecutor] Unexpected error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});