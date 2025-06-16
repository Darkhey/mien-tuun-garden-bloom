
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
        return (
          <BlogPostsView
            posts={blogPosts}
            loading={loading}
            error={error}
            onToggleStatus={(id, status) => onToggleStatus(id, status, 'blog')}
            onDelete={(id) => onDelete(id, 'blog')}
            onEdit={onEditBlogPost}
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
      case "ki-recipe":
        return <KIRecipeCreatorView />;
      case "ki-blog":
        return <KIBlogCreatorView />;
      case "content-strategy":
        return <ContentStrategyView />;
      case "automatisierung":
        return <AutomatisierungView />;
      case "sowing-calendar":
        return <SowingCalendarView />;
      case "security-log":
        return <SecurityLogView />;
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
