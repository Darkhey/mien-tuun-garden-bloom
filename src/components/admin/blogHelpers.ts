/**
 * Hilfsfunktionen für KI Blog Creator Workflows
 * Importiert zentrale Konfiguration
 */

import { 
  BLOG_CATEGORIES, 
  SEASONS, 
  TREND_TAGS, 
  getTrendTags as getTagsFromConfig,
  buildContextFromMeta as buildContextFromConfig
} from '@/config/blog.config';

// Re-exportiere für Kompatibilität
export { BLOG_CATEGORIES, SEASONS };
export const getTrendTags = getTagsFromConfig;
export const buildContextFromMeta = buildContextFromConfig;
