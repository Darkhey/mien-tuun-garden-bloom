import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { optimizationTrackingService, OptimizationResult } from '@/services/OptimizationTrackingService';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  featured_image?: string;
  seo_title?: string;
  seo_description?: string;
  category: string;
  status: string;
}

interface BulkOperationProgress {
  total: number;
  completed: number;
  current?: string;
  errors: string[];
  results: OptimizationResult[];
}

export const useBulkOperations = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<BulkOperationProgress | null>(null);
  const { toast } = useToast();

  const optimizeTitles = async (posts: BlogPost[]) => {
    if (posts.length > 20) {
      toast({
        title: "Große Batch-Operation",
        description: `${posts.length} Artikel werden optimiert. Dies kann einige Minuten dauern.`,
        variant: "default",
      });
    }

    setIsProcessing(true);
    setProgress({
      total: posts.length,
      completed: 0,
      errors: [],
      results: []
    });

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      setProgress(prev => prev ? { ...prev, current: post.title } : null);

      try {
        const { data, error } = await supabase.functions.invoke('generate-with-gemini', {
          body: {
            prompt: `Optimiere diesen Blog-Titel für SEO und Engagement: "${post.title}". 
                    Behalte den ursprünglichen Stil bei, aber mache ihn ansprechender und suchmaschinenfreundlicher. 
                    Antworte nur mit dem optimierten Titel, ohne Anführungszeichen oder zusätzliche Erklärungen.`,
            type: 'title-optimization'
          }
        });

        if (error) throw error;

        const optimizedTitle = data?.content || data?.text || '';
        
        if (optimizedTitle && optimizedTitle !== post.title) {
          const { error: updateError } = await supabase
            .from('blog_posts')
            .update({ title: optimizedTitle })
            .eq('id', post.id);

          if (updateError) throw updateError;

          // Track optimization
          const result = await optimizationTrackingService.trackOptimization({
            type: 'title',
            postId: post.id,
            originalValue: post.title,
            optimizedValue: optimizedTitle,
            aiProvider: 'gemini',
            model: 'gemini-pro'
          });

          setProgress(prev => prev ? {
            ...prev,
            results: [...prev.results, result]
          } : null);
        }

        setProgress(prev => prev ? { 
          ...prev, 
          completed: prev.completed + 1,
          current: undefined
        } : null);

      } catch (error: any) {
        console.error(`Error optimizing title for ${post.title}:`, error);
        setProgress(prev => prev ? {
          ...prev,
          errors: [...prev.errors, `${post.title}: ${error.message}`],
          completed: prev.completed + 1
        } : null);
      }
    }

    setIsProcessing(false);
    
    const successCount = progress ? progress.total - progress.errors.length : 0;
    toast({
      title: "Titel-Optimierung abgeschlossen",
      description: `${successCount} von ${posts.length} Titeln erfolgreich optimiert`,
      variant: successCount === posts.length ? "default" : "destructive",
    });
  };

  const optimizeImages = async (posts: BlogPost[]) => {
    if (posts.length > 10) {
      toast({
        title: "Große Batch-Operation",
        description: `${posts.length} Bilder werden generiert. Dies kann 10-15 Minuten dauern.`,
        variant: "default",
      });
    }

    setIsProcessing(true);
    setProgress({
      total: posts.length,
      completed: 0,
      errors: [],
      results: []
    });

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      setProgress(prev => prev ? { ...prev, current: post.title } : null);

      try {
        const { data, error } = await supabase.functions.invoke('generate-blog-image', {
          body: {
            title: post.title,
            category: post.category,
            postId: post.id
          }
        });

        if (error) throw error;

        if (data?.imageUrl) {
          const { error: updateError } = await supabase
            .from('blog_posts')
            .update({ featured_image: data.imageUrl })
            .eq('id', post.id);

          if (updateError) throw updateError;

          // Track optimization
          const result = await optimizationTrackingService.trackOptimization({
            type: 'image',
            postId: post.id,
            originalValue: post.featured_image || 'Kein Bild',
            optimizedValue: data.imageUrl,
            aiProvider: 'openai',
            model: 'dall-e-3'
          });

          setProgress(prev => prev ? {
            ...prev,
            results: [...prev.results, result]
          } : null);
        }

        setProgress(prev => prev ? { 
          ...prev, 
          completed: prev.completed + 1,
          current: undefined
        } : null);

      } catch (error: any) {
        console.error(`Error generating image for ${post.title}:`, error);
        setProgress(prev => prev ? {
          ...prev,
          errors: [...prev.errors, `${post.title}: ${error.message}`],
          completed: prev.completed + 1
        } : null);
      }
    }

    setIsProcessing(false);
    
    const successCount = progress ? progress.total - progress.errors.length : 0;
    toast({
      title: "Bild-Generierung abgeschlossen",
      description: `${successCount} von ${posts.length} Bildern erfolgreich generiert`,
      variant: successCount === posts.length ? "default" : "destructive",
    });
  };

  const clearProgress = () => {
    setProgress(null);
  };

  return {
    optimizeTitles,
    optimizeImages,
    isProcessing,
    progress,
    clearProgress
  };
};