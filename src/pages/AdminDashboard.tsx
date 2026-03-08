import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogPostsView from '@/components/admin/views/BlogPostsView';
import BlogTestingView from '@/components/admin/views/BlogTestingView';
import KIBlogCreatorView from '@/components/admin/views/KIBlogCreatorView';
import BlogPodcastView from '@/components/admin/views/BlogPodcastView';
import ContentStrategyView from '@/components/admin/views/ContentStrategyView';
import ScheduledJobsView from '@/components/admin/views/ScheduledJobsView';
import { AutomationMonitoringView } from '@/components/admin/views/AutomationMonitoringView';
import AudioSidebarView from '@/components/admin/views/AudioSidebarView';
import SowingCalendarManager from '@/components/admin/SowingCalendarManager';
import AdminDashboardView from '@/components/admin/views/AdminDashboardView';
import NewsletterView from '@/components/admin/views/NewsletterView';
import SettingsView from '@/components/admin/views/SettingsView';
import AdminLayout from '@/components/admin/AdminLayout';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Zugriff verweigert</h1>
          <p className="text-muted-foreground">Du hast keine Berechtigung für das Admin-Panel.</p>
          <button onClick={() => navigate('/')} className="text-primary underline">Zurück zur Startseite</button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <AdminDashboardView />;
      case 'blog-posts':
        return <BlogPostsView />;
      case 'ki-blog-creator':
        return <KIBlogCreatorView />;
      case 'blog-podcasts':
        return <BlogPodcastView />;
      case 'blog-testing':
        return <BlogTestingView />;
      case 'content-strategy':
        return <ContentStrategyView />;
      case 'scheduled-jobs':
        return <ScheduledJobsView />;
      case 'automation-monitor':
        return <AutomationMonitoringView />;
      case 'audio-generator':
        return <AudioSidebarView />;
      case 'sowing-calendar':
        return <SowingCalendarManager />;
      case 'newsletter':
        return <NewsletterView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <AdminDashboardView />;
    }
  };

  return (
    <AdminLayout activeView={activeView} onViewChange={setActiveView}>
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;
