
import {
  FileText,
  Users,
  Calendar,
  Shield,
  Bot,
  TrendingUp,
  ChefHat,
  PenTool,
  Zap,
  Brain,
  Workflow
} from "lucide-react";
import { AdminView } from "@/types/admin";

export interface MenuGroup {
  group: string;
  items: MenuItem[];
}

export interface MenuItem {
  key: AdminView;
  label: string;
  icon: any;
}

export const menuItems: MenuGroup[] = [
  {
    group: "Verwaltung",
    items: [
      { key: "recipes", label: "Rezepte", icon: ChefHat },
      { key: "blog-posts", label: "Blog-Artikel", icon: FileText },
      { key: "users", label: "Nutzer", icon: Users }
    ]
  },
  {
    group: "KI-Assistenten",
    items: [
      { key: "ki-recipe", label: "KI-Rezept-Creator", icon: Bot },
      { key: "ki-blog", label: "KI-Blog-Creator", icon: PenTool }
    ]
  },
  {
    group: "Tools & Analyse",
    items: [
      { key: "content-strategy", label: "Content-Strategie", icon: TrendingUp },
      { key: "automatisierung", label: "Automatisierung", icon: Zap },
      { key: "sowing-calendar", label: "Aussaat-Kalender", icon: Calendar },
      { key: "security-log", label: "Sicherheits-Log", icon: Shield }
    ]
  },
  {
    group: "Dashboards",
    items: [
      { key: "phase2", label: "Content Hub", icon: Brain },
      { key: "phase3", label: "Automation Hub", icon: Workflow }
    ]
  }
];
