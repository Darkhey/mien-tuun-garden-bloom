import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BlogOverview from "./pages/BlogOverview";
import BlogPost from "./pages/BlogPost";
import RecipeOverview from "./pages/RecipeOverview";
import RecipeDetail from "./pages/RecipeDetail";
import RecipeBook from "./pages/RecipeBook";
import About from "./pages/About";
import Links from "./pages/Links";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import ContactPage from "./pages/ContactPage";
import NewsletterConfirmPage from "./pages/NewsletterConfirmPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<BlogOverview />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/rezepte" element={<RecipeOverview />} />
            <Route path="/rezepte/:id" element={<RecipeDetail />} />
            <Route path="/rezeptebuch" element={<RecipeBook />} />
            <Route path="/garten" element={<BlogOverview />} />
            <Route path="/about" element={<About />} />
            <Route path="/links" element={<Links />} />
            <Route path="/datenschutz" element={<About />} />
            <Route path="/impressum" element={<About />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/kontakt" element={<ContactPage />} />
            <Route path="/newsletter-confirm" element={<NewsletterConfirmPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// AdminProtectedRoute: Nur Admins erlaubt (kleine Hilfskomponente)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAllowed, setIsAllowed] = useState<null | boolean>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate("/auth");
        return;
      }
      const userId = sessionData.session.user.id;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .single();
      if (isMounted) setIsAllowed(!!data);
      if (!data) navigate("/profil");
    };
    check();
    return () => { isMounted = false };
  }, [navigate]);

  if (isAllowed === null) {
    return (
      <div className="flex items-center justify-center h-60">
        {/* ...bisschen Loader UI... */}
        <span>Prüfe Admin-Rechte...</span>
      </div>
    );
  }
  if (!isAllowed) return null;
  return <>{children}</>;
};

export default App;
