import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import Account from '@/components/admin/Account';
import BlogPostsView from '@/components/admin/views/BlogPostsView';
import RecipesView from '@/components/admin/views/RecipesView';
import UsersView from '@/components/admin/views/UsersView';
import SettingsView from '@/components/admin/views/SettingsView';
import BlogTestingView from '@/components/admin/views/BlogTestingView';
import KIBlogCreatorView from '@/components/admin/views/KIBlogCreatorView';
import BlogPodcastView from '@/components/admin/views/BlogPodcastView';
import { adminMenuItems } from '@/config/adminMenu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState(adminMenuItems[0].children[0].id);
  const navigate = useNavigate();
  const user = useUser();
  const supabaseClient = useSupabaseClient();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'account':
        return <Account />;
      case 'users':
        return <UsersView />;
      case 'recipes':
        return <RecipesView />;
      case 'settings':
        return <SettingsView />;
      case 'blog-posts':
        return <BlogPostsView />;
      case 'ki-blog-creator':
        return <KIBlogCreatorView />;
      case 'blog-podcasts':
        return <BlogPodcastView />;
      case 'blog-testing':
        return <BlogTestingView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Admin Menu</SheetTitle>
            <SheetDescription>
              Wähle eine Option aus der Liste.
            </SheetDescription>
          </SheetHeader>
          <Separator className="my-4" />
          <MainNav
            className="flex flex-col space-y-1"
            items={adminMenuItems}
            setActiveView={setActiveView}
          />
        </SheetContent>
      </Sheet>

      <div className="p-4 md:ml-20">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 lg:h-auto lg:w-auto lg:px-3">
                    <span className="sr-only lg:not-sr-only">Profil</span>
                    <Avatar className="h-8 w-8 lg:mr-2">
                      <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} alt={user?.email || "Admin"} />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <span className="mr-2">Profil</span>
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Abmelden
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 gap-4">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
