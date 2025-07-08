
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { aiImageGenerationService, BatchProgress } from "@/services/AIImageGenerationService";
import { contentInsightsService } from "@/services/ContentInsightsService";
import { optimizationTrackingService, OptimizationBatch } from "@/services/OptimizationTrackingService";

export const useBulkOperations = (selectedIds: string[], clearSelection: () => void, loadBlogPosts: () => void) => {
  const [bulkLoading, setBulkLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | undefined>();
  const [currentOptimizationBatch, setCurrentOptimizationBatch] = useState<OptimizationBatch | undefined>();
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const { toast } = useToast();

  const cancelOperation = () => {
    abortController?.abort();
    if (currentOptimizationBatch) {
      optimizationTrackingService.cancelBatch(currentOptimizationBatch.id);
    }
    setAbortController(null);
    setBulkLoading(false);
    setBatchProgress(undefined);
    setCurrentOptimizationBatch(undefined);
  };

  const optimizeTitles = async () => {
    const controller = new AbortController();
    setAbortController(controller);
    setBulkLoading(true);
    setProgress(0);

    try {
      // Fetch blog posts data
      const { data: postsData, error } = await supabase
        .from('blog_posts')
        .select('id, title, content, category, seo_keywords')
        .in('id', selectedIds);

      if (error) throw error;

      // Create optimization batch
      const batch = optimizationTrackingService.createBatch('title', 
        postsData.map(post => ({ id: post.id, title: post.title }))
      );
      setCurrentOptimizationBatch(batch);

      const results = await Promise.allSettled(
        postsData.map((post, idx) =>
          (async () => {
            await new Promise(res => setTimeout(res, idx * 1000));
            if (controller.signal.aborted) throw new Error('aborted');

            // Update status to processing
            optimizationTrackingService.updateResult(batch.id, post.id, { 
              status: 'processing',
              originalValue: post.title
            });

            try {
              const optimization = await contentInsightsService.optimizeContent({
                title: post.title,
                content: post.content || '',
                category: post.category,
                seoKeywords: post.seo_keywords,
              });

              if (controller.signal.aborted) throw new Error('aborted');

              const newTitle = optimization.optimizedTitle || post.title;
              const hasChanges = newTitle !== post.title;

              const { error: updateError } = await supabase
                .from('blog_posts')
                .update({ title: newTitle })
                .eq('id', post.id);

              if (updateError) throw updateError;

              // Update optimization result
              optimizationTrackingService.updateResult(batch.id, post.id, {
                status: 'completed',
                optimizedValue: newTitle,
                changes: hasChanges ? [`Titel geändert von "${post.title}" zu "${newTitle}"`] : [],
                aiProvider: 'OpenAI',
                model: 'gpt-4o'
              });

              setProgress(Math.round(((idx + 1) / selectedIds.length) * 100));
              return post.id;
            } catch (error) {
              optimizationTrackingService.updateResult(batch.id, post.id, {
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unbekannter Fehler'
              });
              throw error;
            }
          })()
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (failed > 0 && successful === 0) {
        toast({
          title: 'Titel-Optimierung fehlgeschlagen',
          description: `Alle ${failed} Versuche sind fehlgeschlagen`,
          variant: 'destructive'
        });
      } else if (failed > 0) {
        toast({
          title: 'Titel-Optimierung teilweise erfolgreich',
          description: `${successful} Titel optimiert, ${failed} fehlgeschlagen`,
          variant: 'default'
        });
      } else {
        toast({ 
          title: '✨ Titel-Optimierung abgeschlossen!', 
          description: `${successful} Artikel-Titel wurden erfolgreich mit KI optimiert.` 
        });
      }

      loadBlogPosts();
      clearSelection();
    } catch (err: any) {
      console.error('Title optimization failed:', err);
      toast({ 
        title: 'Titel-Optimierung fehlgeschlagen', 
        description: err.message || 'Unbekannter Fehler', 
        variant: 'destructive' 
      });
    } finally {
      setAbortController(null);
      setBulkLoading(false);
      setProgress(0);
      setCurrentOptimizationBatch(undefined);
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

      // Create optimization batch
      const batch = optimizationTrackingService.createBatch('image', 
        postsData.map(post => ({ id: post.id, title: post.title }))
      );
      setCurrentOptimizationBatch(batch);

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
          
          // Update optimization tracking
          progress.results.forEach(result => {
            optimizationTrackingService.updateResult(batch.id, result.id, {
              status: result.status,
              imageUrl: result.imageUrl,
              error: result.error,
              model: result.model
            });
          });
          
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
          description: `${successCount} hochwertige KI-Bilder wurden mit 3 parallelen Prozessen erstellt und automatisch zugewiesen.`,
        });
      } else if (successCount > 0) {
        toast({
          title: 'Batch-Verarbeitung abgeschlossen',
          description: `${successCount} Bilder erstellt, ${failureCount} mit Fallback-Bildern.`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Bild-Generierung mit Fallbacks',
          description: `${failureCount} Artikel erhielten Fallback-Bilder da die KI-Generierung nicht verfügbar war.`,
          variant: 'default'
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
      setCurrentOptimizationBatch(undefined);
    }
  };

  // Get recent optimization stats
  const getRecentOptimizations = () => {
    const allBatches = optimizationTrackingService.getAllBatches();
    const recentBatches = allBatches.slice(0, 10); // Last 10 batches
    
    return {
      titles: recentBatches.filter(b => b.type === 'title').reduce((sum, b) => sum + b.completedItems, 0),
      images: recentBatches.filter(b => b.type === 'image').reduce((sum, b) => sum + b.completedItems, 0),
      totalSuccessful: recentBatches.reduce((sum, b) => sum + b.completedItems, 0),
      totalFailed: recentBatches.reduce((sum, b) => sum + b.failedItems, 0)
    };
  };

  return {
    bulkLoading,
    progress,
    batchProgress,
    currentOptimizationBatch,
    recentOptimizations: getRecentOptimizations(),
    optimizeTitles,
    generateImages,
    cancelOperation
  };};
