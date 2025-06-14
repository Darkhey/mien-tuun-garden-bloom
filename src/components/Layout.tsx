
import React from 'react';
import { siteConfig } from '@/config/site.config';
import Header from './Header';
import Footer from './Footer';
import GoogleAnalytics from './GoogleAnalytics';

// Monetarisierung aus siteConfig
const analyticsId = "G-XXXXXXXXXX"; // <--- Später anpassen!
const adsEnabled = siteConfig.monetization.adsEnabled;

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = siteConfig.title,
  description = siteConfig.description 
}) => {
  return (
    <div className="min-h-screen bg-cream">
      {/* Theme-Part */}
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --primary-color: ${siteConfig.theme.primaryColor};
            --secondary-color: ${siteConfig.theme.secondaryColor};
            --accent-color: ${siteConfig.theme.accentColor};
            --background-color: ${siteConfig.theme.backgroundColor};
            --text-color: ${siteConfig.theme.textColor};
            --muted-color: ${siteConfig.theme.mutedColor};
          }
        `
      }} />
      
      {/* Google Analytics */}
      <GoogleAnalytics trackingId={analyticsId} />

      <Header />
      <main className="flex-1">
        {children}
        {/* Beispiel für Werbung */}
        {/* {adsEnabled && (
          <div className="my-8 flex justify-center">
            <AdSenseSlot slot="1234567890" />
          </div>
        )} */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
