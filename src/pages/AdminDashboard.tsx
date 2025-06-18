import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminContent from "@/components/admin/AdminContent";
import { useAdminData } from "@/hooks/useAdminData";
import { useAdminActions } from "@/hooks/useAdminActions";
import EditBlogPostModal from "@/components/admin/EditBlogPostModal";
import { AdminBlogPost, AdminView } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>("blog-posts");
  const [editingBlogPost, setEditingBlogPost] = useState<AdminBlogPost | null>(null);
  
  // Load admin data
  const {
    recipes,
    blogPosts, 
    users,
    loading,
    dataError,
    setRecipes,
    setBlogPosts,
    setUsers,
    loadData
  } = useAdminData(activeView);

  // Admin actions
  const {
    handleTogglePremium,
    handleDeleteUser,
    handleToggleStatus,
    handleDelete
  } = useAdminActions();

  // Check if user is admin - simplified check since we already have AdminProtectedRoute
  const { isLoading } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      
      return data || [];
    },
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const renderView = () => {
    return (
      <AdminContent
        activeView={activeView}
        recipes={recipes}
        blogPosts={blogPosts}
        users={users}
        loading={loading}
        error={dataError}
        onToggleStatus={(id, status, type) => 
          handleToggleStatus(id, status, type, recipes, blogPosts, setRecipes, setBlogPosts)
        }
        onDelete={(id, type) => 
          handleDelete(id, type, recipes, blogPosts, setRecipes, setBlogPosts)
        }
        onTogglePremium={(userId, isPremium) => 
          handleTogglePremium(userId, isPremium, users, setUsers)
        }
        onDeleteUser={(userId) => 
          handleDeleteUser(userId, users, setUsers)
        }
        onEditRecipe={(recipe) => {
          // Handle recipe editing
        }}
        onEditBlogPost={(post) => {
          setEditingBlogPost(post);
        }}
        onDataRefresh={loadData}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 py-6">
          <div className="w-64 flex-shrink-0">
            <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
          </div>
          <div className="flex-1">
            {renderView()}
          </div>
        </div>
      </div>
      
      {editingBlogPost && (
        <EditBlogPostModal
          post={editingBlogPost}
          onClose={() => setEditingBlogPost(null)}
          onSaved={() => {
            setEditingBlogPost(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;