import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  memoryUsage?: number;
}

export const usePerformanceMonitor = (componentName: string, enabled: boolean = false) => {
  const renderStartTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    renderStartTime.current = Date.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    if (!enabled) return;

    const renderTime = Date.now() - renderStartTime.current;
    
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      const metrics: PerformanceMetrics = {
        componentName,
        renderTime,
        memoryUsage: (performance as any)?.memory?.usedJSHeapSize
      };

      if (renderTime > 16) { // Log slow renders (>16ms)
        console.warn(`Slow render detected in ${componentName}:`, metrics);
      }

      // Log to console every 10 renders
      if (renderCount.current % 10 === 0) {
        console.log(`Performance metrics for ${componentName}:`, {
          ...metrics,
          totalRenders: renderCount.current
        });
      }
    }
  });

  return {
    renderCount: renderCount.current,
    markRenderStart: () => {
      renderStartTime.current = Date.now();
    }
  };
};

export const measureAsyncOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${operationName} completed in ${duration}ms`);
      
      if (duration > 1000) {
        console.warn(`Slow async operation: ${operationName} took ${duration}ms`);
      }
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`${operationName} failed after ${duration}ms:`, error);
    throw error;
  }
};