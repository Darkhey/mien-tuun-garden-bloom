-- Create Instagram posts table for tracking social media shares if it doesn't exist
CREATE TABLE IF NOT EXISTS public.instagram_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  caption TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'posted', 'failed')),
  instagram_id TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security if not already enabled
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'instagram_posts' 
    AND policyname = 'Admins can manage instagram posts'
  ) THEN
    CREATE POLICY "Admins can manage instagram posts" 
      ON public.instagram_posts 
      FOR ALL 
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END
$$;

-- Add indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_instagram_posts_blog_post_id ON public.instagram_posts(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_status ON public.instagram_posts(status);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_created_at ON public.instagram_posts(created_at);

-- Add trigger for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_instagram_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'instagram_posts_updated_at'
  ) THEN
    CREATE TRIGGER instagram_posts_updated_at
      BEFORE UPDATE ON public.instagram_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_instagram_posts_updated_at();
  END IF;
END
$$;