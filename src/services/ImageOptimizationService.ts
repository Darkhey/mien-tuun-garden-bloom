
// ⚠️ PARTIALLY SIMULATED SERVICE - Browser compatibility limited

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

// Universal garden fallback image
const GARDEN_FALLBACK_IMAGE = "/lovable-uploads/2a3ad273-430b-4675-b1c4-33dbaac0b6cf.png";

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
   * ⚠️ BROWSER DEPENDENT
   */
  public isWebPSupported(): boolean {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch (error) {
      console.warn('[ImageOptimization] ⚠️ WebP detection failed:', error);
      return false;
    }
  }

  /**
   * Get optimized image URL with parameters
   */
  public getOptimizedImageUrl(
    originalUrl: string, 
    options: ImageOptimizationOptions = {}
  ): string {
    if (!originalUrl) return GARDEN_FALLBACK_IMAGE;

    const {
      width,
      height,
      quality = 85,
      format = this.isWebPSupported() ? 'webp' : 'jpeg'
    } = options;

    // If it's an Unsplash URL, optimize it using Unsplash's API
    if (originalUrl.includes('unsplash.com')) {
      try {
        const url = new URL(originalUrl);
        
        if (width) url.searchParams.set('w', width.toString());
        if (height) url.searchParams.set('h', height.toString());
        url.searchParams.set('q', quality.toString());
        url.searchParams.set('fm', format);
        url.searchParams.set('fit', 'crop');
        url.searchParams.set('auto', 'format');

        return url.toString();
      } catch (error) {
        console.warn('[ImageOptimization] ⚠️ URL optimization failed:', error);
        return originalUrl;
      }
    }

    // For other URLs, return as-is (could be extended with other CDN optimizations)
    return originalUrl;
  }

  /**
   * Create responsive image srcSet
   * ⚠️ SIMULATED for non-Unsplash images
   */
  public createResponsiveSrcSet(
    originalUrl: string,
    breakpoints: number[] = [320, 640, 768, 1024, 1280, 1920]
  ): string {
    if (!originalUrl.includes('unsplash.com')) {
      console.log('[ImageOptimization] ⚠️ SIMULATED srcSet for non-Unsplash image');
      return `${originalUrl} 1x`;
    }

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
   * ⚠️ BROWSER DEPENDENT
   */
  public preloadImage(url: string, priority: 'high' | 'low' = 'low'): void {
    try {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      if (priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }
      document.head.appendChild(link);
    } catch (error) {
      console.warn('[ImageOptimization] ⚠️ Preloading failed:', error);
    }
  }

  /**
   * Lazy load image with intersection observer
   * ⚠️ BROWSER DEPENDENT
   */
  public setupLazyLoading(): void {
    if (!('IntersectionObserver' in window)) {
      console.warn('[ImageOptimization] ⚠️ IntersectionObserver not supported');
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
