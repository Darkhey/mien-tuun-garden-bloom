
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  table: string;
  selectColumns?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  dependencies?: any[];
}

export function useOptimizedQuery<T = any>({
  table,
  selectColumns = '*',
  filters = {},
  orderBy,
  limit,
  dependencies = [],
  staleTime = 5 * 60 * 1000, // 5 minutes default
  gcTime = 10 * 60 * 1000, // 10 minutes default
  ...options
}: OptimizedQueryOptions<T>) {
  const queryKey = [
    table,
    selectColumns,
    filters,
    orderBy,
    limit,
    ...dependencies
  ];

  return useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase.from(table as any).select(selectColumns);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === 'string' && value.includes('%')) {
            query = query.like(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Query error for ${table}:`, error);
        throw error;
      }

      return data as T;
    },
    staleTime,
    gcTime,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options
  });
}

// Specialized hooks for common queries
export function useOptimizedRecipes(filters: Record<string, any> = {}) {
  return useOptimizedQuery({
    table: 'recipes',
    selectColumns: 'id, title, slug, description, image_url, difficulty, prep_time_minutes, cook_time_minutes, servings, category, season, status',
    filters: { status: 'veröffentlicht', ...filters },
    orderBy: { column: 'created_at', ascending: false },
    limit: 50
  });
}

export function useOptimizedBlogPosts(filters: Record<string, any> = {}) {
  return useOptimizedQuery({
    table: 'blog_posts',
    selectColumns: 'id, title, slug, excerpt, featured_image, category, published_at, featured, status',
    filters: { status: 'veröffentlicht', ...filters },
    orderBy: { column: 'published_at', ascending: false },
    limit: 50
  });
}
