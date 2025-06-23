import type { BlogPost } from '@/types/content';

export const isBlogPost = (obj: any): obj is BlogPost => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.slug === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.excerpt === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.author === 'string' &&
    typeof obj.published_at === 'string' &&
    typeof obj.featured_image === 'string' &&
    typeof obj.category === 'string' &&
    Array.isArray(obj.tags) &&
    typeof obj.reading_time === 'number' &&
    typeof obj.published === 'boolean'
  );
};
