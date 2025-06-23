
import React from 'react';
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

const Index = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileLandingPage />;
  }

  return (
    <div>
      <HeroSection />
      <WeatherForecastSection />
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
