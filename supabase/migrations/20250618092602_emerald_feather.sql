/*
  # Add scheduled jobs schema and tables
  
  1. New Schema
    - `scheduled_jobs` schema for organizing job-related tables
  
  2. New Tables
    - `job_configs` - Configuration for scheduled jobs
    - `execution_history` - History of job executions
  
  3. Functions
    - `check_table_exists` - Utility function to check if a table exists
    - `calculate_next_run` - Calculate the next run time based on cron pattern
    - `execute_job` - Function to execute a scheduled job
*/

-- Create scheduled_jobs schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS scheduled_jobs;

-- Create job_configs table
CREATE TABLE IF NOT EXISTS scheduled_jobs.job_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  schedule_pattern TEXT NOT NULL,
  schedule_type TEXT NOT NULL,
  target_table TEXT NOT NULL,
  template_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  error_log JSONB DEFAULT '[]'::jsonb
);

-- Create execution_history table
CREATE TABLE IF NOT EXISTS scheduled_jobs.execution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES scheduled_jobs.job_configs(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  entries_created INTEGER DEFAULT 0,
  entries_failed INTEGER DEFAULT 0,
  error_details TEXT,
  execution_log JSONB
);

-- Create updated_at trigger for job_configs
CREATE OR REPLACE FUNCTION scheduled_jobs.update_job_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_configs_updated_at
BEFORE UPDATE ON scheduled_jobs.job_configs
FOR EACH ROW
EXECUTE FUNCTION scheduled_jobs.update_job_configs_updated_at();

-- Create function to check if a table exists
CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate next run time based on cron pattern
CREATE OR REPLACE FUNCTION scheduled_jobs.calculate_next_run(schedule_pattern TEXT)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  next_run TIMESTAMPTZ;
BEGIN
  -- This is a simplified implementation
  -- In a real system, you would use a proper cron parser
  -- For now, we'll just add 24 hours to the current time
  next_run := now() + interval '24 hours';
  RETURN next_run;
END;
$$ LANGUAGE plpgsql;

-- Create function to execute a job
CREATE OR REPLACE FUNCTION scheduled_jobs.execute_job(job_id UUID)
RETURNS JSONB AS $$
DECLARE
  job_record scheduled_jobs.job_configs%ROWTYPE;
  execution_id UUID;
  target_exists BOOLEAN;
  template_data JSONB;
  result JSONB;
BEGIN
  -- Get job configuration
  SELECT * INTO job_record FROM scheduled_jobs.job_configs WHERE id = job_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job with ID % not found', job_id;
  END IF;
  
  -- Check if target table exists
  SELECT check_table_exists(job_record.target_table) INTO target_exists;
  
  IF NOT target_exists THEN
    RAISE EXCEPTION 'Target table % does not exist', job_record.target_table;
  END IF;
  
  -- Create execution record
  INSERT INTO scheduled_jobs.execution_history (
    job_id, 
    status, 
    started_at
  ) VALUES (
    job_id, 
    'running', 
    now()
  ) RETURNING id INTO execution_id;
  
  -- Process template data
  template_data := job_record.template_data;
  
  -- Add dynamic values
  template_data := jsonb_set(template_data, '{created_at}', to_jsonb(now()::text));
  
  -- Generate UUID if needed
  IF template_data->>'id' = 'auto' THEN
    template_data := jsonb_set(template_data, '{id}', to_jsonb(gen_random_uuid()::text));
  END IF;
  
  -- Execute the job (insert data into target table)
  BEGIN
    EXECUTE format(
      'INSERT INTO %I SELECT * FROM jsonb_populate_record(null::%I, $1) RETURNING id',
      job_record.target_table,
      job_record.target_table
    ) USING template_data INTO result;
    
    -- Update execution record
    UPDATE scheduled_jobs.execution_history SET
      status = 'success',
      completed_at = now(),
      duration_ms = EXTRACT(EPOCH FROM now() - started_at) * 1000,
      entries_created = 1,
      entries_failed = 0,
      execution_log = jsonb_build_object(
        'actions', jsonb_build_array(
          jsonb_build_object(
            'action', 'insert',
            'table', job_record.target_table,
            'id', result,
            'status', 'success',
            'timestamp', now()
          )
        )
      )
    WHERE id = execution_id;
    
    -- Update job record
    UPDATE scheduled_jobs.job_configs SET
      last_run_at = now(),
      next_run_at = scheduled_jobs.calculate_next_run(schedule_pattern),
      run_count = run_count + 1,
      retry_count = 0
    WHERE id = job_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'execution_id', execution_id,
      'result', result
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Update execution record with error
    UPDATE scheduled_jobs.execution_history SET
      status = 'failed',
      completed_at = now(),
      duration_ms = EXTRACT(EPOCH FROM now() - started_at) * 1000,
      entries_created = 0,
      entries_failed = 1,
      error_details = SQLERRM,
      execution_log = jsonb_build_object(
        'actions', jsonb_build_array(
          jsonb_build_object(
            'action', 'insert',
            'table', job_record.target_table,
            'status', 'failed',
            'error', SQLERRM,
            'timestamp', now()
          )
        )
      )
    WHERE id = execution_id;
    
    -- Update job record to increment retry count
    UPDATE scheduled_jobs.job_configs SET
      retry_count = retry_count + 1,
      error_log = error_log || jsonb_build_array(jsonb_build_object(
        'timestamp', now(),
        'error', SQLERRM
      ))
    WHERE id = job_id;
    
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies
ALTER TABLE scheduled_jobs.job_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_jobs.execution_history ENABLE ROW LEVEL SECURITY;

-- Only admins can manage job configs
CREATE POLICY "Admins can manage job configs"
  ON scheduled_jobs.job_configs
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  ));

-- Only admins can view execution history
CREATE POLICY "Admins can view execution history"
  ON scheduled_jobs.execution_history
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  ));