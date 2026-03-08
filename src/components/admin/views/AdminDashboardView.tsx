import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ChefHat, Mail, Activity, Star, Shield } from "lucide-react";
import { adminStatsService } from "@/services/AdminStatsService";

const AdminDashboardView: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [blogCount, qualityScore, recipeCount, recipeRating, securityWarnings, automation, newsletter] = await Promise.all([
        adminStatsService.getTodayBlogPostCount(),
        adminStatsService.getAverageBlogQualityScore(),
        adminStatsService.getTodayRecipeCount(),
        adminStatsService.getAverageRecipeRating(),
        adminStatsService.getTodaySecurityWarningCount(),
        adminStatsService.getAutomationStats(),
        adminStatsService.getNewsletterStats(),
      ]);
      return { blogCount, qualityScore, recipeCount, recipeRating, securityWarnings, automation, newsletter };
    },
    refetchInterval: 60000,
  });

  const cards = [
    { title: "Blog-Posts heute", value: stats?.blogCount ?? "–", icon: FileText, color: "text-blue-600" },
    { title: "Ø Quality Score", value: stats?.qualityScore ?? "–", icon: Star, color: "text-yellow-600" },
    { title: "Rezepte heute", value: stats?.recipeCount ?? "–", icon: ChefHat, color: "text-green-600" },
    { title: "Ø Rezept-Bewertung", value: stats?.recipeRating ?? "–", icon: Star, color: "text-orange-600" },
    { title: "Newsletter Abonnenten", value: stats?.newsletter?.confirmed ?? "–", icon: Mail, color: "text-purple-600" },
    { title: "Sicherheitswarnungen", value: stats?.securityWarnings ?? "–", icon: Shield, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Übersicht über dein Admin-Panel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4 flex items-center gap-4">
              <card.icon className={`h-8 w-8 ${card.color}`} />
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold">{isLoading ? "…" : card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats?.automation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Automatisierung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{stats.automation.activeWorkflows}</p>
                <p className="text-sm text-muted-foreground">Aktive Workflows</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.automation.executionsToday}</p>
                <p className="text-sm text-muted-foreground">Ausführungen heute</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.automation.successRate}%</p>
                <p className="text-sm text-muted-foreground">Erfolgsrate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboardView;
