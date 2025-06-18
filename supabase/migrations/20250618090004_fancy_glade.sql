-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a schema for our scheduled jobs
CREATE SCHEMA IF NOT EXISTS scheduled_jobs;

-- Create a table to store job configurations
CREATE TABLE IF NOT EXISTS scheduled_jobs.job_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  schedule_pattern TEXT NOT NULL, -- cron pattern (e.g., '0 9 * * 1' for every Monday at 9 AM)
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'custom')),
  target_table TEXT NOT NULL,
  template_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  retry_count INTEGER DEFAULT 0,
  error_log TEXT[]
);

-- Enable RLS on job_configs
ALTER TABLE scheduled_jobs.job_configs ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage job configs
CREATE POLICY "Admins can manage job configs" 
ON scheduled_jobs.job_configs
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
);

-- Create a table to store job execution history
CREATE TABLE IF NOT EXISTS scheduled_jobs.execution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES scheduled_jobs.job_configs(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial_success')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  entries_created INTEGER DEFAULT 0,
  entries_failed INTEGER DEFAULT 0,
  error_details TEXT,
  execution_log JSONB
);

-- Enable RLS on execution_history
ALTER TABLE scheduled_jobs.execution_history ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view execution history
CREATE POLICY "Admins can view execution history" 
ON scheduled_jobs.execution_history
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION scheduled_jobs.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_job_configs_updated_at
BEFORE UPDATE ON scheduled_jobs.job_configs
FOR EACH ROW
EXECUTE FUNCTION scheduled_jobs.update_updated_at_column();

-- Create a function to calculate the next run time based on schedule pattern
CREATE OR REPLACE FUNCTION scheduled_jobs.calculate_next_run(schedule_pattern TEXT)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  next_run TIMESTAMPTZ;
BEGIN
  -- This is a simplified version. In a real implementation, you would parse the cron pattern
  -- and calculate the next run time based on it.
  -- For now, we'll just set it to 24 hours from now
  next_run := now() + INTERVAL '24 hours';
  RETURN next_run;
END;
$$ LANGUAGE plpgsql;

-- Create a function to execute a job
CREATE OR REPLACE FUNCTION scheduled_jobs.execute_job(job_id UUID)
RETURNS VOID AS $$
DECLARE
  job_record scheduled_jobs.job_configs;
  execution_id UUID;
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
  duration_ms INTEGER;
  entries_created INTEGER := 0;
  entries_failed INTEGER := 0;
  error_details TEXT;
  execution_log JSONB := '[]'::JSONB;
  target_table_exists BOOLEAN;
  template_record JSONB;
  new_entry_id UUID;
  entry_error TEXT;
BEGIN
  -- Get the job configuration
  SELECT * INTO job_record FROM scheduled_jobs.job_configs WHERE id = job_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job with ID % not found', job_id;
  END IF;
  
  -- Check if job is active
  IF NOT job_record.is_active THEN
    RAISE EXCEPTION 'Job % is not active', job_record.name;
  END IF;
  
  -- Create execution history record
  INSERT INTO scheduled_jobs.execution_history (job_id, status, started_at)
  VALUES (job_id, 'success', now())
  RETURNING id INTO execution_id;
  
  start_time := now();
  
  -- Check if target table exists
  EXECUTE format('
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = ''public'' 
      AND table_name = %L
    )', job_record.target_table)
  INTO target_table_exists;
  
  IF NOT target_table_exists THEN
    error_details := format('Target table %s does not exist', job_record.target_table);
    
    UPDATE scheduled_jobs.execution_history
    SET status = 'failed',
        completed_at = now(),
        error_details = error_details
    WHERE id = execution_id;
    
    RAISE EXCEPTION '%', error_details;
  END IF;
  
  -- Process template data and create entries
  template_record := job_record.template_data;
  
  -- Add dynamic values to template
  template_record := jsonb_set(
    template_record, 
    '{created_at}', 
    to_jsonb(now())
  );
  
  -- Add a generated UUID if needed
  IF template_record ? 'id' AND template_record->>'id' = 'auto' THEN
    template_record := jsonb_set(
      template_record,
      '{id}',
      to_jsonb(gen_random_uuid())
    );
  END IF;
  
  -- Try to insert the record
  BEGIN
    EXECUTE format('
      INSERT INTO public.%I 
      SELECT * FROM jsonb_populate_record(null::%I, %L)
      RETURNING id', 
      job_record.target_table, 
      job_record.target_table,
      template_record
    ) INTO new_entry_id;
    
    entries_created := entries_created + 1;
    execution_log := execution_log || jsonb_build_object(
      'action', 'insert',
      'table', job_record.target_table,
      'id', new_entry_id,
      'status', 'success',
      'timestamp', now()
    );
    
  EXCEPTION WHEN OTHERS THEN
    entries_failed := entries_failed + 1;
    entry_error := SQLERRM;
    
    execution_log := execution_log || jsonb_build_object(
      'action', 'insert',
      'table', job_record.target_table,
      'status', 'failed',
      'error', entry_error,
      'timestamp', now()
    );
    
    -- Log the error but continue processing
    RAISE NOTICE 'Error creating entry: %', entry_error;
  END;
  
  -- Update job record
  UPDATE scheduled_jobs.job_configs
  SET last_run_at = now(),
      next_run_at = scheduled_jobs.calculate_next_run(schedule_pattern),
      run_count = run_count + 1,
      retry_count = 0 -- Reset retry count on successful execution
  WHERE id = job_id;
  
  -- Update execution history
  end_time := now();
  duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  
  UPDATE scheduled_jobs.execution_history
  SET status = CASE 
                WHEN entries_failed > 0 AND entries_created > 0 THEN 'partial_success'
                WHEN entries_failed > 0 AND entries_created = 0 THEN 'failed'
                ELSE 'success'
               END,
      completed_at = end_time,
      duration_ms = duration_ms,
      entries_created = entries_created,
      entries_failed = entries_failed,
      error_details = CASE WHEN entries_failed > 0 THEN entry_error ELSE NULL END,
      execution_log = execution_log
  WHERE id = execution_id;
  
EXCEPTION WHEN OTHERS THEN
  -- Handle any unexpected errors
  error_details := SQLERRM;
  
  -- Update execution history with error
  UPDATE scheduled_jobs.execution_history
  SET status = 'failed',
      completed_at = now(),
      error_details = error_details
  WHERE id = execution_id;
  
  -- Update job record to increment retry count
  UPDATE scheduled_jobs.job_configs
  SET retry_count = retry_count + 1,
      error_log = array_append(error_log, error_details)
  WHERE id = job_id;
  
  -- Raise the exception to be logged
  RAISE EXCEPTION 'Job execution failed: %', error_details;
END;
$$ LANGUAGE plpgsql;

-- Create a function to schedule a job using pg_cron
CREATE OR REPLACE FUNCTION scheduled_jobs.schedule_job(job_id UUID)
RETURNS VOID AS $$
DECLARE
  job_record scheduled_jobs.job_configs;
  cron_job_name TEXT;
BEGIN
  -- Get the job configuration
  SELECT * INTO job_record FROM scheduled_jobs.job_configs WHERE id = job_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job with ID % not found', job_id;
  END IF;
  
  -- Create a unique name for the cron job
  cron_job_name := 'job_' || job_id::text;
  
  -- Schedule the job using pg_cron
  PERFORM cron.schedule(
    cron_job_name,
    job_record.schedule_pattern,
    format('SELECT scheduled_jobs.execute_job(%L)', job_id)
  );
  
  -- Update the next run time
  UPDATE scheduled_jobs.job_configs
  SET next_run_at = scheduled_jobs.calculate_next_run(schedule_pattern)
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to unschedule a job
CREATE OR REPLACE FUNCTION scheduled_jobs.unschedule_job(job_id UUID)
RETURNS VOID AS $$
DECLARE
  cron_job_name TEXT;
BEGIN
  -- Create the job name
  cron_job_name := 'job_' || job_id::text;
  
  -- Unschedule the job
  PERFORM cron.unschedule(cron_job_name);
  
  -- Update the job record
  UPDATE scheduled_jobs.job_configs
  SET is_active = false
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to reschedule a job with a new pattern
CREATE OR REPLACE FUNCTION scheduled_jobs.reschedule_job(job_id UUID, new_pattern TEXT)
RETURNS VOID AS $$
BEGIN
  -- Unschedule the existing job
  PERFORM scheduled_jobs.unschedule_job(job_id);
  
  -- Update the job record with the new pattern
  UPDATE scheduled_jobs.job_configs
  SET schedule_pattern = new_pattern,
      is_active = true
  WHERE id = job_id;
  
  -- Schedule the job with the new pattern
  PERFORM scheduled_jobs.schedule_job(job_id);
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to automatically schedule/unschedule jobs
CREATE OR REPLACE FUNCTION scheduled_jobs.manage_job_schedule()
RETURNS TRIGGER AS $$
BEGIN
  -- If a job is being activated
  IF (TG_OP = 'INSERT' AND NEW.is_active) OR 
     (TG_OP = 'UPDATE' AND NEW.is_active AND (OLD.is_active = false OR OLD.schedule_pattern <> NEW.schedule_pattern)) THEN
    PERFORM scheduled_jobs.schedule_job(NEW.id);
  -- If a job is being deactivated
  ELSIF TG_OP = 'UPDATE' AND OLD.is_active AND NOT NEW.is_active THEN
    PERFORM scheduled_jobs.unschedule_job(NEW.id);
  -- If a job is being deleted
  ELSIF TG_OP = 'DELETE' AND OLD.is_active THEN
    PERFORM scheduled_jobs.unschedule_job(OLD.id);
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to manage job scheduling
CREATE TRIGGER manage_job_schedule_trigger
AFTER INSERT OR UPDATE OR DELETE ON scheduled_jobs.job_configs
FOR EACH ROW
EXECUTE FUNCTION scheduled_jobs.manage_job_schedule();