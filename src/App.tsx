import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import BlogOverview from "./pages/BlogOverview";
import BlogPost from "./pages/BlogPost";
import RecipeOverview from "./pages/RecipeOverview";
import RecipeDetail from "./pages/RecipeDetail";
import RecipeBook from "./pages/RecipeBook";
import About from "./pages/About";
import Links from "./pages/Links";
import Datenschutz from "./pages/Datenschutz";
import Impressum from "./pages/Impressum";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import ContactPage from "./pages/ContactPage";
import NewsletterConfirmPage from "./pages/NewsletterConfirmPage";
import LoginPage from "./pages/LoginPage";
import AussaatkalenderPage from "./pages/AussaatkalenderPage";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

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
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TooltipProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/blog" element={<BlogOverview />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/rezepte" element={<RecipeOverview />} />
              <Route path="/rezepte/:id" element={<RecipeDetail />} />
              <Route path="/rezeptebuch" element={<RecipeBook />} />
              <Route path="/aussaatkalender" element={<AussaatkalenderPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/links" element={<Links />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/admin/:view?/:slug?" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
              <Route path="/kontakt" element={<ContactPage />} />
              <Route path="/newsletter-confirm" element={<NewsletterConfirmPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;