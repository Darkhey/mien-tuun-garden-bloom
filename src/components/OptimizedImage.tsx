
import React, { useState, useRef, useEffect } from 'react';
import ImageOptimizationService from '@/services/ImageOptimizationService';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  lazy?: boolean;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Universal garden fallback image
const GARDEN_FALLBACK_IMAGE = "/lovable-uploads/2a3ad273-430b-4675-b1c4-33dbaac0b6cf.png";

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 85,
  className,
  lazy = true,
  priority = false,
  sizes,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const imageService = ImageOptimizationService.getInstance();

  useEffect(() => {
    if (priority && src) {
      // Preload critical images
      const optimizedUrl = imageService.getOptimizedImageUrl(src, { width, height, quality });
      imageService.preloadImage(optimizedUrl, 'high');
    }
  }, [src, width, height, quality, priority]);

  useEffect(() => {
    if (!lazy || priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (!src) {
    return (
      <div 
        className={cn(
          "bg-earth-100 flex items-center justify-center text-earth-400",
          className
        )}
        style={{ width, height }}
      >
        <img 
          src={GARDEN_FALLBACK_IMAGE} 
          alt={alt || "Garden fallback"} 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const optimizedSrc = hasError ? GARDEN_FALLBACK_IMAGE : imageService.getOptimizedImageUrl(src, { width, height, quality });
  const srcSet = hasError ? undefined : imageService.createResponsiveSrcSet(src);
  const imageSizes = sizes || imageService.getImageSizes(width);

  return (
    <div 
      ref={imgRef} 
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{ width, height }}
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-earth-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-sage-200 border-t-sage-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={imageSizes}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      )}
    </div>
  );
};

export default OptimizedImage;
