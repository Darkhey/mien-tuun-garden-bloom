
import React from 'react';
import { siteConfig } from '@/config/site.config';
import Header from './Header';
import Footer from './Footer';

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
      <style jsx global>{`
        :root {
          --primary-color: ${siteConfig.theme.primaryColor};
          --secondary-color: ${siteConfig.theme.secondaryColor};
          --accent-color: ${siteConfig.theme.accentColor};
          --background-color: ${siteConfig.theme.backgroundColor};
          --text-color: ${siteConfig.theme.textColor};
          --muted-color: ${siteConfig.theme.mutedColor};
        }
      `}</style>
      
      <Header />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
