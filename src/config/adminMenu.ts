
import {
  BookOpen,
  Calendar,
  FileText,
  Home,
  Settings,
  Users,
  Brain,
  Mic,
  TestTube,
  TrendingUp,
  Clock
} from 'lucide-react';

export interface AdminMenuItem {
  id: string;
  title: string;
  path?: string;
  icon?: any;
  children?: AdminMenuItem[];
}

export const adminMenuItems: AdminMenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/admin',
    icon: Home
  },
  {
    id: 'blog',
    title: 'Blog-Verwaltung',
    icon: BookOpen,
    children: [
      {
        id: 'blog-posts',
        title: 'Blog-Posts',
        icon: FileText,
        path: '/admin/blog-posts'
      },
      {
        id: 'ki-blog-creator',
        title: 'KI Blog Creator',
        icon: Brain,
        path: '/admin/ki-blog-creator'
      },
      {
        id: 'blog-podcasts',
        title: 'Podcast-Manager',
        icon: Mic,
        path: '/admin/blog-podcasts'
      },
      {
        id: 'blog-testing',
        title: 'Blog Testing',
        icon: TestTube,
        path: '/admin/blog-testing'
      }
    ]
  },
  {
    id: 'automation',
    title: 'Automatisierung',
    icon: Settings,
    children: [
      {
        id: 'content-strategy',
        title: 'Content-Strategie',
        icon: TrendingUp,
        path: '/admin/content-strategy'
      },
      {
        id: 'scheduled-jobs',
        title: 'Geplante Jobs',
        icon: Clock,
        path: '/admin/scheduled-jobs'
      }
    ]
  },
  {
    id: 'newsletter',
    title: 'Newsletter',
    icon: Users,
    path: '/admin/newsletter'
  },
  {
    id: 'events',
    title: 'Veranstaltungen',
    icon: Calendar,
    path: '/admin/events'
  },
  {
    id: 'settings',
    title: 'Einstellungen',
    icon: Settings,
    path: '/admin/settings'
  }
];
