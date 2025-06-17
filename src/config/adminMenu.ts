
import { 
  Settings, 
  FileText, 
  ChefHat, 
  Users, 
  Calendar, 
  Zap, 
  Shield, 
  BarChart3, 
  Brain,
  TestTube,
  Activity
} from "lucide-react";

export interface AdminMenuItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  description?: string;
  badge?: string;
  children?: AdminMenuItem[];
}

export const adminMenuItems: AdminMenuItem[] = [
  {
    id: "content",
    label: "Content Management",
    icon: FileText,
    path: "/admin",
    children: [
      {
        id: "blog-posts",
        label: "Blog Posts",
        icon: FileText,
        path: "/admin/blog-posts",
        description: "Verwalte Blog-Artikel"
      },
      {
        id: "ki-blog-creator",
        label: "KI Blog Creator",
        icon: Brain,
        path: "/admin/ki-blog-creator",
        description: "Erstelle Artikel mit KI"
      },
      {
        id: "recipes", 
        label: "Rezepte",
        icon: ChefHat,
        path: "/admin/recipes",
        description: "Verwalte Rezepte"
      },
      {
        id: "ki-recipe-creator",
        label: "KI Rezept Creator",
        icon: Brain,
        path: "/admin/ki-recipe-creator", 
        description: "Erstelle Rezepte mit KI"
      }
    ]
  },
  {
    id: "content-strategy",
    label: "Content Strategy",
    icon: BarChart3,
    path: "/admin/content-strategy",
    description: "Content-Strategien und Analytics"
  },
  {
    id: "automatisierung",
    label: "Automatisierung",
    icon: Zap,
    path: "/admin/automatisierung",
    description: "Automatisierte Workflows"
  },
  {
    id: "system",
    label: "System & Monitoring",
    icon: Settings,
    path: "/admin",
    children: [
      {
        id: "users",
        label: "Benutzerverwaltung",
        icon: Users,
        path: "/admin/users",
        description: "Verwalte Benutzer und Rollen"
      },
      {
        id: "sowing-calendar",
        label: "Aussaatkalender",
        icon: Calendar,
        path: "/admin/sowing-calendar",
        description: "Verwalte Aussaatzeiten"
      },
      {
        id: "blog-testing",
        label: "Blog System Tests",
        icon: TestTube,
        path: "/admin/blog-testing",
        description: "Teste Blog-Funktionalitäten"
      },
      {
        id: "system-diagnostics",
        label: "System Diagnostics",
        icon: Activity,
        path: "/admin/system-diagnostics",
        description: "KI-System Performance Analyse"
      },
      {
        id: "security-log",
        label: "Security Log",
        icon: Shield,
        path: "/admin/security-log",
        description: "Sicherheitsereignisse"
      }
    ]
  }
];
