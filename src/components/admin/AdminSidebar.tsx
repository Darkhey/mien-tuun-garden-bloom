
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AdminView } from "@/types/admin";
import { menuItems } from "@/config/adminMenu";

interface AdminSidebarProps {
  activeView: AdminView;
  onViewChange: (view: AdminView) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, onViewChange }) => {
  return (
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
                    onClick={() => onViewChange(item.key)}
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
  );
};

export default AdminSidebar;
