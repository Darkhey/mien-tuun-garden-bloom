
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
import About from "./pages/About";
import Links from "./pages/Links";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/blog" element={<BlogOverview />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/rezepte" element={<RecipeOverview />} />
          <Route path="/rezepte/:slug" element={<RecipeDetail />} />
          <Route path="/garten" element={<BlogOverview />} />
          <Route path="/about" element={<About />} />
          <Route path="/links" element={<Links />} />
          <Route path="/datenschutz" element={<About />} />
          <Route path="/impressum" element={<About />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
