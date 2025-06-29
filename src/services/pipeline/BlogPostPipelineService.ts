import { supabase } from '@/integrations/supabase/client';
import { contentGenerationService } from '../ContentGenerationService';

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

class BlogPostPipelineService {
  private static instance: BlogPostPipelineService;
  public executions: Map<string, PipelineExecution> = new Map();

  public static getInstance(): BlogPostPipelineService {
    if (!BlogPostPipelineService.instance) {
      BlogPostPipelineService.instance = new BlogPostPipelineService();
    }
    return BlogPostPipelineService.instance;
  }

  async executePipeline(prompt: string, config: any): Promise<string> {
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
      let generated: { content: string; title: string; featuredImage?: string };
      await runStage('content_generation', async () => {
        generated = await contentGenerationService.generateBlogPost({
          prompt,
          category: config.category,
          season: config.season,
          audiences: [config.targetAudience],
          contentType: [config.contentType]
        }) as any;
      });

      await runStage('database_storage', async () => {
        const { error } = await supabase
          .from('blog_posts')
          .insert([
            {
              title: generated!.title,
              content: generated!.content,
              excerpt: generated!.content.slice(0, 160),
              status: config.autoPublish ? 'veröffentlicht' : 'entwurf',
              featured_image: generated!.featuredImage || null
            }
          ])
          .select()
          .single();

        if (error) {
          throw new Error('Database error');
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
