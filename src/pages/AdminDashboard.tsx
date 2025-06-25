
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import BlogPostsView from '@/components/admin/views/BlogPostsView';
import BlogTestingView from '@/components/admin/views/BlogTestingView';
import KIBlogCreatorView from '@/components/admin/views/KIBlogCreatorView';
import BlogPodcastView from '@/components/admin/views/BlogPodcastView';
import AdminLayout from '@/components/admin/AdminLayout';

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activeView={activeView} onViewChange={setActiveView}>
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;
