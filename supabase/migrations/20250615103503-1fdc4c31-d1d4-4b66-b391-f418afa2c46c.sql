
-- Add RLS policies for blog_posts table
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access only for published posts
CREATE POLICY "Public can view published blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'veröffentlicht' AND published = true);

-- Allow admins to have full access to all blog posts
CREATE POLICY "Admins have full access to blog posts"
  ON public.blog_posts
  FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role));

-- Add RLS policies for blog_topic_history table
ALTER TABLE public.blog_topic_history ENABLE ROW LEVEL SECURITY;

-- Only admins can read blog topic history
CREATE POLICY "Admins can view blog topic history"
  ON public.blog_topic_history
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role));

-- Only admins can insert/update blog topic history
CREATE POLICY "Admins can manage blog topic history"
  ON public.blog_topic_history
  FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role));

-- Add missing RLS policies for other tables that need them
ALTER TABLE public.recipe_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own recipe ratings"
  ON public.recipe_ratings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.recipe_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own recipe comments"
  ON public.recipe_comments
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow public read access to recipe comments and ratings
CREATE POLICY "Public can view recipe ratings"
  ON public.recipe_ratings
  FOR SELECT
  USING (true);

CREATE POLICY "Public can view recipe comments"
  ON public.recipe_comments
  FOR SELECT
  USING (true);

ALTER TABLE public.blog_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own blog ratings"
  ON public.blog_ratings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view blog ratings"
  ON public.blog_ratings
  FOR SELECT
  USING (true);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own blog comments"
  ON public.blog_comments
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view blog comments"
  ON public.blog_comments
  FOR SELECT
  USING (true);
