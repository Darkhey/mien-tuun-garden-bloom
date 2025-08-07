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

interface CronJob {
  id: string;
  name: string;
  function_name: string;
  function_payload: any;
  retry_count: number;
  timeout_seconds: number;
  next_run_at: string;
  cron_expression: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[cron-executor] Starting cron job execution check");

    // Get all active cron jobs that are due
    const { data: jobs, error: jobsError } = await supabase
      .from('cron_jobs')
      .select('*')
      .eq('enabled', true)
      .eq('status', 'active')
      .lte('next_run_at', new Date().toISOString());

    if (jobsError) {
      console.error("[cron-executor] Error fetching jobs:", jobsError);
      throw jobsError;
    }

    console.log(`[cron-executor] Found ${jobs?.length || 0} jobs to execute`);

    const results = [];

    for (const job of jobs || []) {
      const executionId = crypto.randomUUID();
      
      try {
        console.log(`[cron-executor] Executing job: ${job.name} (${job.function_name})`);

        // Log job start
        await supabase
          .from('job_execution_logs')
          .insert({
            cron_job_id: job.id,
            execution_id: executionId,
            status: 'running',
            triggered_by: 'cron'
          });

        // Execute the function
        const startTime = Date.now();
        const { data: functionResult, error: functionError } = await supabase.functions.invoke(
          job.function_name,
          {
            body: job.function_payload || {},
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        const duration = Date.now() - startTime;

        if (functionError) {
          console.error(`[cron-executor] Function ${job.function_name} failed:`, functionError);
          
          // Log failure
          await supabase
            .from('job_execution_logs')
            .update({
              status: 'failed',
              error_message: functionError.message,
              duration_ms: duration,
              completed_at: new Date().toISOString()
            })
            .eq('execution_id', executionId);

          results.push({
            job_id: job.id,
            job_name: job.name,
            status: 'failed',
            error: functionError.message
          });
        } else {
          console.log(`[cron-executor] Function ${job.function_name} completed successfully`);
          
          // Log success
          await supabase
            .from('job_execution_logs')
            .update({
              status: 'completed',
              output: functionResult,
              duration_ms: duration,
              completed_at: new Date().toISOString()
            })
            .eq('execution_id', executionId);

          results.push({
            job_id: job.id,
            job_name: job.name,
            status: 'completed',
            duration_ms: duration
          });
        }

        // Update job's last_run_at and calculate next_run_at
        const nextRun = await calculateNextRun(job.cron_expression);
        await supabase
          .from('cron_jobs')
          .update({
            last_run_at: new Date().toISOString(),
            next_run_at: nextRun
          })
          .eq('id', job.id);

      } catch (error) {
        console.error(`[cron-executor] Unexpected error for job ${job.name}:`, error);
        
        // Log unexpected failure
        await supabase
          .from('job_execution_logs')
          .update({
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('execution_id', executionId);

        results.push({
          job_id: job.id,
          job_name: job.name,
          status: 'failed',
          error: error.message
        });
      }
    }

    console.log("[cron-executor] Cron execution completed", results);

    return new Response(JSON.stringify({
      success: true,
      executed_jobs: results.length,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[cron-executor] Fatal error:", error);
    return new Response(JSON.stringify({
      error: "Cron execution failed",
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

// Simple cron expression parser for next run calculation
async function calculateNextRun(cronExpression: string): Promise<string> {
  try {
    // Use database function for accurate calculation
    const { data, error } = await supabase.rpc('calculate_next_run_time', {
      cron_expression: cronExpression
    });
    
    if (error || !data) {
      // Fallback: add 1 hour
      const nextRun = new Date();
      nextRun.setHours(nextRun.getHours() + 1);
      return nextRun.toISOString();
    }
    
    return data;
  } catch (error) {
    console.error("Error calculating next run:", error);
    // Fallback: add 1 hour
    const nextRun = new Date();
    nextRun.setHours(nextRun.getHours() + 1);
    return nextRun.toISOString();
  }
}

serve(handler);