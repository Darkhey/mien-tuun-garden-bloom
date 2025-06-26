import React, { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { AdminBlogPost } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EditBlogPostModal from "../EditBlogPostModal";
import InstagramPostModal from "../InstagramPostModal";
import BlogPostsHeader from "./BlogPostsHeader";
import BlogPostsFilter from "./BlogPostsFilter";
import BlogPostsTable from "./BlogPostsTable";
import BlogPostsBulkActions from "./BlogPostsBulkActions";
import { useBlogPostsData } from "./useBlogPostsData";
import { aiImageGenerationService } from "@/services/AIImageGenerationService";
import { contentInsightsService } from "@/services/ContentInsightsService";
import { BLOG_CATEGORIES } from "../blogHelpers";

const BlogPostsView: React.FC = () => {
  const [editingPost, setEditingPost] = useState<AdminBlogPost | null>(null);
  const [instagramPost, setInstagramPost] = useState<AdminBlogPost | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<'date' | 'title'>('date');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');
  const categories = BLOG_CATEGORIES;

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

  const toggleSelectAll = (visiblePosts: AdminBlogPost[]) => {
    const allSelected = visiblePosts.every(p => selectedIds.includes(p.id));

    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visiblePosts.some(p => p.id === id)));
    } else {
      const newIds = visiblePosts.map(p => p.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...newIds])));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const cancelOperation = () => {
    abortController?.abort();
    setAbortController(null);
    setBulkLoading(false);
  };

  const optimizeTitles = async () => {
    const controller = new AbortController();
    setAbortController(controller);
    setBulkLoading(true);
    setProgress(0);
    try {
      const results = await Promise.allSettled(
        selectedIds.map((id, idx) =>
          (async () => {
            await new Promise(res => setTimeout(res, idx * 1000));
            if (controller.signal.aborted) throw new Error('aborted');
            const { data, error } = await supabase
              .from('blog_posts')
              .select('title, content, category, seo_keywords')
              .eq('id', id)
              .single();

            if (error) throw error;

            const optimization = await contentInsightsService.optimizeContent({
              title: data.title,
              content: data.content || '',
              category: data.category,
              seoKeywords: data.seo_keywords,
            });
            if (controller.signal.aborted) throw new Error('aborted');

            const newTitle = optimization.optimizedTitle || data.title;

            const { error: updateError } = await supabase
              .from('blog_posts')
              .update({ title: newTitle })
              .eq('id', id);

            if (updateError) throw updateError;
            if (controller.signal.aborted) throw new Error('aborted');
            setProgress(Math.round(((idx + 1) / selectedIds.length) * 100));
            return id;
          })()
        )
      );

      const failed = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
      if (failed.length) {
        toast({
          title: 'Teilweise fehlgeschlagen',
          description: `${failed.length} Artikel konnten nicht optimiert werden`,
          variant: 'destructive'
        });
      } else {
        toast({ title: 'Titel aktualisiert', description: 'Ausgewählte Titel wurden optimiert.' });
      }

      loadBlogPosts();
      clearSelection();
    } catch (err: any) {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    } finally {
      setAbortController(null);
      setBulkLoading(false);
      setProgress(0);
    }
  };

  const generateImages = async () => {
    const controller = new AbortController();
    setAbortController(controller);
    setBulkLoading(true);
    setProgress(0);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    try {
      console.log(`[BlogPostsView] Starting batch image generation for ${selectedIds.length} posts`);
      
      const results = await Promise.allSettled(
        selectedIds.map((id, idx) =>
          (async () => {
            // Enhanced delay for better rate limiting (3-5 seconds)
            const delay = 3000 + (idx * 2000); // 3s, 5s, 7s, 9s...
            await new Promise(res => setTimeout(res, delay));
            
            if (controller.signal.aborted) {
              throw new Error('Operation aborted by user');
            }
            
            console.log(`[BlogPostsView] Processing post ${idx + 1}/${selectedIds.length} (ID: ${id})`);
            
            const { data, error } = await supabase
              .from('blog_posts')
              .select('title, content, category')
              .eq('id', id)
              .single();

            if (error) {
              console.error(`[BlogPostsView] Failed to fetch post ${id}:`, error);
              throw new Error(`Artikel laden fehlgeschlagen: ${error.message}`);
            }

            if (controller.signal.aborted) {
              throw new Error('Operation aborted by user');
            }

            console.log(`[BlogPostsView] Generating image for: "${data.title}"`);
            
            // Enhanced image generation with better error handling
            const generatedImage = await aiImageGenerationService.generateBlogImage({
              title: data.title,
              content: data.content || '',
              category: data.category
            });

            if (controller.signal.aborted) {
              throw new Error('Operation aborted by user');
            }

            console.log(`[BlogPostsView] Image generated for ${id}:`, {
              url: generatedImage.url?.substring(0, 50) + '...',
              model: generatedImage.model,
              hasWarning: !!generatedImage.warning
            });

            // Update database with new image
            const { error: updateError } = await supabase
              .from('blog_posts')
              .update({ featured_image: generatedImage.url })
              .eq('id', id);

            if (updateError) {
              console.error(`[BlogPostsView] Failed to update post ${id}:`, updateError);
              throw new Error(`Datenbank-Update fehlgeschlagen: ${updateError.message}`);
            }

            if (controller.signal.aborted) {
              throw new Error('Operation aborted by user');
            }

            // Update progress
            const progressPercent = Math.round(((idx + 1) / selectedIds.length) * 100);
            setProgress(progressPercent);
            
            console.log(`[BlogPostsView] Successfully processed post ${idx + 1}/${selectedIds.length}`);
            
            // Show warning if fallback was used
            if (generatedImage.warning) {
              console.warn(`[BlogPostsView] Warning for ${data.title}:`, generatedImage.warning);
            }
            
            return { id, success: true, warning: generatedImage.warning };
          })()
        )
      );

      // Analyze results
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          successCount++;
          if (result.value.warning) {
            console.log(`[BlogPostsView] Post ${idx + 1} completed with warning:`, result.value.warning);
          }
        } else {
          errorCount++;
          const errorMsg = result.reason?.message || 'Unbekannter Fehler';
          errors.push(`Post ${idx + 1}: ${errorMsg}`);
          console.error(`[BlogPostsView] Post ${idx + 1} failed:`, result.reason);
        }
      });

      // Enhanced user feedback
      if (successCount > 0 && errorCount === 0) {
        toast({
          title: 'Bilder erfolgreich generiert! 🎉',
          description: `${successCount} Bilder wurden erfolgreich erstellt.`,
        });
      } else if (successCount > 0 && errorCount > 0) {
        toast({
          title: 'Teilweise erfolgreich',
          description: `${successCount} Bilder erstellt, ${errorCount} fehlgeschlagen. Details in der Konsole.`,
          variant: 'default'
        });
        
        // Log detailed errors for debugging
        console.group('[BlogPostsView] Detailed error report:');
        errors.forEach(error => console.error(error));
        console.groupEnd();
      } else {
        toast({
          title: 'Bildgenerierung fehlgeschlagen',
          description: `Alle ${errorCount} Versuche sind fehlgeschlagen. Prüfen Sie die Konsole für Details.`,
          variant: 'destructive'
        });
        
        console.group('[BlogPostsView] All errors:');
        errors.forEach(error => console.error(error));
        console.groupEnd();
      }

      // Reload data and clear selection
      loadBlogPosts();
      clearSelection();
      
    } catch (err: any) {
      console.error('[BlogPostsView] Batch operation failed:', err);
      toast({ 
        title: 'Batch-Operation fehlgeschlagen', 
        description: err.message || 'Unbekannter Fehler bei der Batch-Verarbeitung', 
        variant: 'destructive' 
      });
    } finally {
      setAbortController(null);
      setBulkLoading(false);
      setProgress(0);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      if (category && p.category !== category) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [posts, category, search]);

  const sortedPosts = useMemo(() => {
    const sorted = [...filteredPosts];
    sorted.sort((a, b) => {
      let res = 0;
      if (sort === 'title') {
        res = a.title.localeCompare(b.title);
      } else {
        const dateA = a.published_at ? new Date(a.published_at).getTime() : NaN;
        const dateB = b.published_at ? new Date(b.published_at).getTime() : NaN;
        const validA = !isNaN(dateA);
        const validB = !isNaN(dateB);
        if (validA && validB) {
          res = dateA - dateB;
        } else if (validA) {
          res = -1;
        } else if (validB) {
          res = 1;
        } else {
          res = 0;
        }
      }
      return direction === 'asc' ? res : -res;
    });
    return sorted;
  }, [filteredPosts, sort, direction]);

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
        <BlogPostsFilter
          categories={categories}
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          direction={direction}
          setDirection={setDirection}
        />

        <BlogPostsBulkActions
          selectedCount={selectedIds.length}
          onOptimizeTitles={optimizeTitles}
          onGenerateImages={generateImages}
          onClear={clearSelection}
          onCancel={cancelOperation}
          loading={bulkLoading}
          progress={progress}
        />

        <BlogPostsTable
          posts={sortedPosts}
          instagramStatuses={instagramStatuses}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={() => toggleSelectAll(sortedPosts)}
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
