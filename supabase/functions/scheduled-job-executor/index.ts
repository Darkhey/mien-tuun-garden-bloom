import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log(`[ScheduledJobExecutor] Processing request - jobId: ${jobId}, action: ${action}`);

    if (action === 'execute') {
      // Get job details
      const { data: job, error: jobError } = await supabaseClient
        .from('scheduled_jobs.job_configs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError || !job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      if (!job.is_active) {
        throw new Error(`Job is disabled: ${jobId}`);
      }

      // Create execution record
      const { data: executionData, error: executionError } = await supabaseClient
        .from('scheduled_jobs.execution_history')
        .insert({
          job_id: jobId,
          status: 'success',
          started_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (executionError) {
        throw new Error(`Failed to create execution record: ${executionError.message}`);
      }

      const executionId = executionData.id;
      const startTime = Date.now();

      try {
        console.log(`[ScheduledJobExecutor] Executing job: ${job.name}`);
        
        // Check if target table exists
        const { data: tableExists, error: tableError } = await supabaseClient.rpc(
          'check_table_exists',
          { table_name: job.target_table }
        );

        if (tableError || !tableExists) {
          throw new Error(`Target table does not exist: ${job.target_table}`);
        }

        // Process template data
        let templateData = job.template_data;
        
        // Add dynamic values
        templateData = {
          ...templateData,
          created_at: new Date().toISOString()
        };

        // Generate UUID if needed
        if (templateData.id === 'auto') {
          const { data: uuidData } = await supabaseClient.rpc('gen_random_uuid');
          templateData.id = uuidData;
        }

        // Insert the record
        const { data: insertData, error: insertError } = await supabaseClient
          .from(job.target_table)
          .insert([templateData])
          .select('id');

        if (insertError) {
          throw new Error(`Failed to insert record: ${insertError.message}`);
        }

        const duration = Date.now() - startTime;

        // Update execution record
        await supabaseClient
          .from('scheduled_jobs.execution_history')
          .update({
            status: 'success',
            completed_at: new Date().toISOString(),
            duration_ms: duration,
            entries_created: 1,
            entries_failed: 0,
            execution_log: {
              actions: [
                {
                  action: 'insert',
                  table: job.target_table,
                  id: insertData[0]?.id,
                  status: 'success',
                  timestamp: new Date().toISOString()
                }
              ]
            }
          })
          .eq('id', executionId);

        // Update job record
        await supabaseClient
          .from('scheduled_jobs.job_configs')
          .update({
            last_run_at: new Date().toISOString(),
            next_run_at: await supabaseClient.rpc(
              'scheduled_jobs.calculate_next_run',
              { schedule_pattern: job.schedule_pattern }
            ),
            run_count: job.run_count + 1,
            retry_count: 0
          })
          .eq('id', jobId);

        console.log(`[ScheduledJobExecutor] Job executed successfully: ${job.name} (${duration}ms)`);

        return new Response(
          JSON.stringify({
            success: true,
            executionId,
            duration,
            result: { id: insertData[0]?.id }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );

      } catch (executionError) {
        const duration = Date.now() - startTime;
        
        // Update execution record with error
        await supabaseClient
          .from('scheduled_jobs.execution_history')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            duration_ms: duration,
            entries_created: 0,
            entries_failed: 1,
            error_details: executionError.message,
            execution_log: {
              actions: [
                {
                  action: 'insert',
                  table: job.target_table,
                  status: 'failed',
                  error: executionError.message,
                  timestamp: new Date().toISOString()
                }
              ]
            }
          })
          .eq('id', executionId);

        // Update job record to increment retry count
        await supabaseClient
          .from('scheduled_jobs.job_configs')
          .update({
            retry_count: job.retry_count + 1,
            error_log: [...(job.error_log || []), executionError.message]
          })
          .eq('id', jobId);

        console.error(`[ScheduledJobExecutor] Job execution failed: ${executionError.message}`);
        throw executionError;
      }
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );

  } catch (error) {
    console.error('[ScheduledJobExecutor] Error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});