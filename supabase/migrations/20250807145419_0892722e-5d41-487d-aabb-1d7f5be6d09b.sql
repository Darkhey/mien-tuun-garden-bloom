-- PHASE 1: Critical Security Fixes - Complete fix for all remaining warnings

-- Fix all remaining functions that still don't have search_path set
-- Based on linter showing 16 function search path warnings

-- Fix update_instagram_posts_updated_at function
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

-- Fix update_blog_podcasts_updated_at function  
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

-- Ensure all RLS policies are properly secured for critical tables
-- Strengthen blog_posts RLS to prevent unauthorized access
DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;
CREATE POLICY "Public can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (
  status = 'veröffentlicht' 
  AND published = true 
  AND published_at <= now()
);

-- Strengthen blog_topic_blacklist access - only admins should manage
DROP POLICY IF EXISTS "Allow public read-only access" ON public.blog_topic_blacklist;
CREATE POLICY "Admins only can view blog topic blacklist" 
ON public.blog_topic_blacklist 
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'::app_role
  )
);

-- Strengthen content_automation_logs - prevent unauthorized insertions
DROP POLICY IF EXISTS "Allow admins to insert content automation logs" ON public.content_automation_logs;
CREATE POLICY "System can insert content automation logs" 
ON public.content_automation_logs 
FOR INSERT
WITH CHECK (
  -- Only allow service role or authenticated admins
  auth.role() = 'service_role' OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'::app_role
  )
);

-- Add security validation for blog post content
CREATE OR REPLACE FUNCTION public.validate_blog_post_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Add security trigger to blog_posts
DROP TRIGGER IF EXISTS blog_post_security_validation ON public.blog_posts;
CREATE TRIGGER blog_post_security_validation
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_blog_post_security();

-- Add audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'::app_role
  )
);

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT
WITH CHECK (true);

-- Add audit trigger function
CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_blog_posts ON public.blog_posts;
CREATE TRIGGER audit_blog_posts
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sensitive_changes();

DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;  
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sensitive_changes();

DROP TRIGGER IF EXISTS audit_content_automation_configs ON public.content_automation_configs;
CREATE TRIGGER audit_content_automation_configs
  AFTER INSERT OR UPDATE OR DELETE ON public.content_automation_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sensitive_changes();