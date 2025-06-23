
import { useState, useEffect } from 'react';
import { AdminBlogPost } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useBlogPostsData = () => {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instagramStatuses, setInstagramStatuses] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      console.log("[BlogPostsView] Loading blog posts...");
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, status, author, published_at, category, featured, excerpt, featured_image')
        .order('published_at', { ascending: false });

      if (error) throw error;

      const transformedPosts: AdminBlogPost[] = (data || []).map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status || 'entwurf',
        author: post.author,
        published_at: post.published_at,
        category: post.category,
        featured: post.featured || false,
        excerpt: post.excerpt,
        featured_image: post.featured_image,
      }));

      setPosts(transformedPosts);
      await loadInstagramStatuses();
      console.log(`[BlogPostsView] Loaded ${transformedPosts.length} blog posts`);
    } catch (error: any) {
      console.error("[BlogPostsView] Error loading blog posts:", error);
      setError(error.message);
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInstagramStatuses = async () => {
    try {
      const { data: tableExists, error: tableCheckError } = await supabase.rpc(
        'check_table_exists',
        { p_table_name: 'instagram_posts' }
      );

      if (tableCheckError) {
        console.warn('Error checking if instagram_posts table exists:', tableCheckError);
        return;
      }

      if (!tableExists) {
        console.log('Instagram posts table does not exist yet');
        return;
      }

      const { data: instagramData, error: instagramError } = await supabase
        .from('instagram_posts')
        .select('blog_post_id, status');

      if (instagramError) {
        console.error('Error loading Instagram statuses:', instagramError);
        return;
      }

      const statusMap: { [key: string]: string } = {};
      (instagramData || []).forEach(item => {
        statusMap[item.blog_post_id] = item.status;
      });
      
      setInstagramStatuses(statusMap);
    } catch (error) {
      console.error('Error loading Instagram statuses:', error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'veröffentlicht' ? 'entwurf' : 'veröffentlicht';
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          status: newStatus,
          published: newStatus === 'veröffentlicht'
        })
        .eq('id', id);

      if (error) throw error;

      setPosts(posts.map(post => 
        post.id === id 
          ? { ...post, status: newStatus }
          : post
      ));

      toast({
        title: "Status aktualisiert",
        description: `Status wurde auf "${newStatus}" geändert`,
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diesen Artikel wirklich löschen?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== id));

      toast({
        title: "Gelöscht",
        description: "Artikel wurde gelöscht",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadBlogPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    instagramStatuses,
    loadBlogPosts,
    loadInstagramStatuses,
    handleToggleStatus,
    handleDelete
  };
};
