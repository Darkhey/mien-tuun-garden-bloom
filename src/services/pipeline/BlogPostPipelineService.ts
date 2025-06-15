
import { ContentGenerationService } from '../ContentGenerationService';
import { SEOOptimizationService } from './SEOOptimizationService';
import { QualityAssuranceService } from './QualityAssuranceService';
import { ContentEnrichmentService } from './ContentEnrichmentService';
import { supabase } from "@/integrations/supabase/client";

export interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface BlogPostPipelineConfig {
  qualityThreshold: number;
  autoPublish: boolean;
  seoTargets: {
    minWordCount: number;
    maxWordCount: number;
    keywordDensity: { min: number; max: number };
    readabilityTarget: number;
  };
  contentType: 'blog' | 'tutorial' | 'guide' | 'news';
  targetAudience: 'anfaenger' | 'fortgeschritten' | 'experte';
}

export interface PipelineExecution {
  id: string;
  prompt: string;
  config: BlogPostPipelineConfig;
  stages: PipelineStage[];
  status: 'running' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  finalResult?: {
    blogPostId: string;
    qualityScore: number;
    seoScore: number;
    published: boolean;
  };
}

class BlogPostPipelineService {
  private contentGeneration: ContentGenerationService;
  private seoOptimization: SEOOptimizationService;
  private qualityAssurance: QualityAssuranceService;
  private contentEnrichment: ContentEnrichmentService;
  private executions: Map<string, PipelineExecution> = new Map();

  constructor() {
    this.contentGeneration = new ContentGenerationService();
    this.seoOptimization = new SEOOptimizationService();
    this.qualityAssurance = new QualityAssuranceService();
    this.contentEnrichment = new ContentEnrichmentService();
  }

  async executePipeline(
    prompt: string, 
    config: BlogPostPipelineConfig
  ): Promise<string> {
    const execution: PipelineExecution = {
      id: `pipeline_${Date.now()}`,
      prompt,
      config,
      status: 'running',
      createdAt: new Date(),
      stages: this.initializeStages()
    };

    this.executions.set(execution.id, execution);
    
    try {
      console.log(`[Pipeline] Starting execution ${execution.id}`);
      
      // Stage 1: Topic Research & Keyword Analysis
      await this.executeStage(execution, 'topic_research', async () => {
        return await this.seoOptimization.analyzeTopicAndKeywords(prompt);
      });

      // Stage 2: Enhanced Content Generation
      await this.executeStage(execution, 'content_generation', async () => {
        const topicData = execution.stages.find(s => s.id === 'topic_research')?.result;
        return await this.contentGeneration.generateWithSEOContext(prompt, topicData, config);
      });

      // Stage 3: Quality Assurance
      await this.executeStage(execution, 'quality_check', async () => {
        const content = execution.stages.find(s => s.id === 'content_generation')?.result;
        return await this.qualityAssurance.performComprehensiveCheck(content, config);
      });

      // Stage 4: SEO Optimization
      await this.executeStage(execution, 'seo_optimization', async () => {
        const content = execution.stages.find(s => s.id === 'content_generation')?.result;
        const qualityData = execution.stages.find(s => s.id === 'quality_check')?.result;
        return await this.seoOptimization.optimizeContent(content, qualityData);
      });

      // Stage 5: Content Enrichment
      await this.executeStage(execution, 'content_enrichment', async () => {
        const content = execution.stages.find(s => s.id === 'content_generation')?.result;
        const seoData = execution.stages.find(s => s.id === 'seo_optimization')?.result;
        return await this.contentEnrichment.enrichContent(content, seoData);
      });

      // Stage 6: Database Storage
      await this.executeStage(execution, 'database_storage', async () => {
        return await this.saveBlogPost(execution);
      });

      // Stage 7: Publication Decision
      await this.executeStage(execution, 'publication', async () => {
        return await this.handlePublication(execution);
      });

      execution.status = 'completed';
      execution.completedAt = new Date();
      
      console.log(`[Pipeline] Execution ${execution.id} completed successfully`);
      return execution.id;

    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      console.error(`[Pipeline] Execution ${execution.id} failed:`, error);
      throw error;
    }
  }

  private initializeStages(): PipelineStage[] {
    return [
      { id: 'topic_research', name: 'Topic Research & Keywords', status: 'pending', progress: 0 },
      { id: 'content_generation', name: 'Content Generation', status: 'pending', progress: 0 },
      { id: 'quality_check', name: 'Quality Assurance', status: 'pending', progress: 0 },
      { id: 'seo_optimization', name: 'SEO Optimization', status: 'pending', progress: 0 },
      { id: 'content_enrichment', name: 'Content Enrichment', status: 'pending', progress: 0 },
      { id: 'database_storage', name: 'Database Storage', status: 'pending', progress: 0 },
      { id: 'publication', name: 'Publication', status: 'pending', progress: 0 }
    ];
  }

  private async executeStage(
    execution: PipelineExecution, 
    stageId: string, 
    stageFunction: () => Promise<any>
  ): Promise<void> {
    const stage = execution.stages.find(s => s.id === stageId);
    if (!stage) throw new Error(`Stage ${stageId} not found`);

    stage.status = 'running';
    stage.startTime = new Date();
    stage.progress = 0;

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        if (stage.progress < 90) {
          stage.progress += 10;
        }
      }, 200);

      const result = await stageFunction();
      
      clearInterval(progressInterval);
      stage.progress = 100;
      stage.status = 'completed';
      stage.endTime = new Date();
      stage.result = result;

      console.log(`[Pipeline] Stage ${stageId} completed`);
    } catch (error) {
      stage.status = 'failed';
      stage.endTime = new Date();
      stage.error = error.message;
      throw error;
    }
  }

  private async saveBlogPost(execution: PipelineExecution): Promise<any> {
    const content = execution.stages.find(s => s.id === 'content_generation')?.result;
    const seoData = execution.stages.find(s => s.id === 'seo_optimization')?.result;
    const enrichmentData = execution.stages.find(s => s.id === 'content_enrichment')?.result;
    const qualityData = execution.stages.find(s => s.id === 'quality_check')?.result;

    const blogPost = {
      slug: seoData.slug,
      title: content.title,
      content: enrichmentData.enhancedContent,
      excerpt: seoData.metaDescription,
      category: content.category || 'Allgemein',
      tags: seoData.keywords,
      content_types: [execution.config.contentType],
      season: content.season || '',
      audiences: [execution.config.targetAudience],
      featured_image: enrichmentData.featuredImage || '',
      og_image: enrichmentData.ogImage || '',
      seo_title: seoData.metaTitle,
      seo_description: seoData.metaDescription,
      seo_keywords: seoData.keywords,
      published: false,
      featured: qualityData.qualityScore > 90,
      reading_time: Math.ceil(content.content.split(/\s+/).length / 160),
      author: 'KI Content Pipeline',
      status: execution.config.autoPublish && qualityData.qualityScore >= execution.config.qualityThreshold 
        ? 'veröffentlicht' : 'entwurf'
    };

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([blogPost])
      .select()
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);
    
    return { blogPostId: data.id, blogPost };
  }

  private async handlePublication(execution: PipelineExecution): Promise<any> {
    const qualityData = execution.stages.find(s => s.id === 'quality_check')?.result;
    const storageData = execution.stages.find(s => s.id === 'database_storage')?.result;

    const shouldPublish = execution.config.autoPublish && 
                         qualityData.qualityScore >= execution.config.qualityThreshold;

    if (shouldPublish) {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          published: true, 
          status: 'veröffentlicht',
          published_at: new Date().toISOString()
        })
        .eq('id', storageData.blogPostId);

      if (error) throw new Error(`Publication error: ${error.message}`);
      
      return { published: true, publishedAt: new Date() };
    }

    return { published: false, reason: 'Quality threshold not met or auto-publish disabled' };
  }

  getExecution(id: string): PipelineExecution | undefined {
    return this.executions.get(id);
  }

  getAllExecutions(): PipelineExecution[] {
    return Array.from(this.executions.values());
  }

  getActiveExecutions(): PipelineExecution[] {
    return Array.from(this.executions.values()).filter(e => e.status === 'running');
  }
}

export const blogPostPipelineService = new BlogPostPipelineService();
