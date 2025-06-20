
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from '@/components/ErrorBoundary';
import LazyRoute from '@/components/LazyRoute';
import { useIsMobile } from '@/hooks/use-mobile';

// Lazy load components
const Index = React.lazy(() => import('./pages/Index'));
const MobileLandingPage = React.lazy(() => import('./pages/MobileLandingPage'));
const RecipeOverview = React.lazy(() => import('./pages/RecipeOverview'));
const RecipeDetail = React.lazy(() => import('./pages/RecipeDetail'));
const BlogOverview = React.lazy(() => import('./pages/BlogOverview'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));
const About = React.lazy(() => import('./pages/About'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const RecipeBook = React.lazy(() => import('./pages/RecipeBook'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const AussaatkalenderPage = React.lazy(() => import('./pages/AussaatkalenderPage'));
const Links = React.lazy(() => import('./pages/Links'));
const Impressum = React.lazy(() => import('./pages/Impressum'));
const Datenschutz = React.lazy(() => import('./pages/Datenschutz'));
const NewsletterConfirmPage = React.lazy(() => import('./pages/NewsletterConfirmPage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function App() {
  const isMobile = useIsMobile();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-background">
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Lädt...</div>}>
              <Routes>
                <Route path="/" element={
                  <LazyRoute>
                    {isMobile ? <MobileLandingPage /> : <Index />}
                  </LazyRoute>
                } />
                <Route path="/rezepte" element={<LazyRoute><RecipeOverview /></LazyRoute>} />
                <Route path="/rezept/:slug" element={<LazyRoute><RecipeDetail /></LazyRoute>} />
                <Route path="/blog" element={<LazyRoute><BlogOverview /></LazyRoute>} />
                <Route path="/blog/:slug" element={<LazyRoute><BlogPost /></LazyRoute>} />
                <Route path="/ueber-uns" element={<LazyRoute><About /></LazyRoute>} />
                <Route path="/kontakt" element={<LazyRoute><ContactPage /></LazyRoute>} />
                <Route path="/mein-rezeptbuch" element={<LazyRoute><RecipeBook /></LazyRoute>} />
                <Route path="/profil" element={<LazyRoute><ProfilePage /></LazyRoute>} />
                <Route path="/admin" element={<LazyRoute><AdminDashboard /></LazyRoute>} />
                <Route path="/login" element={<LazyRoute><LoginPage /></LazyRoute>} />
                <Route path="/aussaatkalender" element={<LazyRoute><AussaatkalenderPage /></LazyRoute>} />
                <Route path="/links" element={<LazyRoute><Links /></LazyRoute>} />
                <Route path="/impressum" element={<LazyRoute><Impressum /></LazyRoute>} />
                <Route path="/datenschutz" element={<LazyRoute><Datenschutz /></LazyRoute>} />
                <Route path="/newsletter-bestaetigung" element={<LazyRoute><NewsletterConfirmPage /></LazyRoute>} />
                <Route path="*" element={<LazyRoute><NotFound /></LazyRoute>} />
              </Routes>
            </Suspense>
          </div>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
