
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { AdminView } from "@/types/admin";
import { menuItems } from "@/config/adminMenu";

// Import components
import RecipesView from "@/components/admin/views/RecipesView";
import BlogPostsView from "@/components/admin/views/BlogPostsView";
import UsersView from "@/components/admin/views/UsersView";
import KIRecipeCreator from "@/components/admin/KIRecipeCreator";
import KIBlogCreator from "@/components/admin/KIBlogCreator";
import SowingCalendar from "@/components/admin/SowingCalendar";
import SecurityAuditLog from "@/components/admin/SecurityAuditLog";
import Phase2Dashboard from "@/components/admin/Phase2Dashboard";
import Phase3Dashboard from "@/components/admin/Phase3Dashboard";

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>("recipes");
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    getUserEmail();
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case "recipes":
        return (
          <RecipesView 
            recipes={[]}
            loading={loading}
            error={null}
            onToggleStatus={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        );
      case "blog-posts":
        return (
          <BlogPostsView 
            posts={[]}
            loading={loading}
            error={null}
            onToggleStatus={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        );
      case "users":
        return (
          <UsersView 
            users={[]}
            loading={loading}
            error={null}
            onTogglePremium={() => {}}
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
      default:
        return (
          <RecipesView 
            recipes={[]}
            loading={loading}
            error={null}
            onToggleStatus={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        );
    }
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {menuItems.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      {group.group}
                    </h3>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Button
                            key={item.key}
                            variant={activeView === item.key ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveView(item.key)}
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            {item.label}
                          </Button>
                        );
                      })}
                    </div>
                    {groupIndex < menuItems.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
