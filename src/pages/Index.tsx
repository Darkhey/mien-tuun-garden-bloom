
import React, { useEffect } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLandingPage from "./MobileLandingPage";
import HeroSection from "@/components/landing/HeroSection";
import PromisesSection from "@/components/landing/PromisesSection";
import SeasonalTipsSection from "@/components/landing/SeasonalTipsSection";
import AboutMarianneSection from "@/components/landing/AboutMarianneSection";
import RecipeSpotlightSection from "@/components/landing/RecipeSpotlightSection";
import CommunitySection from "@/components/landing/CommunitySection";
import LatestPostsSection from "@/components/landing/LatestPostsSection";
import LatestCommentsSection from "@/components/landing/LatestCommentsSection";
import WeatherForecastSection from "@/components/landing/WeatherForecastSection";
import SuggestedPostsSection from "@/components/landing/SuggestedPostsSection";
import { useQueryClient } from '@tanstack/react-query';
import { fetchLatestPosts, fetchLatestComments, fetchRainForecast } from '@/queries/content';

const Index = () => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery({ queryKey: ['rain-forecast'], queryFn: fetchRainForecast });
    queryClient.prefetchQuery({ queryKey: ['latest-posts'], queryFn: fetchLatestPosts });
    queryClient.prefetchQuery({ queryKey: ['latest-comments'], queryFn: fetchLatestComments });
  }, [queryClient]);

  if (isMobile) {
    return <MobileLandingPage />;
  }

  return (
    <div>
      <HeroSection />
      <WeatherForecastSection />
      <SuggestedPostsSection />
      <LatestPostsSection />
      <LatestCommentsSection />
      <PromisesSection />
      <SeasonalTipsSection />
      <AboutMarianneSection />
      <RecipeSpotlightSection />
      <CommunitySection />
    </div>
  );
};

export default Index;
