
import { 
  FileText, 
  Users, 
  Settings, 
  BarChart3, 
  Calendar,
  Shield,
  Cpu,
  Bot,
  TestTube,
  TrendingUp,
  ChefHat,
  PenTool
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
    group: "Content Intelligence",
    items: [
      { key: "content-strategy", label: "Content-Strategie", icon: TrendingUp }
    ]
  },
  {
    group: "Tools & Analytics",
    items: [
      { key: "sowing-calendar", label: "Aussaat-Kalender", icon: Calendar },
      { key: "security-log", label: "Sicherheits-Log", icon: Shield }
    ]
  },
  {
    group: "Entwicklung",
    items: [
      { key: "phase2-dashboard", label: "Phase 2 Dashboard", icon: Cpu },
      { key: "phase3-dashboard", label: "Phase 3 Dashboard", icon: BarChart3 },
      { key: "blog-test-dashboard", label: "Blog-System-Tests", icon: TestTube }
    ]
  }
];
