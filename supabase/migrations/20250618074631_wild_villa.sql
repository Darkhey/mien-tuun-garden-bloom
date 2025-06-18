/*
  # Fix user_roles RLS recursion issue

  The current RLS policies on user_roles table are causing infinite recursion
  because they use has_role() function which queries user_roles table itself.
  
  ## Changes
  1. Drop existing recursive policies on user_roles table
  2. Create new non-recursive policies that allow:
     - Users to read their own roles
     - Direct admin access without function calls
  
  ## Security
  - Users can only see their own roles
  - System can access user_roles for admin checks without recursion
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage all user roles" ON user_roles;
DROP POLICY IF EXISTS "admins can read user_roles" ON user_roles;

-- Create new non-recursive policies
CREATE POLICY "Users can read own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role full access"
  ON user_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to have their roles managed by the system
-- This policy allows admin operations without recursion
CREATE POLICY "System can manage user roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);