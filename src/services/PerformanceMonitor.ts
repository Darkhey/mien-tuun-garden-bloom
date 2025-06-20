
/**
 * Performance Monitor Service
 * Tracks Core Web Vitals and other performance metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    this.initializeWebVitals();
    this.initializeNavigationTiming();
  }

  private initializeWebVitals(): void {
    // Largest Contentful Paint (LCP)
    this.observeLCP();
    
    // First Input Delay (FID)
    this.observeFID();
    
    // Cumulative Layout Shift (CLS)
    this.observeCLS();
    
    // First Contentful Paint (FCP)
    this.observeFCP();
  }

  private observeLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      this.recordMetric('LCP', lastEntry.startTime);
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observation not supported');
    }
  }

  private observeFID(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.recordMetric('FID', entry.processingStart - entry.startTime);
      });
    });

    try {
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observation not supported');
    }
  }

  private observeCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      this.recordMetric('CLS', clsValue);
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observation not supported');
    }
  }

  private observeFCP(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('FCP', entry.startTime);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('FCP observation not supported');
    }
  }

  private initializeNavigationTiming(): void {
    window.addEventListener('load', () => {
      // Wait a bit for everything to settle
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          // DNS Lookup Time
          this.recordMetric('DNS', navigation.domainLookupEnd - navigation.domainLookupStart);
          
          // Connection Time
          this.recordMetric('Connection', navigation.connectEnd - navigation.connectStart);
          
          // Time to First Byte (TTFB)
          this.recordMetric('TTFB', navigation.responseStart - navigation.requestStart);
          
          // DOM Content Loaded - use relative timing
          this.recordMetric('DCL', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
          
          // Load Complete - use relative timing
          this.recordMetric('Load', navigation.loadEventEnd - navigation.loadEventStart);
        }
      }, 1000);
    });
  }

  private recordMetric(name: string, value: number): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href
    };

    this.metrics.push(metric);
    
    // Keep only last 100 metrics to prevent memory issues
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log performance issues
    this.checkPerformanceThresholds(metric);
  }

  private checkPerformanceThresholds(metric: PerformanceMetric): void {
    const thresholds = {
      LCP: 2500, // Good: < 2.5s
      FID: 100,  // Good: < 100ms
      CLS: 0.1,  // Good: < 0.1
      FCP: 1800, // Good: < 1.8s
      TTFB: 600  // Good: < 600ms
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];
    if (threshold && metric.value > threshold) {
      console.warn(`Performance issue detected: ${metric.name} = ${metric.value}ms (threshold: ${threshold}ms)`);
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getAverageMetric(name: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }

  public generatePerformanceReport(): string {
    const report = {
      LCP: this.getAverageMetric('LCP'),
      FID: this.getAverageMetric('FID'),
      CLS: this.getAverageMetric('CLS'),
      FCP: this.getAverageMetric('FCP'),
      TTFB: this.getAverageMetric('TTFB'),
      DNS: this.getAverageMetric('DNS'),
      Connection: this.getAverageMetric('Connection'),
      DCL: this.getAverageMetric('DCL'),
      Load: this.getAverageMetric('Load')
    };

    return JSON.stringify(report, null, 2);
  }
}

export default PerformanceMonitor;
