import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

vi.mock('../../ContentGenerationService', () => ({
  contentGenerationService: {
    generateBlogPost: vi.fn()
  }
}));

import { supabase } from '@/integrations/supabase/client';
import { contentGenerationService } from '../../ContentGenerationService';
import { blogPostPipelineService } from '../BlogPostPipelineService';

const mockSuccessfulDb = () => {
  (supabase.from as any).mockImplementation(() => ({
    insert: () => ({
      select: () => ({
        maybeSingle: () => Promise.resolve({ data: { id: 1 }, error: null })
      })
    }),
    update: () => ({
      eq: () => Promise.resolve({ error: null })
    })
  }));
};

const config = {
  qualityThreshold: 50,
  autoPublish: true,
  seoTargets: { minWordCount: 10, maxWordCount: 1000, keywordDensity: { min: 0.5, max: 3 }, readabilityTarget: 70 },
  contentType: 'blog' as const,
  targetAudience: 'anfaenger' as const
};

const sampleContent = '# Title\n\n## Subtitle\n\n' + 'word '.repeat(400);

beforeEach(() => {
  vi.clearAllMocks();
  (blogPostPipelineService as any).executions.clear();
  mockSuccessfulDb();
  (contentGenerationService.generateBlogPost as any).mockResolvedValue({
    content: sampleContent,
    title: 'Test Title',
    quality: {},
    metadata: {}
  });
});

describe('BlogPostPipelineService', () => {
  it('runs pipeline successfully', async () => {
    const id = await blogPostPipelineService.executePipeline('prompt', config);
    const exec = blogPostPipelineService.getExecution(id);
    expect(exec?.status).toBe('completed');
    expect(exec?.stages.every(s => s.status === 'completed')).toBe(true);
  });

  it('fails when database insertion fails', async () => {
    (supabase.from as any).mockImplementation(() => ({
      insert: () => ({
        select: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: { message: 'db err' } })
        })
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: null })
      })
    }));

    await expect(blogPostPipelineService.executePipeline('prompt', config)).rejects.toThrow('Database error');
    const exec = blogPostPipelineService.getAllExecutions()[0];
    expect(exec.status).toBe('failed');
    const failedStage = exec.stages.find(s => s.id === 'database_storage');
    expect(failedStage?.status).toBe('failed');
  });
});
