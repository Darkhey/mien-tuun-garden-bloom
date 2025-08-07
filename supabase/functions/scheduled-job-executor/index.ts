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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[scheduled-job-executor] Starting scheduled tasks execution");

    // Get all pending scheduled tasks that are due
    const { data: tasks, error: tasksError } = await supabase
      .from('scheduled_tasks')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('scheduled_for', { ascending: true });

    if (tasksError) {
      console.error("[scheduled-job-executor] Error fetching tasks:", tasksError);
      throw tasksError;
    }

    console.log(`[scheduled-job-executor] Found ${tasks?.length || 0} tasks to execute`);

    const results = [];

    for (const task of tasks || []) {
      try {
        console.log(`[scheduled-job-executor] Executing task: ${task.name} (${task.function_name})`);

        // Mark task as running
        await supabase
          .from('scheduled_tasks')
          .update({
            status: 'running',
            executed_at: new Date().toISOString()
          })
          .eq('id', task.id);

        // Execute the function
        const startTime = Date.now();
        const { data: functionResult, error: functionError } = await supabase.functions.invoke(
          task.function_name,
          {
            body: task.function_payload || {},
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        const duration = Date.now() - startTime;

        if (functionError) {
          console.error(`[scheduled-job-executor] Task ${task.name} failed:`, functionError);
          
          // Mark task as failed
          await supabase
            .from('scheduled_tasks')
            .update({
              status: 'failed',
              error_message: functionError.message,
              result: { error: functionError.message, duration_ms: duration }
            })
            .eq('id', task.id);

          results.push({
            task_id: task.id,
            task_name: task.name,
            status: 'failed',
            error: functionError.message
          });
        } else {
          console.log(`[scheduled-job-executor] Task ${task.name} completed successfully`);
          
          // Mark task as completed
          await supabase
            .from('scheduled_tasks')
            .update({
              status: 'completed',
              result: { data: functionResult, duration_ms: duration }
            })
            .eq('id', task.id);

          results.push({
            task_id: task.id,
            task_name: task.name,
            status: 'completed',
            duration_ms: duration
          });
        }

      } catch (error) {
        console.error(`[scheduled-job-executor] Unexpected error for task ${task.name}:`, error);
        
        // Mark task as failed
        await supabase
          .from('scheduled_tasks')
          .update({
            status: 'failed',
            error_message: error.message,
            result: { error: error.message }
          })
          .eq('id', task.id);

        results.push({
          task_id: task.id,
          task_name: task.name,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Clean up old completed/failed tasks (keep last 100)
    try {
      const { data: oldTasks } = await supabase
        .from('scheduled_tasks')
        .select('id')
        .in('status', ['completed', 'failed'])
        .order('executed_at', { ascending: true })
        .range(100, 9999);

      if (oldTasks && oldTasks.length > 0) {
        const oldTaskIds = oldTasks.map(t => t.id);
        await supabase
          .from('scheduled_tasks')
          .delete()
          .in('id', oldTaskIds);
        
        console.log(`[scheduled-job-executor] Cleaned up ${oldTasks.length} old tasks`);
      }
    } catch (cleanupError) {
      console.error("[scheduled-job-executor] Cleanup error:", cleanupError);
      // Don't fail the main execution for cleanup errors
    }

    console.log("[scheduled-job-executor] Scheduled tasks execution completed", results);

    return new Response(JSON.stringify({
      success: true,
      executed_tasks: results.length,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[scheduled-job-executor] Fatal error:", error);
    return new Response(JSON.stringify({
      error: "Scheduled tasks execution failed",
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
