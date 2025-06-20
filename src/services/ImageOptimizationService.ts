
/**
 * Image Optimization Service
 * Provides utilities for optimizing images for web performance
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  lazy?: boolean;
}

class ImageOptimizationService {
  private static instance: ImageOptimizationService;

  public static getInstance(): ImageOptimizationService {
    if (!ImageOptimizationService.instance) {
      ImageOptimizationService.instance = new ImageOptimizationService();
    }
    return ImageOptimizationService.instance;
  }

  /**
   * Check if WebP is supported by the browser
   */
  public isWebPSupported(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Get optimized image URL with parameters
   */
  public getOptimizedImageUrl(
    originalUrl: string, 
    options: ImageOptimizationOptions = {}
  ): string {
    if (!originalUrl) return '';

    const {
      width,
      height,
      quality = 85,
      format = this.isWebPSupported() ? 'webp' : 'jpeg'
    } = options;

    // If it's an Unsplash URL, optimize it using Unsplash's API
    if (originalUrl.includes('unsplash.com')) {
      const url = new URL(originalUrl);
      
      if (width) url.searchParams.set('w', width.toString());
      if (height) url.searchParams.set('h', height.toString());
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('fm', format);
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('auto', 'format');

      return url.toString();
    }

    // For other URLs, return as-is (could be extended with other CDN optimizations)
    return originalUrl;
  }

  /**
   * Create responsive image srcSet
   */
  public createResponsiveSrcSet(
    originalUrl: string,
    breakpoints: number[] = [320, 640, 768, 1024, 1280, 1920]
  ): string {
    return breakpoints
      .map(width => {
        const optimizedUrl = this.getOptimizedImageUrl(originalUrl, { width });
        return `${optimizedUrl} ${width}w`;
      })
      .join(', ');
  }

  /**
   * Get image sizes attribute for responsive images
   */
  public getImageSizes(maxWidth?: number): string {
    const sizes = [
      '(max-width: 320px) 320px',
      '(max-width: 640px) 640px',
      '(max-width: 768px) 768px',
      '(max-width: 1024px) 1024px',
      '(max-width: 1280px) 1280px',
      '1920px'
    ];

    if (maxWidth) {
      return `(max-width: ${maxWidth}px) ${maxWidth}px, ${maxWidth}px`;
    }

    return sizes.join(', ');
  }

  /**
   * Preload critical images
   */
  public preloadImage(url: string, priority: 'high' | 'low' = 'low'): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    if (priority === 'high') {
      link.setAttribute('fetchpriority', 'high');
    }
    document.head.appendChild(link);
  }

  /**
   * Lazy load image with intersection observer
   */
  public setupLazyLoading(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    }, {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

export default ImageOptimizationService;
