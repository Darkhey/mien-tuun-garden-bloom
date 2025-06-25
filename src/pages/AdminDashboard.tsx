
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import BlogPostsView from '@/components/admin/views/BlogPostsView';
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
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('blog-posts');
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'blog-posts':
        return <BlogPostsView />;
      case 'ki-blog-creator':
        return <KIBlogCreatorView />;
      case 'blog-podcasts':
        return <BlogPodcastView />;
      case 'blog-testing':
        return <BlogTestingView />;
      default:
        return <BlogPostsView />;
    }
  };

  const MainNav = ({ items, setActiveView }: { items: any[], setActiveView: (view: string) => void }) => (
    <nav className="space-y-2">
      {items.map((item) => (
        <div key={item.id}>
          {item.children ? (
            <div>
              <div className="font-medium text-sm text-gray-700 mb-2">{item.title}</div>
              <div className="ml-4 space-y-1">
                {item.children.map((child: any) => (
                  <Button
                    key={child.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setActiveView(child.id)}
                  >
                    {child.icon && <child.icon className="h-4 w-4 mr-2" />}
                    {child.title}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => setActiveView(item.id)}
            >
              {item.icon && <item.icon className="h-4 w-4 mr-2" />}
              {item.title}
            </Button>
          )}
        </div>
      ))}
    </nav>
  );

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
