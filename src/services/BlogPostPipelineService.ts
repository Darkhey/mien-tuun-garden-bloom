
import { supabase } from '@/integrations/supabase/client';
import { contentGenerationService, GeneratedContent } from './ContentGenerationService';

export interface PipelineStage {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
}

export interface PipelineExecution {
  id: string;
  status: 'running' | 'completed' | 'failed';
  stages: PipelineStage[];
  createdAt: Date;
}

export interface BlogPostPipelineConfig {
  category?: string;
  season?: string;
  targetAudience?: string;
  contentType?: string;
  autoPublish?: boolean;
  qualityThreshold?: number;
  seoTargets?: {
    minWordCount: number;
    maxWordCount: number;
    keywordDensity: { min: number; max: number };
    readabilityTarget: number;
  };
}

class BlogPostPipelineService {
  private static instance: BlogPostPipelineService;
  public executions: Map<string, PipelineExecution> = new Map();

  public static getInstance(): BlogPostPipelineService {
    if (!BlogPostPipelineService.instance) {
      BlogPostPipelineService.instance = new BlogPostPipelineService();
    }
    return BlogPostPipelineService.instance;
  }

  async executePipeline(prompt: string, config: BlogPostPipelineConfig): Promise<string> {
    const id = crypto.randomUUID();
    const execution: PipelineExecution = {
      id,
      status: 'running',
      stages: [],
      createdAt: new Date()
    };
    this.executions.set(id, execution);

    const runStage = async (stageId: string, fn: () => Promise<void>) => {
      const stage: PipelineStage = { id: stageId, status: 'running' };
      execution.stages.push(stage);
      try {
        await fn();
        stage.status = 'completed';
      } catch (err: any) {
        stage.status = 'failed';
        stage.error = err.message;
        throw err;
      }
    };

    try {
      let generated: GeneratedContent | null = null;
      await runStage('content_generation', async () => {
        generated = await contentGenerationService.generateBlogPost({
          prompt,
          category: config.category,
          season: config.season,
          audiences: config.targetAudience ? [config.targetAudience] : undefined,
          contentType: config.contentType ? [config.contentType] : undefined
        });
      });

      await runStage('database_storage', async () => {
        if (!generated) {
          throw new Error('No content generated');
        }

        const cleanContent = generated.content.replace(/<[^>]*>/g, '');
        const excerpt = cleanContent.length <= 160
          ? cleanContent
          : cleanContent.slice(0, 160).replace(/\s+\S*$/, '');

        const { error } = await supabase
          .from('blog_posts')
          .insert([
            {
              title: generated.title,
              content: generated.content,
              excerpt,
              status: config.autoPublish ? 'veröffentlicht' : 'entwurf',
              featured_image: generated.featuredImage || null,
              author: 'System',
              category: config.category || 'Allgemein',
              seo_title: generated.title,
              seo_description: excerpt,
              slug: generated.title.toLowerCase().replace(/\s+/g, '-'),
              reading_time: Math.ceil(cleanContent.split(' ').length / 200),
              published_at: new Date().toISOString(),
              audiences: [],
              content_types: [],
              seo_keywords: [],
              tags: []
            }
          ]);

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }
      });

      execution.status = 'completed';
      return id;
    } catch (err) {
      execution.status = 'failed';
      this.executions.set(id, execution);
      throw err;
    }
  }

  getExecution(id: string): PipelineExecution | undefined {
    return this.executions.get(id);
  }

  getAllExecutions(): PipelineExecution[] {
    return Array.from(this.executions.values());
  }
}

export const blogPostPipelineService = BlogPostPipelineService.getInstance();
export default blogPostPipelineService;
