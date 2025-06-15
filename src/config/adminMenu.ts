
import { BookOpen, FileText, Users, Sparkles, Calendar, Shield, Brain, Zap, TestTube } from "lucide-react";
import { AdminView } from "@/types/admin";

export const menuItems: { group: string; items: { key: AdminView; label: string; icon: React.ElementType }[] }[] = [
  {
    group: "Verwaltung",
    items: [
      { key: "recipes", label: "Rezepte", icon: BookOpen },
      { key: "blog-posts", label: "Blog-Artikel", icon: FileText },
      { key: "users", label: "Nutzer", icon: Users },
    ],
  },
  {
    group: "KI-Tools",
    items: [
      { key: "ki-recipe", label: "KI-Rezept erstellen", icon: Sparkles },
      { key: "ki-blog", label: "KI-Artikel erstellen", icon: Sparkles },
    ],
  },
  {
    group: "Intelligence & Automation",
    items: [
      { key: "phase2-dashboard", label: "Content Intelligence", icon: Brain },
      { key: "phase3-dashboard", label: "Automation & Workflows", icon: Zap },
    ],
  },
  {
    group: "Weitere Tools",
    items: [
      { key: "sowing-calendar", label: "Aussaatkalender", icon: Calendar },
      { key: "security-log", label: "Sicherheits-Log", icon: Shield },
      { key: "blog-test-dashboard", label: "Blog-System-Tests", icon: TestTube },
    ],
  },
];
