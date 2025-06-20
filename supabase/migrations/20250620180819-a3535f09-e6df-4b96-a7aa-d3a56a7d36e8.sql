
/*
  # Fix check_table_exists function

  1. Updates
    - Fix ambiguous column reference in check_table_exists function
    - Rename parameter to avoid conflicts with system columns
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_table_exists(text);

-- Create updated function with unambiguous parameter name
CREATE OR REPLACE FUNCTION check_table_exists(p_table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = p_table_name
  );
END;
$$;
