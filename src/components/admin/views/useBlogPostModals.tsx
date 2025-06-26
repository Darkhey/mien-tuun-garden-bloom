
import { useState } from 'react';
import { AdminBlogPost } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useBlogPostModals = (loadBlogPosts: () => void, loadInstagramStatuses: () => void) => {
  const [editingPost, setEditingPost] = useState<AdminBlogPost | null>(null);
  const [instagramPost, setInstagramPost] = useState<AdminBlogPost | null>(null);
  const { toast } = useToast();

  const handleEdit = async (post: AdminBlogPost) => {
    try {
      const { data: fullPost, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', post.id)
        .single();

      if (error) throw error;

      console.log('[BlogPostsView] Loaded full post for editing:', fullPost);
      setEditingPost(fullPost);
    } catch (error: any) {
      console.error('[BlogPostsView] Error loading full post:', error);
      toast({
        title: "Fehler",
        description: "Artikel konnte nicht vollständig geladen werden",
        variant: "destructive",
      });
    }
  };

  const handleInstagramPost = (post: AdminBlogPost) => {
    if (post.status !== 'veröffentlicht') {
      toast({
        title: "Hinweis",
        description: "Nur veröffentlichte Artikel können auf Instagram geteilt werden",
        variant: "destructive"
      });
      return;
    }
    setInstagramPost(post);
  };

  const handleInstagramSuccess = () => {
    loadInstagramStatuses();
    toast({
      title: "Erfolg!",
      description: "Post wurde erfolgreich auf Instagram geteilt"
    });
  };

  const closeEditModal = () => {
    setEditingPost(null);
    loadBlogPosts();
  };

  const closeInstagramModal = () => setInstagramPost(null);

  return {
    editingPost,
    instagramPost,
    handleEdit,
    handleInstagramPost,
    handleInstagramSuccess,
    closeEditModal,
    closeInstagramModal
  };
};
