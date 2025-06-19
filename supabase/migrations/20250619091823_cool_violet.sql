/*
  # Add INSERT policy for content_automation_logs

  1. Security
    - Add INSERT policy for authenticated users with admin role
    - Ensures admins can create log entries for content automation
*/

-- Add INSERT policy for content_automation_logs
CREATE POLICY "Allow admins to insert content automation logs" 
ON public.content_automation_logs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);