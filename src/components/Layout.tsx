import React from 'react';
import { siteConfig } from '@/config/site.config';
import Header from './Header';
import Footer from './Footer';
import GoogleAnalytics from './GoogleAnalytics';
import AdSenseSlot from "./AdSenseSlot";
import AdPlaceholder from "./AdPlaceholder";
import SowingCalendarFlag from "./SowingCalendarFlag";

// Monetarisierung aus siteConfig
const analyticsId = "G-ABCDE123456"; // <--- DEINE Google Analytics-ID hier eintragen!
const adsEnabled = siteConfig.monetization.adsEnabled;

// Hilfsfunktion: Ist ein echter Publisher-Key gesetzt?
function hasAdsensePublisherId() {
  const id = siteConfig.monetization.adsenseClientId;
  return !!id && id !== "ca-pub-XXXXXXXXXXXXXXX";
}

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = siteConfig.title,
  description = siteConfig.description,
}) => {
  return (
    <div className="min-h-screen bg-cream">
      {/* Theme-Part */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          :root {
            --primary-color: ${siteConfig.theme.primaryColor};
            --secondary-color: ${siteConfig.theme.secondaryColor};
            --accent-color: ${siteConfig.theme.accentColor};
            --background-color: ${siteConfig.theme.backgroundColor};
            --text-color: ${siteConfig.theme.textColor};
            --muted-color: ${siteConfig.theme.mutedColor};
          }
        `,
        }}
      />

      {/* Google Analytics */}
      <GoogleAnalytics trackingId={analyticsId} />

      <Header />
      {/* Das Flaggen-Label immer anzeigen! */}
      <SowingCalendarFlag />
      <main className="flex-1">
        {children}
        {/* Werbung/Platzhalter sichtbar */}
        <div className="my-8 flex justify-center">
          {adsEnabled && hasAdsensePublisherId() ? (
            <AdSenseSlot slot="1234567890" />
          ) : (
            <AdPlaceholder />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
