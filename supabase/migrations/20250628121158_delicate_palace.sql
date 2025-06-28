/*
  # Fix check_table_exists function

  1. Changes
    - Korrigiert die check_table_exists Funktion, um ambiguous column reference zu beheben
    - Stellt sicher, dass die Funktion für alle Benutzer zugänglich ist
  
  2. Security
    - Funktion ist für alle authentifizierten Benutzer zugänglich
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS check_table_exists(p_table_name text);

-- Create an improved version of the function
CREATE OR REPLACE FUNCTION check_table_exists(p_table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION check_table_exists(text) TO public;

-- Comment on function
COMMENT ON FUNCTION check_table_exists(text) IS 'Checks if a table exists in the public schema';