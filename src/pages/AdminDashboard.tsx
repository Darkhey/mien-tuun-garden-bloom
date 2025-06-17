import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminContent from "@/components/admin/AdminContent";
import BlogPostsView from "@/components/admin/views/BlogPostsView";
import KIBlogCreatorView from "@/components/admin/views/KIBlogCreatorView";
import RecipesView from "@/components/admin/views/RecipesView";
import KIRecipeCreatorView from "@/components/admin/views/KIRecipeCreatorView";
import UsersView from "@/components/admin/views/UsersView";
import SowingCalendarView from "@/components/admin/views/SowingCalendarView";
import AutomatisierungView from "@/components/admin/views/AutomatisierungView";
import SecurityLogView from "@/components/admin/views/SecurityLogView";
import ContentStrategyView from "@/components/admin/views/ContentStrategyView";
import BlogTestingView from "@/components/admin/views/BlogTestingView";
import SystemDiagnosticsView from "@/components/admin/views/SystemDiagnosticsView";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState("content");

  // Check if user is admin
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const isAdmin = userRoles?.some(role => role.role === "admin");
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const renderView = () => {
    switch (activeView) {
      case "blog-posts":
        return <BlogPostsView />;
      case "ki-blog-creator":
        return <KIBlogCreatorView />;
      case "recipes":
        return <RecipesView />;
      case "ki-recipe-creator":
        return <KIRecipeCreatorView />;
      case "users":
        return <UsersView />;
      case "sowing-calendar":
        return <SowingCalendarView />;
      case "automatisierung":
        return <AutomatisierungView />;
      case "security-log":
        return <SecurityLogView />;
      case "content-strategy":
        return <ContentStrategyView />;
      case "blog-testing":
        return <BlogTestingView />;
      case "system-diagnostics":
        return <SystemDiagnosticsView />;
      default:
        return <AdminContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
