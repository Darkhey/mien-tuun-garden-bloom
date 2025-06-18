-- Add user_id column and insert policy for blog_posts
ALTER TABLE public.blog_posts ADD COLUMN user_id uuid;
ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON DELETE SET NULL;

-- Allow users to insert their own blog posts
CREATE POLICY "Users can insert blog_posts"
  ON public.blog_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
