/*
  # Add Job Health Functions

  1. New Functions
    - Add function to calculate next run time for cron jobs
    - Add function to check job health status
  
  2. Security
    - Functions are accessible to all authenticated users
*/

-- Function to calculate next run time for cron jobs
CREATE OR REPLACE FUNCTION calculate_next_run_time(cron_expression text)
RETURNS timestamp with time zone
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_run timestamp with time zone;
  parts text[];
  minute text;
  hour text;
  day text;
  month text;
  weekday text;
  now_time timestamp with time zone := now();
BEGIN
  -- Parse cron expression
  parts := string_to_array(cron_expression, ' ');
  
  -- Check if valid cron expression
  IF array_length(parts, 1) != 5 THEN
    RETURN NULL;
  END IF;
  
  minute := parts[1];
  hour := parts[2];
  day := parts[3];
  month := parts[4];
  weekday := parts[5];
  
  -- Simple case: daily at specific hour
  IF minute = '0' AND hour != '*' AND day = '*' AND month = '*' AND weekday = '*' THEN
    next_run := date_trunc('day', now_time) + (hour || ' hours')::interval;
    
    -- If next run is in the past, add a day
    IF next_run <= now_time THEN
      next_run := next_run + interval '1 day';
    END IF;
    
    RETURN next_run;
  END IF;
  
  -- Simple case: hourly at specific minute
  IF minute != '*' AND hour = '*' AND day = '*' AND month = '*' AND weekday = '*' THEN
    next_run := date_trunc('hour', now_time) + (minute || ' minutes')::interval;
    
    -- If next run is in the past, add an hour
    IF next_run <= now_time THEN
      next_run := next_run + interval '1 hour';
    END IF;
    
    RETURN next_run;
  END IF;
  
  -- Default: tomorrow at 9 AM
  RETURN date_trunc('day', now_time + interval '1 day') + interval '9 hours';
END;
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION calculate_next_run_time(text) TO public;

-- Comment on function
COMMENT ON FUNCTION calculate_next_run_time(text) IS 'Calculates the next run time for a cron job based on its cron expression';

-- Function to check job health status
CREATE OR REPLACE FUNCTION check_job_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_jobs integer;
  active_jobs integer;
  failed_executions integer;
  total_executions integer;
  success_rate numeric;
  last_successful_run timestamp with time zone;
  issues text[] := '{}';
  health_status text := 'healthy';
BEGIN
  -- Get job counts
  SELECT COUNT(*) INTO total_jobs FROM cron_jobs;
  SELECT COUNT(*) INTO active_jobs FROM cron_jobs WHERE enabled = true AND status = 'active';
  
  -- Get execution statistics
  SELECT COUNT(*) INTO total_executions FROM job_execution_logs WHERE started_at > (now() - interval '7 days');
  SELECT COUNT(*) INTO failed_executions FROM job_execution_logs WHERE status = 'failed' AND started_at > (now() - interval '7 days');
  
  -- Calculate success rate
  IF total_executions > 0 THEN
    success_rate := ((total_executions - failed_executions)::numeric / total_executions) * 100;
  ELSE
    success_rate := 0;
  END IF;
  
  -- Get last successful run
  SELECT completed_at INTO last_successful_run 
  FROM job_execution_logs 
  WHERE status = 'completed' 
  ORDER BY completed_at DESC 
  LIMIT 1;
  
  -- Check for issues
  IF success_rate < 50 THEN
    issues := array_append(issues, 'Niedrige Erfolgsrate (' || round(success_rate) || '%)');
    health_status := 'critical';
  ELSIF success_rate < 80 THEN
    issues := array_append(issues, 'Mäßige Erfolgsrate (' || round(success_rate) || '%)');
    health_status := 'warning';
  END IF;
  
  IF failed_executions > 5 THEN
    issues := array_append(issues, failed_executions || ' fehlgeschlagene Ausführungen in den letzten 7 Tagen');
    IF health_status = 'healthy' THEN
      health_status := 'warning';
    END IF;
  END IF;
  
  IF active_jobs = 0 AND total_jobs > 0 THEN
    issues := array_append(issues, 'Keine aktiven Jobs');
    IF health_status = 'healthy' THEN
      health_status := 'warning';
    END IF;
  END IF;
  
  IF last_successful_run IS NULL OR last_successful_run < (now() - interval '7 days') THEN
    issues := array_append(issues, 'Keine erfolgreiche Ausführung in den letzten 7 Tagen');
    IF health_status = 'healthy' THEN
      health_status := 'warning';
    END IF;
  END IF;
  
  -- Return health status as JSON
  RETURN jsonb_build_object(
    'status', health_status,
    'total_jobs', total_jobs,
    'active_jobs', active_jobs,
    'success_rate', round(success_rate),
    'failed_executions', failed_executions,
    'total_executions', total_executions,
    'last_successful_run', last_successful_run,
    'issues', issues
  );
END;
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION check_job_health() TO public;

-- Comment on function
COMMENT ON FUNCTION check_job_health() IS 'Checks the health status of cron jobs and returns a JSON object with status information';

-- Add next_run_at column to cron_jobs table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'cron_jobs' 
    AND column_name = 'next_run_at'
  ) THEN
    ALTER TABLE public.cron_jobs ADD COLUMN next_run_at timestamp with time zone;
  END IF;
END
$$;

-- Update next_run_at for all jobs
UPDATE public.cron_jobs
SET next_run_at = calculate_next_run_time(cron_expression)
WHERE next_run_at IS NULL;

-- Create trigger to automatically update next_run_at when cron_expression changes
CREATE OR REPLACE FUNCTION update_next_run_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cron_expression != OLD.cron_expression OR NEW.next_run_at IS NULL THEN
    NEW.next_run_at := calculate_next_run_time(NEW.cron_expression);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_next_run_at_trigger ON public.cron_jobs;

-- Create the trigger
CREATE TRIGGER update_next_run_at_trigger
BEFORE UPDATE ON public.cron_jobs
FOR EACH ROW
WHEN (NEW.cron_expression IS DISTINCT FROM OLD.cron_expression OR NEW.next_run_at IS NULL)
EXECUTE FUNCTION update_next_run_at();

-- Create index on next_run_at for better performance
CREATE INDEX IF NOT EXISTS idx_cron_jobs_next_run ON public.cron_jobs(next_run_at)
WHERE enabled = true;