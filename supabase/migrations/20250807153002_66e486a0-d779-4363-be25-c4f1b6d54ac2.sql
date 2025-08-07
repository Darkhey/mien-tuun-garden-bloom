-- Fix security warnings: Add SET search_path TO 'public' to all functions that need it

-- Fix validate_blog_post_security function
CREATE OR REPLACE FUNCTION public.validate_blog_post_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prevent script injection in content
  IF NEW.content ~* '<script|javascript:|on\w+=' THEN
    RAISE EXCEPTION 'Potentially dangerous content detected';
  END IF;
  
  -- Validate that published posts have required fields
  IF NEW.status = 'veröffentlicht' AND NEW.published = true THEN
    IF NEW.title IS NULL OR NEW.content IS NULL OR NEW.excerpt IS NULL THEN
      RAISE EXCEPTION 'Published posts must have title, content, and excerpt';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix update_blog_podcasts_updated_at function
CREATE OR REPLACE FUNCTION public.update_blog_podcasts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_instagram_posts_updated_at function
CREATE OR REPLACE FUNCTION public.update_instagram_posts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix audit_sensitive_changes function
CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log changes to sensitive tables
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  )
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fix calculate_next_run_time function
CREATE OR REPLACE FUNCTION public.calculate_next_run_time(cron_expression text)
RETURNS timestamp with time zone
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Fix check_job_health function
CREATE OR REPLACE FUNCTION public.check_job_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Fix update_next_run_at function
CREATE OR REPLACE FUNCTION public.update_next_run_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.cron_expression != OLD.cron_expression OR NEW.next_run_at IS NULL THEN
    NEW.next_run_at := calculate_next_run_time(NEW.cron_expression);
  END IF;
  RETURN NEW;
END;
$$;

-- Fix check_invitation_code function
CREATE OR REPLACE FUNCTION public.check_invitation_code(code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.households WHERE invitation_code = code
  );
END;
$$;

-- Fix generate_invitation_code function
CREATE OR REPLACE FUNCTION public.generate_invitation_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
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
$$;

-- Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(_event_type text, _target_user_id uuid DEFAULT NULL::uuid, _details jsonb DEFAULT '{}'::jsonb, _severity text DEFAULT 'low'::text)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
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
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix update_content_automation_configs_updated_at function
CREATE OR REPLACE FUNCTION public.update_content_automation_configs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix has_role function (already correct SQL function, just ensuring proper declaration)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
);
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, split_part(NEW.email, '@', 1));
    RETURN NEW;
END;
$$;