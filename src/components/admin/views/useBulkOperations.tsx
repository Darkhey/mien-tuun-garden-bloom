
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { aiImageGenerationService, BatchProgress } from "@/services/AIImageGenerationService";
import { contentInsightsService } from "@/services/ContentInsightsService";

export const useBulkOperations = (selectedIds: string[], clearSelection: () => void, loadBlogPosts: () => void) => {
  const [bulkLoading, setBulkLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | undefined>();
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const { toast } = useToast();

  const cancelOperation = () => {
    abortController?.abort();
    setAbortController(null);
    setBulkLoading(false);
    setBatchProgress(undefined);
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
    setBatchProgress({
      total: selectedIds.length,
      completed: 0,
      inProgress: 0,
      failed: 0,
      results: []
    });
    
    try {
      console.log(`[BlogPostsView] Starting concurrent batch generation for ${selectedIds.length} posts`);
      
      // Fetch post data
      const { data: postsData, error } = await supabase
        .from('blog_posts')
        .select('id, title, content, category')
        .in('id', selectedIds);

      if (error) {
        throw new Error(`Fehler beim Laden der Artikel: ${error.message}`);
      }

      if (!postsData || postsData.length === 0) {
        throw new Error('Keine Artikel zum Verarbeiten gefunden');
      }

      // Check for abort before starting
      if (controller.signal.aborted) {
        throw new Error('Operation aborted by user');
      }

      // Use the new concurrent batch processing
      const results = await aiImageGenerationService.generateImagesInBatches(
        postsData.map(post => ({
          id: post.id,
          title: post.title,
          content: post.content || '',
          category: post.category || ''
        })),
        (progress) => {
          setBatchProgress(progress);
          
          // Check for abort during processing
          if (controller.signal.aborted) {
            throw new Error('Operation aborted by user');
          }
        }
      );

      // Final summary
      const successCount = results.filter(r => r.status === 'completed').length;
      const failureCount = results.filter(r => r.status === 'failed').length;

      if (successCount > 0 && failureCount === 0) {
        toast({
          title: '🎉 Alle Bilder erfolgreich generiert!',
          description: `${successCount} Bilder wurden mit 3 parallelen Prozessen erstellt.`,
        });
      } else if (successCount > 0) {
        toast({
          title: 'Batch-Verarbeitung abgeschlossen',
          description: `${successCount} Bilder erstellt, ${failureCount} fehlgeschlagen.`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Batch-Verarbeitung fehlgeschlagen',
          description: `Alle ${failureCount} Versuche sind fehlgeschlagen.`,
          variant: 'destructive'
        });
      }

      loadBlogPosts();
      clearSelection();
      
    } catch (err: any) {
      console.error('[BlogPostsView] Concurrent batch operation failed:', err);
      toast({ 
        title: 'Batch-Operation fehlgeschlagen', 
        description: err.message || 'Unbekannter Fehler bei der parallelen Verarbeitung', 
        variant: 'destructive' 
      });
    } finally {
      setAbortController(null);
      setBulkLoading(false);
      setBatchProgress(undefined);
      setProgress(0);
    }
  };

  return {
    bulkLoading,
    progress,
    batchProgress,
    optimizeTitles,
    generateImages,
    cancelOperation
  };
};
