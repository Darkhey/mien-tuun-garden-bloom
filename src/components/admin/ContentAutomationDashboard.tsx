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
  PlusCircle
} from "lucide-react";
import { contentAutomationService, ContentAutomationConfig, ContentAutomationStats } from "@/services/ContentAutomationService";
import { useToast } from "@/hooks/use-toast";
import ContentAutomationWizard from "./ContentAutomationWizard";

const ContentAutomationDashboard: React.FC = () => {
  const [configurations, setConfigurations] = useState<ContentAutomationConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<ContentAutomationConfig | null>(null);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const { toast } = useToast();

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

  const getMotivationalMessage = (stats: ContentAutomationStats) => {
    return contentAutomationService.getMotivationalMessage(stats);
  };

  const getImprovementSuggestions = (stats: ContentAutomationStats) => {
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
        {/* Configurations List */}
        <div className="lg:col-span-1 space-y-4">
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

        {/* Configuration Details */}
        <div className="lg:col-span-2">
          {selectedConfig ? (
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Übersicht</TabsTrigger>
                <TabsTrigger value="stats">Statistiken</TabsTrigger>
                <TabsTrigger value="settings">Einstellungen</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
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
                
                {/* Categories Overview */}
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
              </TabsContent>

              <TabsContent value="stats" className="space-y-4 mt-4">
                {selectedConfig.stats ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance-Übersicht</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <div className="text-sm text-gray-500">Erfolgsrate</div>
                            <div className="flex items-center gap-2">
                              <Progress value={selectedConfig.stats.success_rate} className="h-2" />
                              <span className="text-sm font-medium">{selectedConfig.stats.success_rate}%</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm text-gray-500">Qualitätsscore</div>
                            <div className="flex items-center gap-2">
                              <Progress value={selectedConfig.stats.avg_quality_score} className="h-2" />
                              <span className="text-sm font-medium">{selectedConfig.stats.avg_quality_score}%</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm text-gray-500">Engagement-Rate</div>
                            <div className="flex items-center gap-2">
                              <Progress value={selectedConfig.stats.engagement_rate} className="h-2" />
                              <span className="text-sm font-medium">{selectedConfig.stats.engagement_rate}%</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm text-gray-500">Top-Kategorie</div>
                            <div className="font-medium">
                              {selectedConfig.stats.top_performing_category || "Keine Daten"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Content by Category */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Inhalte nach Kategorie</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {Object.keys(selectedConfig.stats.content_by_category).length > 0 ? (
                          <div className="space-y-4">
                            {Object.entries(selectedConfig.stats.content_by_category).map(([category, count]) => (
                              <div key={category} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span>{category}</span>
                                  <span>{count}</span>
                                </div>
                                <Progress 
                                  value={(count as number) / Math.max(...Object.values(selectedConfig.stats.content_by_category) as number[]) * 100} 
                                  className="h-2" 
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            Noch keine Inhalte erstellt
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* Recent Content */}
                    {selectedConfig.stats.recent_content?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Kürzlich erstellte Inhalte</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedConfig.stats.recent_content.map((content: any) => (
                              <div key={content.id} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                  <div className="font-medium">{content.title || content.id}</div>
                                  <div className="text-xs text-gray-500">
                                    {formatDate(content.created_at)}
                                  </div>
                                </div>
                                <Badge variant={content.status === 'veröffentlicht' ? 'default' : 'outline'}>
                                  {content.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Keine Statistiken verfügbar</h3>
                      <p className="text-gray-500">
                        Für diese Konfiguration sind noch keine Statistiken verfügbar.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Konfigurationsdetails</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Zeitplanung</h3>
                        <div className="mt-1 text-sm">
                          <div><strong>Intervall:</strong> {selectedConfig.config?.publishing?.interval || 'Täglich'}</div>
                          <div><strong>Zeit:</strong> {selectedConfig.config?.publishing?.time || 'Morgens'}</div>
                          <div><strong>Max. Posts:</strong> {selectedConfig.config?.publishing?.max_posts_per_time_unit || '1'}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Veröffentlichung</h3>
                        <div className="mt-1 text-sm">
                          <div>
                            <strong>Sofortveröffentlichung:</strong> {selectedConfig.config?.approval?.immediate_publishing ? 'Ja' : 'Nein'}
                          </div>
                          {!selectedConfig.config?.approval?.immediate_publishing && (
                            <>
                              <div><strong>Moderatoren:</strong> {selectedConfig.config?.approval?.moderators?.length || '0'}</div>
                              <div><strong>Max. Wartezeit:</strong> {selectedConfig.config?.approval?.max_waiting_time || 'N/A'}</div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Bildmaterial</h3>
                        <div className="mt-1 text-sm">
                          <div><strong>Quelle:</strong> {selectedConfig.config?.images?.source === 'ai' ? 'KI-generiert' : 'Stock-Fotos'}</div>
                          <div><strong>Stil:</strong> {selectedConfig.config?.images?.style || 'Standard'}</div>
                          <div>
                            <strong>Format:</strong> {selectedConfig.config?.images?.guidelines?.width || '1200'}x{selectedConfig.config?.images?.guidelines?.height || '800'} {selectedConfig.config?.images?.guidelines?.format || 'jpg'}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Textparameter</h3>
                        <div className="mt-1 text-sm">
                          <div><strong>Wortanzahl:</strong> {selectedConfig.config?.text?.min_word_count || '500'}-{selectedConfig.config?.text?.max_word_count || '1500'}</div>
                          <div><strong>Keywords pro Post:</strong> {selectedConfig.config?.text?.keywords_per_post || '5'}</div>
                          <div><strong>Schreibstil:</strong> {selectedConfig.config?.text?.writing_style?.substring(0, 50) || 'Standard'}...</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* YAML Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>YAML-Konfiguration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <pre className="text-xs overflow-auto whitespace-pre-wrap max-h-[300px]">
                        {selectedConfig.yaml_config || JSON.stringify(selectedConfig.config, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
        </div>
      </div>
    </div>
  );
};

export default ContentAutomationDashboard;