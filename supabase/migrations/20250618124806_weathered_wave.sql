/*
  # Add INSERT policy for content_automation_logs table

  1. Security Changes
    - Add policy for admins to insert content automation logs
    - This allows the ContentAutomationService to log actions properly

  The current RLS policy only allows SELECT operations for admins, but the application
  needs to INSERT log entries when automation actions are performed.
*/

CREATE POLICY "Allow admins to insert content automation logs"
  ON content_automation_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'::app_role
    )
  );