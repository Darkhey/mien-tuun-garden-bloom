interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  blur?: boolean;
  placeholder?: boolean;
}

/**
 * Generate responsive image sizes for different breakpoints
 */
export const generateResponsiveSizes = (baseWidth: number): string => {
  const sizes = [
    `(max-width: 640px) ${Math.min(baseWidth, 640)}px`,
    `(max-width: 768px) ${Math.min(baseWidth, 768)}px`,
    `(max-width: 1024px) ${Math.min(baseWidth, 1024)}px`,
    `(max-width: 1280px) ${Math.min(baseWidth, 1280)}px`,
    `${baseWidth}px`
  ];
  
  return sizes.join(', ');
};

/**
 * Generate srcSet for different device pixel ratios
 */
export const generateSrcSet = (
  baseUrl: string, 
  baseWidth: number, 
  options: ImageOptimizationOptions = {}
): string => {
  const densities = [1, 1.5, 2];
  
  return densities.map(density => {
    const width = Math.round(baseWidth * density);
    const optimizedUrl = optimizeImageUrl(baseUrl, { 
      ...options, 
      width 
    });
    return `${optimizedUrl} ${density}x`;
  }).join(', ');
};

/**
 * Optimize image URL based on the source
 */
export const optimizeImageUrl = (
  url: string, 
  options: ImageOptimizationOptions = {}
): string => {
  if (!url || url.includes('placeholder')) {
    return url;
  }

  // Handle Unsplash URLs
  if (url.includes('unsplash.com')) {
    return optimizeUnsplashUrl(url, options);
  }

  // Handle Supabase storage URLs
  if (url.includes('supabase.co/storage')) {
    return optimizeSupabaseUrl(url, options);
  }

  // For external URLs, return as-is
  return url;
};

/**
 * Optimize Unsplash image URLs
 */
export const optimizeUnsplashUrl = (
  url: string, 
  options: ImageOptimizationOptions = {}
): string => {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams();

    // Set dimensions
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());

    // Set quality
    if (options.quality) params.set('q', options.quality.toString());

    // Set format
    if (options.format) params.set('fm', options.format);

    // Set fit mode
    if (options.fit) params.set('fit', options.fit);

    // Auto optimize
    params.set('auto', 'format,compress');

    // Enable modern formats
    if (!options.format) {
      params.set('fm', 'webp');
    }

    urlObj.search = params.toString();
    return urlObj.toString();
  } catch (error) {
    console.warn('Failed to optimize Unsplash URL:', error);
    return url;
  }
};

/**
 * Optimize Supabase storage URLs (basic implementation)
 */
export const optimizeSupabaseUrl = (
  url: string, 
  options: ImageOptimizationOptions = {}
): string => {
  // For now, return the original URL
  // This could be extended with Supabase's image transformation API
  return url;
};

/**
 * Generate a low-quality placeholder for progressive loading
 */
export const generatePlaceholder = (url: string): string => {
  return optimizeImageUrl(url, {
    width: 20,
    quality: 10,
    blur: true
  });
};

/**
 * Check if browser supports modern image formats
 */
export const getSupportedFormat = (): 'avif' | 'webp' | 'jpg' => {
  // Check for AVIF support
  const avifSupport = new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => resolve(avif.height === 2);
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });

  // Check for WebP support
  const webpSupport = new Promise((resolve) => {
    const webp = new Image();
    webp.onload = webp.onerror = () => resolve(webp.height === 2);
    webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });

  // For now, return WebP as default since it has wider support
  // In a real implementation, you'd cache these checks
  return 'webp';
};

/**
 * Preload critical images
 */
export const preloadImage = (url: string, options: ImageOptimizationOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const optimizedUrl = optimizeImageUrl(url, options);
    
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${optimizedUrl}`));
    img.src = optimizedUrl;
  });
};

/**
 * Lazy load images with intersection observer
 */
export const createImageLazyLoader = (
  selector: string = '[data-lazy]',
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.lazy;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-lazy');
          observer.unobserve(img);
        }
      }
    });
  }, defaultOptions);

  // Observe all lazy images
  document.querySelectorAll(selector).forEach(img => {
    observer.observe(img);
  });

  return observer;
};