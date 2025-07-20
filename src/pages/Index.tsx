
import React, { useEffect, Suspense } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLandingPage from "./MobileLandingPage";
import HeroSection from "@/components/landing/HeroSection";
import PromisesSection from "@/components/landing/PromisesSection";
import SeasonalTipsSection from "@/components/landing/SeasonalTipsSection";
import AboutMarianneSection from "@/components/landing/AboutMarianneSection";
import RecipeSpotlightSection from "@/components/landing/RecipeSpotlightSection";
import CommunitySection from "@/components/landing/CommunitySection";
import { useQueryClient } from '@tanstack/react-query';
import { fetchLatestPosts, fetchLatestComments, fetchRainForecast } from '@/queries/content';

// Lazy load components for better performance
const LatestPostsSection = React.lazy(() => import("@/components/landing/LatestPostsSection"));
const LatestCommentsSection = React.lazy(() => import("@/components/landing/LatestCommentsSection"));
const WeatherForecastSection = React.lazy(() => import("@/components/landing/WeatherForecastSection"));
const SuggestedPostsSection = React.lazy(() => import("@/components/landing/SuggestedPostsSection"));

// Loading component for lazy sections
const SectionSkeleton = () => (
  <section className="py-16 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-8"></div>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-2xl h-96"></div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Index = () => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch critical data with error handling
    const prefetchData = async () => {
      const prefetchPromises = [
        queryClient.prefetchQuery({ 
          queryKey: ['rain-forecast'], 
          queryFn: fetchRainForecast,
          staleTime: 5 * 60 * 1000 // 5 minutes
        }).catch(console.warn),
        queryClient.prefetchQuery({ 
          queryKey: ['latest-posts'], 
          queryFn: fetchLatestPosts,
          staleTime: 10 * 60 * 1000 // 10 minutes
        }).catch(console.warn),
        queryClient.prefetchQuery({ 
          queryKey: ['latest-comments'], 
          queryFn: fetchLatestComments,
          staleTime: 15 * 60 * 1000 // 15 minutes
        }).catch(console.warn),
      ];

      // Don't wait for all prefetches to complete
      Promise.allSettled(prefetchPromises);
    };

    prefetchData();
  }, [queryClient]);

  if (isMobile) {
    return <MobileLandingPage />;
  }

  return (
    <div>
      <HeroSection />
      
      <Suspense fallback={<SectionSkeleton />}>
        <WeatherForecastSection />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <SuggestedPostsSection />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <LatestPostsSection />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <LatestCommentsSection />
      </Suspense>
      
      <PromisesSection />
      <SeasonalTipsSection />
      <AboutMarianneSection />
      <RecipeSpotlightSection />
      <CommunitySection />
    </div>
  );
};

export default Index;
