-- PHASE 1: Critical Security Fixes

-- Fix all database functions to have secure search_path
-- This prevents schema substitution attacks

-- Fix function: update_instagram_posts_updated_at
CREATE OR REPLACE FUNCTION public.update_instagram_posts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix function: update_blog_podcasts_updated_at
CREATE OR REPLACE FUNCTION public.update_blog_podcasts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix function: check_table_exists
CREATE OR REPLACE FUNCTION public.check_table_exists(p_table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = p_table_name
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$function$;

-- Fix function: calculate_next_run_time
CREATE OR REPLACE FUNCTION public.calculate_next_run_time(cron_expression text)
RETURNS timestamp with time zone
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix function: check_job_health
CREATE OR REPLACE FUNCTION public.check_job_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix function: update_next_run_at
CREATE OR REPLACE FUNCTION public.update_next_run_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.cron_expression != OLD.cron_expression OR NEW.next_run_at IS NULL THEN
    NEW.next_run_at := calculate_next_run_time(NEW.cron_expression);
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix function: check_invitation_code
CREATE OR REPLACE FUNCTION public.check_invitation_code(code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.households WHERE invitation_code = code
  );
END;
$function$;

-- Fix function: generate_invitation_code
CREATE OR REPLACE FUNCTION public.generate_invitation_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  new_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate a unique invitation code
  LOOP
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    IF NOT EXISTS (
      SELECT 1 FROM public.households WHERE invitation_code = new_code AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      NEW.invitation_code := new_code;
      EXIT;
    END IF;
    
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Could not generate unique invitation code after 100 attempts';
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- Fix function: log_security_event
CREATE OR REPLACE FUNCTION public.log_security_event(_event_type text, _target_user_id uuid DEFAULT NULL::uuid, _details jsonb DEFAULT '{}'::jsonb, _severity text DEFAULT 'low'::text)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.security_events (
        event_type, 
        user_id, 
        target_user_id, 
        details, 
        severity
    )
    VALUES (
        _event_type, 
        auth.uid(), 
        _target_user_id, 
        _details, 
        _severity
    )
    RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$function$;

-- Fix function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix function: update_content_automation_configs_updated_at
CREATE OR REPLACE FUNCTION public.update_content_automation_configs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix function: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $function$
SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
);
$function$;

-- Fix function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, split_part(NEW.email, '@', 1));
    RETURN NEW;
END;
$function$;

-- CRITICAL: Fix user_roles RLS policies to prevent privilege escalation
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Public can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;

-- Create secure RLS policies for user_roles
-- Only admins can INSERT new roles (prevents self-privilege escalation)
CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Only admins can UPDATE roles (prevents privilege escalation)
CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Only admins can DELETE roles (prevents removing admin access)
CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Users can view their own roles (read-only access for self-awareness)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all roles (for management purposes)
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Add security logging for role changes
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Log role insertions
  IF TG_OP = 'INSERT' THEN
    PERFORM log_security_event(
      'role_granted',
      NEW.user_id,
      jsonb_build_object('role', NEW.role, 'granted_by', auth.uid()),
      'medium'
    );
    RETURN NEW;
  END IF;
  
  -- Log role deletions
  IF TG_OP = 'DELETE' THEN
    PERFORM log_security_event(
      'role_revoked',
      OLD.user_id,
      jsonb_build_object('role', OLD.role, 'revoked_by', auth.uid()),
      'medium'
    );
    RETURN OLD;
  END IF;
  
  -- Log role updates
  IF TG_OP = 'UPDATE' THEN
    PERFORM log_security_event(
      'role_changed',
      NEW.user_id,
      jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role, 'changed_by', auth.uid()),
      'high'
    );
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Create trigger for role change logging
DROP TRIGGER IF EXISTS user_roles_security_log ON public.user_roles;
CREATE TRIGGER user_roles_security_log
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION log_role_changes();

-- Create security_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  target_user_id uuid REFERENCES auth.users(id),
  details jsonb DEFAULT '{}',
  severity text DEFAULT 'low',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security_events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can view security events"
ON public.security_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- System can insert security events
CREATE POLICY "System can insert security events"
ON public.security_events
FOR INSERT
TO authenticated
WITH CHECK (true);