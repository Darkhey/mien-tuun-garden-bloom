
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminBlogPost } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EditBlogPostModal from "../EditBlogPostModal";
import InstagramPostModal from "../InstagramPostModal";
import BlogPostsHeader from "./BlogPostsHeader";
import BlogPostsTable from "./BlogPostsTable";
import BlogPostsBulkActions from "./BlogPostsBulkActions";
import { useBlogPostsData } from "./useBlogPostsData";
import { aiImageGenerationService } from "@/services/AIImageGenerationService";

const BlogPostsView: React.FC = () => {
  const [editingPost, setEditingPost] = useState<AdminBlogPost | null>(null);
  const [instagramPost, setInstagramPost] = useState<AdminBlogPost | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const { toast } = useToast();

  const {
    posts,
    loading,
    error,
    instagramStatuses,
    loadBlogPosts,
    loadInstagramStatuses,
    handleToggleStatus,
    handleDelete
  } = useBlogPostsData();

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

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === posts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(posts.map(p => p.id));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const optimizeTitles = async () => {
    setBulkLoading(true);
    try {
      await Promise.all(
        selectedIds.map(async id => {
          const { data, error } = await supabase
            .from('blog_posts')
            .select('title')
            .eq('id', id)
            .single();

          if (error) throw error;

          const newTitle = `${data.title} (optimiert)`;

          const { error: updateError } = await supabase
            .from('blog_posts')
            .update({ title: newTitle })
            .eq('id', id);

          if (updateError) throw updateError;
        })
      );

      toast({ title: 'Titel aktualisiert', description: 'Ausgewählte Titel wurden optimiert.' });
      loadBlogPosts();
      clearSelection();
    } catch (err: any) {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    } finally {
      setBulkLoading(false);
    }
  };

  const generateImages = async () => {
    setBulkLoading(true);
    try {
      await Promise.all(
        selectedIds.map(async id => {
          const { data, error } = await supabase
            .from('blog_posts')
            .select('title, content, category')
            .eq('id', id)
            .single();

          if (error) throw error;

          const { url } = await aiImageGenerationService.generateBlogImage({
            title: data.title,
            content: data.content || '',
            category: data.category
          });

          const { error: updateError } = await supabase
            .from('blog_posts')
            .update({ featured_image: url })
            .eq('id', id);

          if (updateError) throw updateError;
        })
      );

      toast({ title: 'Bilder generiert', description: 'Neue Bilder wurden erstellt.' });
      loadBlogPosts();
      clearSelection();
    } catch (err: any) {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    } finally {
      setBulkLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin mr-2" /> Blog-Artikel werden geladen...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 p-4 bg-red-50 rounded">{error}</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <BlogPostsHeader
          postsCount={posts.length}
          onRefresh={loadBlogPosts}
        />

        <BlogPostsBulkActions
          selectedCount={selectedIds.length}
          onOptimizeTitles={optimizeTitles}
          onGenerateImages={generateImages}
          onClear={clearSelection}
          loading={bulkLoading}
        />

        <BlogPostsTable
          posts={posts}
          instagramStatuses={instagramStatuses}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onToggleStatus={handleToggleStatus}
          onEdit={handleEdit}
          onInstagramPost={handleInstagramPost}
          onDelete={handleDelete}
        />
      </div>

      {editingPost && (
        <EditBlogPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={() => {
            setEditingPost(null);
            loadBlogPosts();
          }}
        />
      )}

      {instagramPost && (
        <InstagramPostModal
          post={instagramPost}
          isOpen={true}
          onClose={() => setInstagramPost(null)}
          onSuccess={handleInstagramSuccess}
        />
      )}
    </>
  );
};

export default BlogPostsView;
