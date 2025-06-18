import React from "react";
import { AdminView, AdminRecipe, AdminBlogPost, AdminUser } from "@/types/admin";
import RecipesView from "./views/RecipesView";
import BlogPostsView from "./views/BlogPostsView";
import UsersView from "./views/UsersView";
import KIRecipeCreatorView from "./views/KIRecipeCreatorView";
import KIBlogCreatorView from "./views/KIBlogCreatorView";
import SowingCalendarView from "./views/SowingCalendarView";
import AutomatisierungView from "./views/AutomatisierungView";
import ContentStrategyView from "./views/ContentStrategyView";
import SecurityLogView from "./views/SecurityLogView";
import BlogTestingView from "./views/BlogTestingView";
import SystemDiagnosticsView from "./views/SystemDiagnosticsView";
import ScheduledJobsView from "./views/ScheduledJobsView";

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
  onEditRecipe: (recipe: AdminRecipe) => void;
  onEditBlogPost: (post: AdminBlogPost) => void;
  onDataRefresh: () => void;
  testSlug?: string;
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
  onEditRecipe,
  onEditBlogPost,
  onDataRefresh,
  testSlug,
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
            onEdit={onEditRecipe}
          />
        );
      case "blog-posts":
        return <BlogPostsView />;
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
      case "ki-recipe":
      case "ki-recipe-creator":
        return <KIRecipeCreatorView />;
      case "ki-blog":
      case "ki-blog-creator":
        return <KIBlogCreatorView />;
      case "content-strategy":
        return <ContentStrategyView />;
      case "automatisierung":
        return <AutomatisierungView />;
      case "sowing-calendar":
        return <SowingCalendarView />;
      case "scheduled-jobs":
        return <ScheduledJobsView />;
      case "security-log":
        return <SecurityLogView />;
      case "blog-testing":
        return <BlogTestingView testSlug={testSlug} />;
      case "system-diagnostics":
        return <SystemDiagnosticsView />;
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