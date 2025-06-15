
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AdminView } from "@/types/admin";
import { useAdminData } from "@/hooks/useAdminData";
import { useAdminActions } from "@/hooks/useAdminActions";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminContent from "@/components/admin/AdminContent";

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>("recipes");
  const [userEmail, setUserEmail] = useState<string>("");

  const {
    recipes,
    blogPosts,
    users,
    loading,
    dataError,
    setRecipes,
    setBlogPosts,
    setUsers
  } = useAdminData(activeView);

  const { handleTogglePremium, handleToggleStatus, handleDelete } = useAdminActions();

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    getUserEmail();
  }, []);

  const onToggleStatus = (id: string, status: string, type: 'recipe' | 'blog') => {
    handleToggleStatus(id, status, type, recipes, blogPosts, setRecipes, setBlogPosts);
  };

  const onDelete = (id: string, type: 'recipe' | 'blog') => {
    handleDelete(id, type, recipes, blogPosts, setRecipes, setBlogPosts);
  };

  const onTogglePremium = (userId: string, isPremium: boolean) => {
    handleTogglePremium(userId, isPremium, users, setUsers);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Verwalte deine Website und Inhalte</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
              Admin: {userEmail}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <AdminSidebar activeView={activeView} onViewChange={setActiveView} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AdminContent
              activeView={activeView}
              recipes={recipes}
              blogPosts={blogPosts}
              users={users}
              loading={loading}
              error={dataError}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
              onTogglePremium={onTogglePremium}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
