/*
  # Fix check_table_exists function

  1. New Functions
    - Improved check_table_exists function that avoids ambiguous column reference
  
  2. Security
    - Function is accessible to all authenticated users
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

-- Create instagram_posts table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'instagram_posts'
  ) THEN
    CREATE TABLE public.instagram_posts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      blog_post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
      caption text NOT NULL,
      image_url text,
      status text NOT NULL DEFAULT 'pending',
      instagram_id text,
      scheduled_at timestamp with time zone,
      posted_at timestamp with time zone,
      error_message text,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      updated_at timestamp with time zone DEFAULT now() NOT NULL
    );

    -- Add RLS policies
    ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

    -- Create policy for admins to manage all posts
    CREATE POLICY "Admins can manage instagram posts" 
      ON public.instagram_posts 
      FOR ALL 
      TO authenticated 
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_roles.user_id = auth.uid() 
          AND user_roles.role = 'admin'
        )
      );

    -- Create trigger for updated_at
    CREATE OR REPLACE FUNCTION update_instagram_posts_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER instagram_posts_updated_at
    BEFORE UPDATE ON public.instagram_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_instagram_posts_updated_at();
  END IF;
END
$$;