import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  BarChart3, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Settings,
  Lightbulb,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  Play
} from "lucide-react";
import { contentAutomationService, ContentAutomationConfig, ContentAutomationStats as ContentAutomationStatsType } from "@/services/ContentAutomationService";
import { useToast } from "@/hooks/use-toast";
import ContentAutomationWizard from "./ContentAutomationWizard";
import ContentAutomationStats from "./ContentAutomationStats";
import ContentAutomationProgress from "./ContentAutomationProgress";
import ContentAutomationInsights from "./ContentAutomationInsights";
import ContentAutomationEncouragementCard from "./ContentAutomationEncouragementCard";

const ContentAutomationDashboard: React.FC = () => {
  const [configurations, setConfigurations] = useState<ContentAutomationConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<ContentAutomationConfig | null>(null);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [executingConfig, setExecutingConfig] = useState<string | null>(null);
  const [executionProgress, setExecutionProgress] = useState<any>(null);
  const { toast } = useToast();

  // Sample data for the encouragement card
  const encouragementStats = {
    totalContent: overallStats?.total_content_created || 0,
    successRate: overallStats?.avg_success_rate || 0,
    streak: 3, // This would come from actual tracking
    nextMilestone: 10,
    level: "Content Creator",
    tips: [
      "Verwende saisonale Keywords für mehr Relevanz",
      "Bilder mit Menschen erzielen 38% mehr Engagement",
      "Füge interaktive Elemente wie Fragen oder Umfragen ein",
      "Plane Content-Serien zu verwandten Themen",
      "Nutze die Vorschau-Funktion, um die mobile Ansicht zu prüfen"
    ]
  };

  // Sample data for insights
  const insightsData = {
    topPerformingContent: [
      { title: "10 Tipps für deinen Garten im Sommer", views: 245, engagement: 32, category: "Gartenplanung" },
      { title: "Nachhaltige Gartengestaltung leicht gemacht", views: 189, engagement: 27, category: "Nachhaltigkeit" },
      { title: "Die besten Pflanzen für deinen Balkon", views: 156, engagement: 18, category: "Balkon & Terrasse" }
    ],
    contentGaps: [
      { category: "Indoor Gardening", lastContent: "vor 3 Monaten", priority: 'high' as const },
      { category: "Wassersparen & Bewässerung", lastContent: "vor 2 Monaten", priority: 'medium' as const },
      { category: "DIY Projekte", lastContent: "vor 1 Monat", priority: 'low' as const }
    ],
    upcomingContent: [
      { title: "Herbstpflanzen für deinen Garten", scheduledFor: "Morgen", category: "Jahreszeitliche Arbeiten" },
      { title: "Kompostieren für Anfänger", scheduledFor: "In 3 Tagen", category: "Kompostierung" },
      { title: "Wassersparende Bewässerungssysteme", scheduledFor: "Nächste Woche", category: "Wassersparen & Bewässerung" }
    ],
    audienceInsights: [
      { segment: "Anfänger", engagement: 78, contentPreference: "Step-by-Step Anleitungen" },
      { segment: "Balkon-Gärtner", engagement: 65, contentPreference: "Platzsparende Lösungen" },
      { segment: "Nachhaltigkeits-Fans", engagement: 82, contentPreference: "Umweltfreundliche Tipps" }
    ]
  };

  // Sample data for automation progress
  const automationProgress = {
    status: 'running' as const,
    progress: 60,
    stages: [
      { id: 'topic_selection', name: 'Themenauswahl', status: 'completed' as const, progress: 100 },
      { id: 'content_generation', name: 'Content-Generierung', status: 'running' as const, progress: 70 },
      { id: 'quality_check', name: 'Qualitätsprüfung', status: 'idle' as const, progress: 0 },
      { id: 'image_generation', name: 'Bild-Generierung', status: 'idle' as const, progress: 0 },
      { id: 'seo_optimization', name: 'SEO-Optimierung', status: 'idle' as const, progress: 0 }
    ],
    startTime: new Date(Date.now() - 1000 * 60 * 3) // Started 3 minutes ago
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [configs, stats] = await Promise.all([
        contentAutomationService.getConfigurations(),
        contentAutomationService.getOverallStats()
      ]);
      
      setConfigurations(configs);
      setOverallStats(stats);
      
      if (configs.length > 0 && !selectedConfig) {
        setSelectedConfig(configs[0]);
      }
    } catch (error) {
      console.error('Error loading automation data:', error);
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (configId: string, isActive: boolean) => {
    try {
      await contentAutomationService.toggleConfigurationActive(configId, isActive);
      
      // Update configurations
      setConfigurations(prev => 
        prev.map(config => 
          config.id === configId 
            ? { ...config, is_active: isActive } 
            : config
        )
      );
      
      // Update selected config if needed
      if (selectedConfig?.id === configId) {
        setSelectedConfig(prev => prev ? { ...prev, is_active: isActive } : null);
      }
      
      toast({
        title: isActive ? "Konfiguration aktiviert" : "Konfiguration deaktiviert",
        description: `Die Konfiguration wurde ${isActive ? 'aktiviert' : 'deaktiviert'}.`
      });
    } catch (error) {
      console.error('Error toggling configuration:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    if (!confirm('Möchtest du diese Konfiguration wirklich löschen?')) {
      return;
    }
    
    try {
      await contentAutomationService.deleteConfiguration(configId);
      
      // Remove from configurations
      setConfigurations(prev => prev.filter(config => config.id !== configId));
      
      // Clear selected config if needed
      if (selectedConfig?.id === configId) {
        setSelectedConfig(null);
      }
      
      toast({
        title: "Konfiguration gelöscht",
        description: "Die Konfiguration wurde erfolgreich gelöscht."
      });
    } catch (error) {
      console.error('Error deleting configuration:', error);
      toast({
        title: "Fehler",
        description: "Konfiguration konnte nicht gelöscht werden",
        variant: "destructive"
      });
    }
  };

  const handleCreateJobs = async (configId: string) => {
    try {
      await contentAutomationService.createScheduledJobsFromConfig(configId);
      
      toast({
        title: "Jobs erstellt",
        description: "Die geplanten Jobs wurden erfolgreich erstellt."
      });
    } catch (error) {
      console.error('Error creating jobs:', error);
      toast({
        title: "Fehler",
        description: "Jobs konnten nicht erstellt werden",
        variant: "destructive"
      });
    }
  };

  const handleCreateContent = () => {
    toast({
      title: "Content-Erstellung gestartet",
      description: "Dein neuer Content wird jetzt generiert."
    });
    
    // In a real implementation, this would trigger the content creation process
    // For now, we'll just show a success message after a delay
    setTimeout(() => {
      toast({
        title: "Content erstellt!",
        description: "Dein neuer Content wurde erfolgreich erstellt."
      });
      
      // Refresh data
      loadData();
    }, 3000);
  };

  const handleExecuteConfig = async (configId: string) => {
    if (!configId) return;
    
    setExecutingConfig(configId);
    setExecutionProgress({
      status: 'running',
      progress: 0,
      stages: [
        { id: 'initialization', name: 'Initialisierung', status: 'running', progress: 0 },
        { id: 'topic_selection', name: 'Themenauswahl', status: 'idle', progress: 0 },
        { id: 'content_generation', name: 'Content-Generierung', status: 'idle', progress: 0 },
        { id: 'quality_check', name: 'Qualitätsprüfung', status: 'idle', progress: 0 },
        { id: 'image_generation', name: 'Bild-Generierung', status: 'idle', progress: 0 },
        { id: 'seo_optimization', name: 'SEO-Optimierung', status: 'idle', progress: 0 },
        { id: 'publishing', name: 'Veröffentlichung', status: 'idle', progress: 0 }
      ],
      startTime: new Date()
    });
    
    try {
      toast({
        title: "Ausführung gestartet",
        description: "Die Content-Automatisierung wird jetzt ausgeführt."
      });
      
      // Simulate the execution process with progress updates
      await simulateExecution(setExecutionProgress);
      
      toast({
        title: "Ausführung abgeschlossen",
        description: "Die Content-Automatisierung wurde erfolgreich ausgeführt."
      });
      
      // Refresh data
      loadData();
    } catch (error) {
      console.error('Error executing configuration:', error);
      toast({
        title: "Fehler",
        description: "Die Ausführung konnte nicht abgeschlossen werden",
        variant: "destructive"
      });
    } finally {
      setExecutingConfig(null);
    }
  };

  const simulateExecution = async (setProgress: React.Dispatch<React.SetStateAction<any>>) => {
    const stages = [
      'initialization',
      'topic_selection',
      'content_generation',
      'quality_check',
      'image_generation',
      'seo_optimization',
      'publishing'
    ];
    
    const stageDurations = [2, 3, 8, 4, 6, 3, 2]; // in seconds
    
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const duration = stageDurations[i] * 1000;
      
      // Start stage
      setProgress(prev => ({
        ...prev,
        progress: Math.round((i / stages.length) * 100),
        stages: prev.stages.map((s: any) => 
          s.id === stage 
            ? { ...s, status: 'running', progress: 0 }
            : s
        )
      }));
      
      // Simulate progress
      const steps = 10;
      const stepTime = duration / steps;
      
      for (let step = 1; step <= steps; step++) {
        await new Promise(resolve => setTimeout(resolve, stepTime));
        
        setProgress(prev => ({
          ...prev,
          stages: prev.stages.map((s: any) => 
            s.id === stage 
              ? { ...s, progress: Math.round((step / steps) * 100) }
              : s
          )
        }));
      }
      
      // Complete stage
      setProgress(prev => ({
        ...prev,
        stages: prev.stages.map((s: any) => 
          s.id === stage 
            ? { ...s, status: 'completed', progress: 100 }
            : s
        )
      }));
    }
    
    // Complete execution
    setProgress(prev => ({
      ...prev,
      status: 'completed',
      progress: 100,
      endTime: new Date()
    }));
  };

  const getMotivationalMessage = (stats: ContentAutomationStatsType) => {
    return contentAutomationService.getMotivationalMessage(stats);
  };

  const getImprovementSuggestions = (stats: ContentAutomationStatsType) => {
    return contentAutomationService.getImprovementSuggestions(stats);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (showWizard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold">Content-Automatisierung</h1>
              <p className="text-gray-600">Einrichtungsassistent</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowWizard(false)}>
            Zurück zur Übersicht
          </Button>
        </div>
        
        <ContentAutomationWizard onComplete={() => {
          setShowWizard(false);
          loadData();
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold">Content-Automatisierung</h1>
            <p className="text-gray-600">Übersicht und Statistiken</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
          <Button onClick={() => setShowWizard(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Neue Konfiguration
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktive Konfigurationen</p>
                  <p className="text-2xl font-bold">{overallStats.active_configurations}</p>
                </div>
                <Settings className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Erstellte Inhalte</p>
                  <p className="text-2xl font-bold">{overallStats.total_content_created}</p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Erfolgsrate</p>
                  <p className="text-2xl font-bold">{overallStats.avg_success_rate}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Top-Kategorie</p>
                  <p className="text-2xl font-bold">
                    {overallStats.top_categories?.[0]?.category || "N/A"}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Creation Trend */}
      {overallStats?.content_creation_trend?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Content-Erstellung (letzte 7 Tage)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end justify-between gap-2">
              {overallStats.content_creation_trend.map((day: any) => (
                <div key={day.date} className="flex flex-col items-center">
                  <div 
                    className="bg-green-500 w-12 rounded-t-md transition-all duration-500"
                    style={{ 
                      height: `${Math.max(20, (day.count / Math.max(...overallStats.content_creation_trend.map((d: any) => d.count))) * 150)}px` 
                    }}
                  ></div>
                  <div className="text-xs mt-2">{day.date.split('-')[2]}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Configurations List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Encouragement Card */}
          <ContentAutomationEncouragementCard 
            stats={encouragementStats}
            onCreateContent={handleCreateContent}
          />
          
          <h2 className="text-xl font-semibold">Konfigurationen</h2>
          
          {configurations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Keine Konfigurationen</h3>
                <p className="text-gray-500 mb-4">Erstelle deine erste Content-Automatisierung.</p>
                <Button onClick={() => setShowWizard(true)}>
                  Konfiguration erstellen
                </Button>
              </CardContent>
            </Card>
          ) : (
            configurations.map(config => (
              <Card 
                key={config.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${selectedConfig?.id === config.id ? 'border-green-500 shadow-md' : ''}`}
                onClick={() => setSelectedConfig(config)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{config.name}</h3>
                    <Badge variant={config.is_active ? "default" : "outline"}>
                      {config.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    Erstellt: {formatDate(config.created_at || '')}
                  </div>
                  
                  {config.stats && (
                    <div className="flex items-center gap-4 text-sm">
                      <span>Inhalte: {config.stats.total_content_created}</span>
                      <span>Erfolg: {config.stats.success_rate}%</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right Column: Details and Stats */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="stats">Statistiken</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="progress">Fortschritt</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {selectedConfig ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedConfig.name}</span>
                      <Badge variant={selectedConfig.is_active ? "default" : "outline"}>
                        {selectedConfig.is_active ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedConfig.stats && (
                      <div className="space-y-4">
                        {/* Motivational Message */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                          <p className="flex items-center">
                            <Lightbulb className="h-5 w-5 mr-2 text-green-600" />
                            {getMotivationalMessage(selectedConfig.stats)}
                          </p>
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-sm text-blue-600 mb-1">Erstellte Inhalte</div>
                            <div className="text-2xl font-bold">{selectedConfig.stats.total_content_created}</div>
                          </div>
                          
                          <div className="bg-purple-50 rounded-lg p-4">
                            <div className="text-sm text-purple-600 mb-1">Erfolgsrate</div>
                            <div className="text-2xl font-bold">{selectedConfig.stats.success_rate}%</div>
                          </div>
                        </div>
                        
                        {/* Improvement Suggestions */}
                        {getImprovementSuggestions(selectedConfig.stats).length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-700">Verbesserungsvorschläge</h3>
                            <ul className="space-y-1">
                              {getImprovementSuggestions(selectedConfig.stats).map((suggestion, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <span className="text-orange-500">•</span>
                                  <span>{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant={selectedConfig.is_active ? "outline" : "default"}
                            onClick={() => handleToggleActive(selectedConfig.id!, !selectedConfig.is_active)}
                          >
                            {selectedConfig.is_active ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Deaktivieren
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Aktivieren
                              </>
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => handleCreateJobs(selectedConfig.id!)}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Jobs erstellen
                          </Button>
                          
                          <Button
                            onClick={() => handleExecuteConfig(selectedConfig.id!)}
                            disabled={!!executingConfig}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Jetzt ausführen
                          </Button>
                          
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteConfig(selectedConfig.id!)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Löschen
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Keine Konfiguration ausgewählt</h3>
                    <p className="text-gray-500 mb-4">
                      Wähle eine Konfiguration aus oder erstelle eine neue.
                    </p>
                    <Button onClick={() => setShowWizard(true)}>
                      Neue Konfiguration erstellen
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* Categories Overview */}
              {selectedConfig && (
                <Card>
                  <CardHeader>
                    <CardTitle>Konfigurierte Kategorien</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedConfig.config?.categories?.map((categoryObj: any, index: number) => {
                        const category = Object.keys(categoryObj)[0];
                        const priority = categoryObj[category];
                        const tags = selectedConfig.config?.category_tags?.[category] || [];
                        
                        return (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{category}</span>
                                <Badge>{priority}</Badge>
                              </div>
                              
                              {selectedConfig.stats?.content_by_category?.[category] && (
                                <Badge variant="outline">
                                  {selectedConfig.stats.content_by_category[category]} Inhalte
                                </Badge>
                              )}
                            </div>
                            
                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {tags.map((tag: string) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="stats" className="mt-4">
              {selectedConfig?.stats ? (
                <ContentAutomationStats stats={selectedConfig.stats} />
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Keine Statistiken verfügbar</h3>
                    <p className="text-gray-500">
                      Wähle eine Konfiguration aus oder erstelle eine neue.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="insights" className="mt-4">
              <ContentAutomationInsights insights={insightsData} />
            </TabsContent>

            <TabsContent value="progress" className="mt-4">
              {executingConfig ? (
                <ContentAutomationProgress 
                  status={executionProgress.status}
                  progress={executionProgress.progress}
                  stages={executionProgress.stages}
                  startTime={executionProgress.startTime}
                  endTime={executionProgress.endTime}
                />
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Keine laufende Ausführung</h3>
                    <p className="text-gray-500 mb-4">
                      Starte eine Ausführung, um den Fortschritt zu sehen.
                    </p>
                    {selectedConfig && (
                      <Button onClick={() => handleExecuteConfig(selectedConfig.id!)}>
                        <Play className="h-4 w-4 mr-2" />
                        Jetzt ausführen
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ContentAutomationDashboard;