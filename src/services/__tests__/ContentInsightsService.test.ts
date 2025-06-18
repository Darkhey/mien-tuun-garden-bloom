import { describe, it, expect } from 'vitest';
import { contentInsightsService } from '../ContentInsightsService';

const trends = [
  { keyword: 'Permakultur', relevance: 0.9, category: 'garten' },
  { keyword: 'Zero Waste', relevance: 0.8, category: 'nachhaltigkeit' }
];

const blogPosts = [
  { category: 'garten', tags: ['pflanzen'], seo_keywords: ['garten'] }
];
const recipes = [
  { category: 'kochen', tags: ['suppe'] }
];

describe('ContentInsightsService', () => {
  it('detects suggestions for missing categories', () => {
    const stats = (contentInsightsService as any).computeCategoryStats(blogPosts, recipes);
    const suggestions = (contentInsightsService as any).generateSuggestions(trends, blogPosts, recipes, stats);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].topic).toBe('Permakultur');
  });
});
