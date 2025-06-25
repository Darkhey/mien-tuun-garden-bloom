
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { adminMenuItems } from '@/config/adminMenu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeView?: string;
  onViewChange?: (view: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  activeView = 'blog-posts',
  onViewChange = () => {}
}) => {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const AppSidebar = () => (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h2 className="font-semibold text-lg">Admin Dashboard</h2>
            <p className="text-sm text-muted-foreground">Mien Tuun</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {adminMenuItems.map((group, groupIndex) => (
          <SidebarGroup key={group.id}>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.children ? (
                  group.children.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton 
                          onClick={() => onViewChange(item.id)}
                          isActive={activeView === item.id}
                          className="w-full justify-start"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => onViewChange(group.id)}
                      isActive={activeView === group.id}
                      className="w-full justify-start"
                    >
                      <group.icon className="h-4 w-4" />
                      <span>{group.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 h-auto p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{user?.email?.split('@')[0] || 'Admin'}</span>
                <span className="text-muted-foreground text-xs">{user?.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Einstellungen
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {adminMenuItems
                      .flatMap(group => group.children || [group])
                      .find(item => item.id === activeView)?.title || 'Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Verwalte deine Inhalte und Einstellungen
                  </p>
                </div>
              </div>
            </header>
            <div className="flex-1 overflow-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
