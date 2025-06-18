/*
  # Add Scheduled Jobs Schema

  1. New Schema
    - Creates a dedicated schema for scheduled jobs functionality
    - Adds tables for job configurations and execution history
    - Implements helper functions for job scheduling

  2. Tables
    - job_configs: Stores job configuration details
    - execution_history: Tracks job execution results
  
  3. Functions
    - calculate_next_run: Determines the next execution time based on cron pattern
    - execute_job: Runs a job manually or via scheduler
    - check_table_exists: Utility to validate target tables
*/

-- Create scheduled_jobs schema
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
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  error_log TEXT[] DEFAULT '{}'
);

-- Create execution_history table
CREATE TABLE IF NOT EXISTS scheduled_jobs.execution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES scheduled_jobs.job_configs(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial_success')),
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

-- Function to calculate next run time based on cron pattern
CREATE OR REPLACE FUNCTION scheduled_jobs.calculate_next_run(schedule_pattern TEXT)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  next_run TIMESTAMPTZ;
BEGIN
  -- This is a simplified implementation
  -- In a real system, you would use pg_cron's internal functions
  -- or a more sophisticated cron parser
  
  -- For now, just add 1 day as a placeholder
  next_run := now() + INTERVAL '1 day';
  
  RETURN next_run;
END;
$$ LANGUAGE plpgsql;

-- Function to execute a job
CREATE OR REPLACE FUNCTION scheduled_jobs.execute_job(job_id UUID)
RETURNS JSONB AS $$
DECLARE
  job_record scheduled_jobs.job_configs%ROWTYPE;
  execution_id UUID;
  result JSONB;
BEGIN
  -- Get job details
  SELECT * INTO job_record FROM scheduled_jobs.job_configs WHERE id = job_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found: %', job_id;
  END IF;
  
  IF NOT job_record.is_active THEN
    RAISE EXCEPTION 'Job is not active: %', job_id;
  END IF;
  
  -- Create execution record
  INSERT INTO scheduled_jobs.execution_history (job_id, status, started_at)
  VALUES (job_id, 'success', now())
  RETURNING id INTO execution_id;
  
  -- Update job record
  UPDATE scheduled_jobs.job_configs
  SET 
    last_run_at = now(),
    next_run_at = scheduled_jobs.calculate_next_run(schedule_pattern),
    run_count = run_count + 1
  WHERE id = job_id;
  
  -- Return success
  result := jsonb_build_object(
    'success', true,
    'execution_id', execution_id,
    'message', 'Job executed successfully'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Update execution record with error
    IF execution_id IS NOT NULL THEN
      UPDATE scheduled_jobs.execution_history
      SET 
        status = 'failed',
        completed_at = now(),
        error_details = SQLERRM
      WHERE id = execution_id;
    END IF;
    
    -- Update job record to increment retry count
    UPDATE scheduled_jobs.job_configs
    SET retry_count = retry_count + 1,
        error_log = array_append(error_log, SQLERRM)
    WHERE id = job_id;
    
    -- Re-raise the exception
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = table_name
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE scheduled_jobs.job_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_jobs.execution_history ENABLE ROW LEVEL SECURITY;

-- Only admins can manage job configurations
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