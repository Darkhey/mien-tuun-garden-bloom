
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
    typeof obj.publishedAt === 'string' &&
    typeof obj.featuredImage === 'string' &&
    typeof obj.category === 'string' &&
    Array.isArray(obj.tags) &&
    typeof obj.readingTime === 'number' &&
    typeof obj.published === 'boolean'
  );
};

export const isWeatherResponse = (
  data: any
): data is { daily: { precipitation_sum: number[] } } => {
  return (
    data &&
    typeof data === 'object' &&
    data.daily &&
    Array.isArray(data.daily.precipitation_sum) &&
    data.daily.precipitation_sum.every((n: any) => typeof n === 'number')
  );
};

export const isHourlyWeatherResponse = (
  data: any
): data is { hourly: { time: string[]; precipitation: number[] } } => {
  return (
    data &&
    typeof data === 'object' &&
    data.hourly &&
    Array.isArray(data.hourly.time) &&
    Array.isArray(data.hourly.precipitation)
  );
};
