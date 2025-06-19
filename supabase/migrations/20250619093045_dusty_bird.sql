/*
  # Fix security event logging function

  1. Security
    - Update log_security_event function to run with SECURITY DEFINER privileges
    - This allows the function to bypass RLS policies when inserting security events
    - Ensures admin actions can be properly logged regardless of user permissions

  2. Function Updates
    - Set function owner to postgres for elevated privileges
    - Add SECURITY DEFINER to allow bypassing RLS
    - Maintain existing functionality while fixing permission issues
*/

-- Create or replace the log_security_event function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.log_security_event(
  _event_type text,
  _target_user_id uuid DEFAULT NULL,
  _details jsonb DEFAULT '{}'::jsonb,
  _severity text DEFAULT 'low'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO security_events (
    event_type,
    user_id,
    target_user_id,
    details,
    severity
  ) VALUES (
    _event_type,
    auth.uid(),
    _target_user_id,
    _details,
    _severity
  );
END;
$$;

-- Ensure the function is owned by postgres for elevated privileges
ALTER FUNCTION public.log_security_event(text, uuid, jsonb, text) OWNER TO postgres;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.log_security_event(text, uuid, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event(text, uuid, jsonb, text) TO service_role;