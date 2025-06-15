
import React from "react";
import { AdminView, AdminUser, AdminRecipe, AdminBlogPost } from "@/types/admin";
import RecipesView from "@/components/admin/views/RecipesView";
import BlogPostsView from "@/components/admin/views/BlogPostsView";
import UsersView from "@/components/admin/views/UsersView";
import KIRecipeCreator from "@/components/admin/KIRecipeCreator";
import KIBlogCreator from "@/components/admin/KIBlogCreator";
import SowingCalendar from "@/components/admin/SowingCalendar";
import SecurityAuditLog from "@/components/admin/SecurityAuditLog";
import Phase2Dashboard from "@/components/admin/Phase2Dashboard";
import Phase3Dashboard from "@/components/admin/Phase3Dashboard";
import BlogSystemTestDashboard from "@/components/admin/BlogSystemTestDashboard";

interface AdminContentProps {
  activeView: AdminView;
  recipes: AdminRecipe[];
  blogPosts: AdminBlogPost[];
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  onToggleStatus: (id: string, status: string, type: 'recipe' | 'blog') => void;
  onDelete: (id: string, type: 'recipe' | 'blog') => void;
  onTogglePremium: (userId: string, isPremium: boolean) => void;
}

const AdminContent: React.FC<AdminContentProps> = ({
  activeView,
  recipes,
  blogPosts,
  users,
  loading,
  error,
  onToggleStatus,
  onDelete,
  onTogglePremium
}) => {
  switch (activeView) {
    case "recipes":
      return (
        <RecipesView 
          recipes={recipes}
          loading={loading}
          error={error}
          onToggleStatus={(id, status) => onToggleStatus(id, status, 'recipe')}
          onEdit={(recipe) => console.log('Edit recipe:', recipe)}
          onDelete={(id) => onDelete(id, 'recipe')}
        />
      );
    case "blog-posts":
      return (
        <BlogPostsView 
          posts={blogPosts}
          loading={loading}
          error={error}
          onToggleStatus={(id, status) => onToggleStatus(id, status, 'blog')}
          onEdit={(post) => console.log('Edit post:', post)}
          onDelete={(id) => onDelete(id, 'blog')}
        />
      );
    case "users":
      return (
        <UsersView 
          users={users}
          loading={loading}
          error={error}
          onTogglePremium={onTogglePremium}
        />
      );
    case "ki-recipe":
      return <KIRecipeCreator />;
    case "ki-blog":
      return <KIBlogCreator />;
    case "sowing-calendar":
      return <SowingCalendar />;
    case "security-log":
      return <SecurityAuditLog />;
    case "phase2-dashboard":
      return <Phase2Dashboard />;
    case "phase3-dashboard":
      return <Phase3Dashboard />;
    case "blog-test-dashboard":
      return <BlogSystemTestDashboard />;
    default:
      return (
        <RecipesView 
          recipes={recipes}
          loading={loading}
          error={error}
          onToggleStatus={(id, status) => onToggleStatus(id, status, 'recipe')}
          onEdit={(recipe) => console.log('Edit recipe:', recipe)}
          onDelete={(id) => onDelete(id, 'recipe')}
        />
      );
  }
};

export default AdminContent;
