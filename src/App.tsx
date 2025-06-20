
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LazyRoute from "./components/LazyRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import React, { lazy, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ImageOptimizationService from "@/services/ImageOptimizationService";

// Lazy load all page components
const Index = lazy(() => import("./pages/Index"));
const BlogOverview = lazy(() => import("./pages/BlogOverview"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const RecipeOverview = lazy(() => import("./pages/RecipeOverview"));
const RecipeDetail = lazy(() => import("./pages/RecipeDetail"));
const RecipeBook = lazy(() => import("./pages/RecipeBook"));
const About = lazy(() => import("./pages/About"));
const Links = lazy(() => import("./pages/Links"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const Impressum = lazy(() => import("./pages/Impressum"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const NewsletterConfirmPage = lazy(() => import("./pages/NewsletterConfirmPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AussaatkalenderPage = lazy(() => import("./pages/AussaatkalenderPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// AdminProtectedRoute: Nur Admins erlaubt
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAllowed, setIsAllowed] = useState<null | boolean>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      try {
        console.log("Checking admin rights...");
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          console.log("No session found, redirecting to home");
          navigate("/");
          return;
        }
        
        const userId = sessionData.session.user.id;
        console.log("User ID:", userId);
        
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin");
        
        if (error) {
          console.error("Error checking admin role:", error);
          if (isMounted) setIsAllowed(false);
          navigate("/profil");
          return;
        }
        
        const isAdmin = data && data.length > 0;
        console.log("Is admin:", isAdmin, "Data:", data);
        
        if (isMounted) setIsAllowed(isAdmin);
        if (!isAdmin) navigate("/profil");
      } catch (error) {
        console.error("Unexpected error checking admin status:", error);
        if (isMounted) setIsAllowed(false);
        navigate("/profil");
      }
    };
    
    check();
    return () => { isMounted = false };
  }, [navigate]);

  if (isAllowed === null) {
    return (
      <div className="flex items-center justify-center h-60">
        <span>Prüfe Admin-Rechte...</span>
      </div>
    );
  }
  if (!isAllowed) return null;
  return <>{children}</>;
};

function App() {
  useEffect(() => {
    // Initialize image optimization service
    const imageService = ImageOptimizationService.getInstance();
    imageService.setupLazyLoading();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TooltipProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<LazyRoute><Index /></LazyRoute>} />
                <Route path="/blog" element={<LazyRoute><BlogOverview /></LazyRoute>} />
                <Route path="/blog/:slug" element={<LazyRoute><BlogPost /></LazyRoute>} />
                <Route path="/rezepte" element={<LazyRoute><RecipeOverview /></LazyRoute>} />
                <Route path="/rezepte/:id" element={<LazyRoute><RecipeDetail /></LazyRoute>} />
                <Route path="/rezeptebuch" element={<LazyRoute><RecipeBook /></LazyRoute>} />
                <Route path="/aussaatkalender" element={<LazyRoute><AussaatkalenderPage /></LazyRoute>} />
                <Route path="/about" element={<LazyRoute><About /></LazyRoute>} />
                <Route path="/links" element={<LazyRoute><Links /></LazyRoute>} />
                <Route path="/datenschutz" element={<LazyRoute><Datenschutz /></LazyRoute>} />
                <Route path="/impressum" element={<LazyRoute><Impressum /></LazyRoute>} />
                <Route path="/profil" element={<LazyRoute><ProfilePage /></LazyRoute>} />
                <Route 
                  path="/admin/:view?/:slug?" 
                  element={
                    <LazyRoute>
                      <AdminProtectedRoute>
                        <AdminDashboard />
                      </AdminProtectedRoute>
                    </LazyRoute>
                  } 
                />
                <Route path="/kontakt" element={<LazyRoute><ContactPage /></LazyRoute>} />
                <Route path="/newsletter-confirm" element={<LazyRoute><NewsletterConfirmPage /></LazyRoute>} />
                <Route path="/login" element={<LazyRoute><LoginPage /></LazyRoute>} />
                <Route path="*" element={<LazyRoute><NotFound /></LazyRoute>} />
              </Routes>
            </Layout>
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
