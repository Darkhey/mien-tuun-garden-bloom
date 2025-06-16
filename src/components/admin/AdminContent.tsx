
import React from "react";
import { AdminView, AdminRecipe, AdminBlogPost, AdminUser } from "@/types/admin";
import RecipesView from "./views/RecipesView";
import BlogPostsView from "./views/BlogPostsView";
import UsersView from "./views/UsersView";
import AutomationDashboard from "./AutomationDashboard";
import ContentStrategyDashboard from "./ContentStrategyDashboard";
import Phase2Dashboard from "./Phase2Dashboard";
import Phase3Dashboard from "./Phase3Dashboard";
import SecurityAuditLog from "./SecurityAuditLog";
import BlogSystemTestDashboard from "./BlogSystemTestDashboard";

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
  onDeleteUser: (userId: string) => void;
  onDataRefresh: () => void;
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
  onTogglePremium,
  onDeleteUser,
  onDataRefresh,
}) => {
  const renderContent = () => {
    switch (activeView) {
      case "recipes":
        return (
          <RecipesView
            recipes={recipes}
            loading={loading}
            error={error}
            onToggleStatus={(id, status) => onToggleStatus(id, status, 'recipe')}
            onDelete={(id) => onDelete(id, 'recipe')}
          />
        );
      case "blog-posts":
        return (
          <BlogPostsView
            blogPosts={blogPosts}
            loading={loading}
            error={error}
            onToggleStatus={(id, status) => onToggleStatus(id, status, 'blog')}
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
            onDeleteUser={onDeleteUser}
            onRefresh={onDataRefresh}
          />
        );
      case "automation":
        return <AutomationDashboard />;
      case "content-strategy":
        return <ContentStrategyDashboard />;
      case "phase2":
        return <Phase2Dashboard />;
      case "phase3":
        return <Phase3Dashboard />;
      case "security":
        return <SecurityAuditLog />;
      case "blog-testing":
        return <BlogSystemTestDashboard />;
      default:
        return <div>View nicht gefunden</div>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {renderContent()}
    </div>
  );
};

export default AdminContent;
