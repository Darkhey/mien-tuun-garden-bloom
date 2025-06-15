
import React, { useState } from "react";
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
import ContentStrategyDashboard from "@/components/admin/ContentStrategyDashboard";
import EditRecipeModal from "@/components/admin/EditRecipeModal";
import EditBlogPostModal from "@/components/admin/EditBlogPostModal";

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
  onDataRefresh?: () => void;
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
  onDataRefresh
}) => {
  const [editingRecipe, setEditingRecipe] = useState<AdminRecipe | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<AdminBlogPost | null>(null);

  const handleRecipeEdit = (recipe: AdminRecipe) => {
    setEditingRecipe(recipe);
  };

  const handleBlogPostEdit = (post: AdminBlogPost) => {
    setEditingBlogPost(post);
  };

  const handleModalClose = () => {
    setEditingRecipe(null);
    setEditingBlogPost(null);
  };

  const handleSaved = () => {
    handleModalClose();
    if (onDataRefresh) {
      onDataRefresh();
    }
  };

  switch (activeView) {
    case "recipes":
      return (
        <>
          <RecipesView 
            recipes={recipes}
            loading={loading}
            error={error}
            onToggleStatus={(id, status) => onToggleStatus(id, status, 'recipe')}
            onEdit={handleRecipeEdit}
            onDelete={(id) => onDelete(id, 'recipe')}
          />
          {editingRecipe && (
            <EditRecipeModal
              recipe={editingRecipe}
              onClose={handleModalClose}
              onSaved={handleSaved}
            />
          )}
        </>
      );
    case "blog-posts":
      return (
        <>
          <BlogPostsView 
            posts={blogPosts}
            loading={loading}
            error={error}
            onToggleStatus={(id, status) => onToggleStatus(id, status, 'blog')}
            onEdit={handleBlogPostEdit}
            onDelete={(id) => onDelete(id, 'blog')}
          />
          {editingBlogPost && (
            <EditBlogPostModal
              post={editingBlogPost}
              onClose={handleModalClose}
              onSaved={handleSaved}
            />
          )}
        </>
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
    case "content-strategy":
      return <ContentStrategyDashboard />;
    default:
      return (
        <>
          <RecipesView 
            recipes={recipes}
            loading={loading}
            error={error}
            onToggleStatus={(id, status) => onToggleStatus(id, status, 'recipe')}
            onEdit={handleRecipeEdit}
            onDelete={(id) => onDelete(id, 'recipe')}
          />
          {editingRecipe && (
            <EditRecipeModal
              recipe={editingRecipe}
              onClose={handleModalClose}
              onSaved={handleSaved}
            />
          )}
        </>
      );
  }
};

export default AdminContent;
