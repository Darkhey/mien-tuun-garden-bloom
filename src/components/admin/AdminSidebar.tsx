
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AdminView } from "@/types/admin";
import { adminMenuItems } from "@/config/adminMenu";

interface AdminSidebarProps {
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Navigation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {adminMenuItems.map((group, groupIndex) => (
          <div key={groupIndex}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.children ? (
                group.children.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activeView === item.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveView(item.id as AdminView)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })
              ) : (
                <Button
                  key={group.id}
                  variant={activeView === group.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveView(group.id as AdminView)}
                >
                  <group.icon className="mr-2 h-4 w-4" />
                  {group.label}
                </Button>
              )}
            </div>
            {groupIndex < adminMenuItems.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AdminSidebar;
