
import { supabase } from "@/integrations/supabase/client";

export interface ContentAnalysisResult {
  postId: string;
  performanceScore: number;
  seoScore: number;
  engagementPrediction: number;
  recommendations: string[];
  optimizedKeywords: string[];
  competitiveness: 'low' | 'medium' | 'high';
  estimatedViews: number;
  analyzedAt: string;
}

class AIContentAnalysisService {
  async analyzePost(postId: string): Promise<ContentAnalysisResult> {
    console.log('[AIContentAnalysis] Analyzing post:', postId);

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error || !post) {
      throw new Error(`Post not found: ${postId}`);
    }

    const { data: analysisData, error: aiError } = await supabase.functions.invoke('ai-content-insights', {
      body: { 
        action: 'analyze_performance',
        data: {
          title: post.title,
          content: post.content,
          category: post.category,
          tags: post.tags,
          seoKeywords: post.seo_keywords
        }
      }
    });

    if (aiError) {
      throw new Error(`AI analysis failed: ${aiError.message}`);
    }

    const analysis = analysisData.analysis;

    return {
      postId,
      performanceScore: analysis.performanceScore || 0,
      seoScore: analysis.seoOptimization || 0,
      engagementPrediction: analysis.engagementPrediction || 0,
      recommendations: analysis.recommendations || [],
      optimizedKeywords: analysis.keywords || [],
      competitiveness: analysis.competitiveness || 'medium',
      estimatedViews: analysis.estimatedViews || 0,
      analyzedAt: new Date().toISOString()
    };
  }

  async batchAnalyzePosts(limit: number = 10): Promise<ContentAnalysisResult[]> {
    console.log('[AIContentAnalysis] Batch analyzing recent posts');

    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    const results: ContentAnalysisResult[] = [];
    
    for (const post of posts) {
      try {
        const analysis = await this.analyzePost(post.id);
        results.push(analysis);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`[AIContentAnalysis] Failed to analyze post ${post.id}:`, error);
      }
    }

    return results;
  }

  async optimizeContentSEO(postId: string): Promise<any> {
    console.log('[AIContentAnalysis] Optimizing SEO for post:', postId);

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error || !post) {
      throw new Error(`Post not found: ${postId}`);
    }

    const { data: optimizationData, error: aiError } = await supabase.functions.invoke('ai-content-insights', {
      body: { 
        action: 'optimize_content',
        data: {
          title: post.title,
          content: post.content,
          category: post.category,
          seoKeywords: post.seo_keywords
        }
      }
    });

    if (aiError) {
      throw new Error(`SEO optimization failed: ${aiError.message}`);
    }

    return optimizationData.optimization;
  }

  async scheduleContentAnalysis(): Promise<string> {
    console.log('[AIContentAnalysis] Scheduling automated content analysis');

    // Create a cron job for daily content analysis
    const { data, error } = await supabase.functions.invoke('cron-executor', {
      body: {
        action: 'create',
        jobData: {
          name: 'AI Content Analysis - Daily',
          description: 'Automated AI-powered analysis of recent blog posts',
          cron_expression: '0 9 * * *', // Daily at 9 AM
          function_name: 'ai-content-insights',
          function_payload: {
            action: 'batch_analyze',
            limit: 5
          },
          job_type: 'content_analysis',
          enabled: true
        }
      }
    });

    if (error) {
      throw new Error(`Failed to schedule analysis: ${error.message}`);
    }

    return data.jobId;
  }
}

export const aiContentAnalysisService = new AIContentAnalysisService();
