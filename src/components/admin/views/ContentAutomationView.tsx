import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Settings, FileText, Calendar, Image, CheckSquare, BarChart } from "lucide-react";
import ContentAutomationWizard from "../ContentAutomationWizard";

const ContentAutomationView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Zap className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content-Automatisierung</h1>
          <p className="text-gray-600">Konfiguriere die automatische Erstellung von Inhalten</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Themenauswahl</p>
                <p className="text-lg font-semibold">Kategorie & Tags</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Zeitplanung</p>
                <p className="text-lg font-semibold">Intervalle & Timing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Konfiguration</p>
                <p className="text-lg font-semibold">Umfassende Einstellungen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="wizard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wizard" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Einrichtungsassistent
          </TabsTrigger>
          <TabsTrigger value="yaml" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            YAML-Konfiguration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wizard" className="mt-6">
          <ContentAutomationWizard />
        </TabsContent>

        <TabsContent value="yaml" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                YAML-Konfiguration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Hier kannst du die YAML-Konfiguration für die Content-Automatisierung direkt bearbeiten.
                Verwende den Einrichtungsassistenten, um eine neue Konfiguration zu erstellen.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                  # Content Automation Configuration
                  # Erstellt am: 2025-06-19T10:00:00.000Z
                  
                  # 1. Themenauswahl
                  categories:
                    - gartenplanung: A
                    - saisonale-kueche: B
                    - nachhaltigkeit: A
                  
                  category_tags:
                    gartenplanung:
                      - Permakultur
                      - No-Dig
                      - Biogarten
                      - Hochbeet
                      - Mischkultur
                    saisonale-kueche:
                      - Meal Prep
                      - Zero Waste
                      - Fermentieren
                      - One Pot
                      - Regional
                    nachhaltigkeit:
                      - Plastikfrei
                      - Regenerativ
                      - Naturgarten
                      - Kreislaufwirtschaft
                      - Upcycling
                  
                  # 2. Zeitplanung
                  publishing:
                    interval: daily
                    time: morning
                    max_posts_per_day: 2
                    pause_between_posts: 4h
                  
                  # 3. Veröffentlichungseinstellungen
                  approval:
                    immediate_publishing: false
                    moderators:
                      - admin-user-id-1
                      - admin-user-id-2
                    criteria:
                      - spelling
                      - relevance
                      - seo
                    max_waiting_time: 24h
                  
                  # 4. Bildmaterial-Konfiguration
                  images:
                    source: ai
                    style: realistic
                    guidelines:
                      width: 1200
                      height: 800
                      format: jpg
                      quality: 80
                  
                  # 5. Textparameter
                  text:
                    min_word_count: 500
                    max_word_count: 1500
                    writing_style: "Informativ und freundlich, wie von Marianne, einer 50-jährigen ostfriesischen Gärtnerin"
                    keywords_per_post: 5
                    seo_guidelines: "Titel mit Keywords, Meta-Beschreibung mit Call-to-Action, Zwischenüberschriften alle 300 Wörter"
                  
                  # 6. Testumgebung
                  testing:
                    scenarios:
                      - Saisonaler Gartenartikel
                      - Rezept mit regionalen Zutaten
                      - DIY-Projekt für Anfänger
                    quality_criteria:
                      - spelling
                      - originality
                      - relevance
                      - structure
                      - seo
                    ab_testing: false
                    performance_indicators:
                      - views
                      - engagement
                      - conversion
                  
                  # 7. Logging-System
                  logging:
                    creation_time: true
                    resources: true
                    errors: true
                    performance_reports: true
                    user_interactions: false
                    success_metrics:
                      - views
                      - comments
                      - shares
                  
                  # 8. Automatisierte Überprüfungen
                  checks:
                    spelling: true
                    plagiarism: true
                    image_quality: true
                    seo: true
                    content_guidelines: true
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentAutomationView;