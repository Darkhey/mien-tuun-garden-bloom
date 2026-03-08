import React from 'react';
import { siteConfig } from '@/config/site.config';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import CookieConsent from './CookieConsent';
import ExitIntentPopup from './ExitIntentPopup';

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
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
      <CookieConsent />
      <ExitIntentPopup />
    </div>
  );
};

export default Layout;
