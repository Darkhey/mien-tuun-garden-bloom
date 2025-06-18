import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Clock, 
  Settings, 
  Image, 
  CheckSquare, 
  BarChart, 
  AlertTriangle,
  Calendar,
  Check,
  ChevronRight,
  Download,
  Save,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { contentAutomationService } from "@/services/ContentAutomationService";
import { BLOG_CATEGORIES } from "./blogHelpers";
import TagSelector from "./TagSelector";

// YAML library
import { stringify } from "yaml";

const PRIORITY_LEVELS = [
  { value: "A", label: "Hohe Priorität" },
  { value: "B", label: "Mittlere Priorität" },
  { value: "C", label: "Niedrige Priorität" }
];

const PUBLISHING_INTERVALS = [
  { value: "hourly", label: "Stündlich" },
  { value: "daily", label: "Täglich" },
  { value: "weekly", label: "Wöchentlich" },
  { value: "biweekly", label: "Zweiwöchentlich" },
  { value: "monthly", label: "Monatlich" }
];

const PUBLISHING_TIMES = [
  { value: "morning", label: "Morgens (8-10 Uhr)" },
  { value: "noon", label: "Mittags (12-14 Uhr)" },
  { value: "afternoon", label: "Nachmittags (15-17 Uhr)" },
  { value: "evening", label: "Abends (19-21 Uhr)" }
];

const IMAGE_SOURCES = [
  { value: "stock", label: "Stock-Fotos" },
  { value: "ai", label: "KI-generierte Bilder" }
];

const IMAGE_STYLES = [
  { value: "realistic", label: "Realistisch" },
  { value: "artistic", label: "Künstlerisch" },
  { value: "minimalist", label: "Minimalistisch" },
  { value: "vintage", label: "Vintage" }
];

const QUALITY_CRITERIA = [
  "Rechtschreibung", "Grammatik", "Relevanz", "Originalität", 
  "Struktur", "SEO-Konformität", "Bildqualität", "Lesbarkeit"
];

interface ContentAutomationWizardProps {
  onComplete: () => void;
}

const ContentAutomationWizard: React.FC<ContentAutomationWizardProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [yamlOutput, setYamlOutput] = useState("");
  
  // Step 1: Themenauswahl
  const [configName, setConfigName] = useState("Content-Automatisierung");
  const [selectedCategories, setSelectedCategories] = useState<{[key: string]: string}>({});
  const [categoryTags, setCategoryTags] = useState<{[key: string]: string[]}>({});
  
  // Step 2: Zeitplanung
  const [publishingInterval, setPublishingInterval] = useState("daily");
  const [publishingTime, setPublishingTime] = useState("morning");
  const [maxPostsPerTimeUnit, setMaxPostsPerTimeUnit] = useState(2);
  const [pauseBetweenPosts, setPauseBetweenPosts] = useState(4);
  
  // Step 3: Veröffentlichungseinstellungen
  const [immediatePublishing, setImmediatePublishing] = useState(false);
  const [moderators, setModerators] = useState<string[]>([]);
  const [approvalCriteria, setApprovalCriteria] = useState<string[]>([]);
  const [maxWaitingTime, setMaxWaitingTime] = useState(24);
  
  // Step 4: Bildmaterial-Konfiguration
  const [imageSource, setImageSource] = useState("ai");
  const [imageStyle, setImageStyle] = useState("realistic");
  const [imageWidth, setImageWidth] = useState(1200);
  const [imageHeight, setImageHeight] = useState(800);
  const [imageFormat, setImageFormat] = useState("jpg");
  
  // Step 5: Textparameter
  const [minWordCount, setMinWordCount] = useState(500);
  const [maxWordCount, setMaxWordCount] = useState(1500);
  const [writingStyle, setWritingStyle] = useState("Informativ und freundlich, wie von Marianne, einer 50-jährigen ostfriesischen Gärtnerin");
  const [keywordsPerPost, setKeywordsPerPost] = useState(5);
  const [seoGuidelines, setSeoGuidelines] = useState("Titel mit Keywords, Meta-Beschreibung mit Call-to-Action, Zwischenüberschriften alle 300 Wörter");
  
  // Step 6: Testumgebung
  const [testScenarios, setTestScenarios] = useState<string[]>([
    "Saisonaler Gartenartikel",
    "Rezept mit regionalen Zutaten",
    "DIY-Projekt für Anfänger"
  ]);
  const [qualityCriteria, setQualityCriteria] = useState<string[]>([
    "Rechtschreibung", "Relevanz", "Struktur", "SEO-Konformität"
  ]);
  const [abTesting, setAbTesting] = useState(false);
  const [performanceIndicators, setPerformanceIndicators] = useState<string[]>([
    "views", "engagement", "conversion"
  ]);
  
  // Step 7: Logging-System
  const [logCreationTime, setLogCreationTime] = useState(true);
  const [logResources, setLogResources] = useState(true);
  const [logErrors, setLogErrors] = useState(true);
  const [logPerformance, setLogPerformance] = useState(true);
  const [logUserInteractions, setLogUserInteractions] = useState(false);
  const [successMetrics, setSuccessMetrics] = useState<string[]>([
    "views", "comments", "shares"
  ]);
  
  // Step 8: Automatisierte Überprüfungen
  const [checkSpelling, setCheckSpelling] = useState(true);
  const [checkPlagiarism, setCheckPlagiarism] = useState(true);
  const [checkImageQuality, setCheckImageQuality] = useState(true);
  const [checkSeo, setCheckSeo] = useState(true);
  const [checkContentGuidelines, setCheckContentGuidelines] = useState(true);

  const handleCategoryChange = (category: string, priority: string) => {
    setSelectedCategories(prev => {
      const newCategories = { ...prev };
      if (priority) {
        newCategories[category] = priority;
      } else {
        delete newCategories[category];
      }
      return newCategories;
    });
    
    // Initialize tags for this category if not already set
    if (!categoryTags[category] && priority) {
      setCategoryTags(prev => ({
        ...prev,
        [category]: []
      }));
    }
  };

  const handleCategoryTagsChange = (category: string, tags: string[]) => {
    setCategoryTags(prev => ({
      ...prev,
      [category]: tags
    }));
  };

  const nextStep = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const generateYamlConfig = () => {
    const config = {
      // Metadata
      name: configName,
      created_at: new Date().toISOString(),
      
      // 1. Themenauswahl
      categories: Object.entries(selectedCategories).map(([category, priority]) => ({ [category]: priority })),
      category_tags: categoryTags,
      
      // 2. Zeitplanung
      publishing: {
        interval: publishingInterval,
        time: publishingTime,
        max_posts_per_time_unit: maxPostsPerTimeUnit,
        pause_between_posts: `${pauseBetweenPosts}h`
      },
      
      // 3. Veröffentlichungseinstellungen
      approval: {
        immediate_publishing: immediatePublishing,
        moderators,
        criteria: approvalCriteria,
        max_waiting_time: `${maxWaitingTime}h`
      },
      
      // 4. Bildmaterial-Konfiguration
      images: {
        source: imageSource,
        style: imageStyle,
        guidelines: {
          width: imageWidth,
          height: imageHeight,
          format: imageFormat,
          quality: 80
        }
      },
      
      // 5. Textparameter
      text: {
        min_word_count: minWordCount,
        max_word_count: maxWordCount,
        writing_style: writingStyle,
        keywords_per_post: keywordsPerPost,
        seo_guidelines: seoGuidelines
      },
      
      // 6. Testumgebung
      testing: {
        scenarios: testScenarios,
        quality_criteria: qualityCriteria,
        ab_testing: abTesting,
        performance_indicators: performanceIndicators
      },
      
      // 7. Logging-System
      logging: {
        creation_time: logCreationTime,
        resources: logResources,
        errors: logErrors,
        performance_reports: logPerformance,
        user_interactions: logUserInteractions,
        success_metrics: successMetrics
      },
      
      // 8. Automatisierte Überprüfungen
      checks: {
        spelling: checkSpelling,
        plagiarism: checkPlagiarism,
        image_quality: checkImageQuality,
        seo: checkSeo,
        content_guidelines: checkContentGuidelines
      }
    };
    
    // Convert to YAML
    const yamlString = `# Content Automation Configuration
# Erstellt am: ${new Date().toISOString()}

${stringify(config, { indent: 2 })}`;
    
    setYamlOutput(yamlString);
    return config;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Generate YAML config
      const config = generateYamlConfig();
      const yamlConfig = stringify(config, { indent: 2 });
      
      // Save to database
      await contentAutomationService.createConfiguration({
        name: configName,
        config,
        yaml_config: yamlConfig,
        is_active: true
      });
      
      toast({
        title: "Konfiguration gespeichert",
        description: "Die Content-Automatisierung wurde erfolgreich konfiguriert."
      });
      
      // Create scheduled jobs based on configuration
      // await contentAutomationService.createScheduledJobsFromConfig(result.id);
      
      setCurrentStep(9); // Show success step
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast({
        title: "Fehler",
        description: "Die Konfiguration konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadYamlConfig = () => {
    if (!yamlOutput) {
      generateYamlConfig();
    }
    
    const blob = new Blob([yamlOutput], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-automation-${new Date().toISOString().split('T')[0]}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                1. Themenauswahl
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Name der Konfiguration</Label>
                <Input 
                  value={configName} 
                  onChange={(e) => setConfigName(e.target.value)}
                  placeholder="Content-Automatisierung"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Hauptkategorien für den Content</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BLOG_CATEGORIES.map(category => (
                    <div key={category.value} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{category.label}</span>
                      <Select
                        value={selectedCategories[category.value] || ""}
                        onValueChange={(value) => handleCategoryChange(category.value, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Priorität" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nicht auswählen</SelectItem>
                          {PRIORITY_LEVELS.map(priority => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
              
              {Object.keys(selectedCategories).length > 0 && (
                <div className="space-y-4">
                  <Label>Tags für ausgewählte Kategorien</Label>
                  {Object.entries(selectedCategories).map(([category, priority]) => {
                    const categoryLabel = BLOG_CATEGORIES.find(c => c.value === category)?.label || category;
                    const priorityLabel = PRIORITY_LEVELS.find(p => p.value === priority)?.label || priority;
                    
                    return (
                      <div key={category} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{categoryLabel}</span>
                            <Badge variant="outline">{priorityLabel}</Badge>
                          </div>
                        </div>
                        
                        <Label className="mb-2 block">Wähle 5-10 Tags für diese Kategorie</Label>
                        <TagSelector
                          options={[
                            "Permakultur", "No-Dig", "Biogarten", "Hochbeet", "Mischkultur",
                            "Meal Prep", "Zero Waste", "Fermentieren", "One Pot", "Regional",
                            "Plastikfrei", "Regenerativ", "Naturgarten", "Kreislaufwirtschaft", "Upcycling",
                            "Wassersparend", "Biologisch", "Nützlinge", "Kompost", "Mulchen",
                            "Selbstversorgung", "Saisonal", "Nachhaltig", "DIY", "Anfänger"
                          ]}
                          selected={categoryTags[category] || []}
                          setSelected={(tags) => handleCategoryTagsChange(category, tags)}
                        />
                        
                        {(categoryTags[category]?.length || 0) < 5 && (
                          <div className="text-yellow-600 text-sm mt-2 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Bitte wähle mindestens 5 Tags
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                2. Zeitplanung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Veröffentlichungsintervall</Label>
                <Select
                  value={publishingInterval}
                  onValueChange={setPublishingInterval}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PUBLISHING_INTERVALS.map(interval => (
                      <SelectItem key={interval.value} value={interval.value}>
                        {interval.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Optimale Veröffentlichungszeit</Label>
                <Select
                  value={publishingTime}
                  onValueChange={setPublishingTime}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PUBLISHING_TIMES.map(time => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Maximale Posts pro Zeiteinheit: {maxPostsPerTimeUnit}</Label>
                <Slider
                  value={[maxPostsPerTimeUnit]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setMaxPostsPerTimeUnit(value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Pausen zwischen Veröffentlichungen: {pauseBetweenPosts} Stunden</Label>
                <Slider
                  value={[pauseBetweenPosts]}
                  min={1}
                  max={24}
                  step={1}
                  onValueChange={(value) => setPauseBetweenPosts(value[0])}
                />
              </div>
            </CardContent>
          </Card>
        );
      
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                3. Veröffentlichungseinstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={immediatePublishing}
                  onCheckedChange={setImmediatePublishing}
                  id="immediate-publishing"
                />
                <Label htmlFor="immediate-publishing">
                  Sofortveröffentlichung (ohne Freigabeprozess)
                </Label>
              </div>
              
              {!immediatePublishing && (
                <>
                  <div className="space-y-2">
                    <Label>Moderatoren für die Freigabe</Label>
                    <Textarea
                      placeholder="Gib die Benutzer-IDs der Moderatoren ein, eine pro Zeile"
                      value={moderators.join('\n')}
                      onChange={(e) => setModerators(e.target.value.split('\n').filter(Boolean))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Freigabekriterien</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {QUALITY_CRITERIA.map(criterion => (
                        <div key={criterion} className="flex items-center space-x-2">
                          <Switch
                            id={`criterion-${criterion}`}
                            checked={approvalCriteria.includes(criterion)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setApprovalCriteria([...approvalCriteria, criterion]);
                              } else {
                                setApprovalCriteria(approvalCriteria.filter(c => c !== criterion));
                              }
                            }}
                          />
                          <Label htmlFor={`criterion-${criterion}`}>{criterion}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Maximale Wartezeit bis zur Freigabe: {maxWaitingTime} Stunden</Label>
                    <Slider
                      value={[maxWaitingTime]}
                      min={1}
                      max={72}
                      step={1}
                      onValueChange={(value) => setMaxWaitingTime(value[0])}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      
      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                4. Bildmaterial-Konfiguration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Bildquelle</Label>
                <Select
                  value={imageSource}
                  onValueChange={setImageSource}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGE_SOURCES.map(source => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Bildstil</Label>
                <Select
                  value={imageStyle}
                  onValueChange={setImageStyle}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGE_STYLES.map(style => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Bildgröße</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Breite (px)</Label>
                    <Input
                      type="number"
                      value={imageWidth}
                      onChange={(e) => setImageWidth(parseInt(e.target.value))}
                      min={400}
                      max={2000}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Höhe (px)</Label>
                    <Input
                      type="number"
                      value={imageHeight}
                      onChange={(e) => setImageHeight(parseInt(e.target.value))}
                      min={400}
                      max={2000}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Bildformat</Label>
                <Select
                  value={imageFormat}
                  onValueChange={setImageFormat}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );
      
      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                5. Textparameter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Wortanzahl: {minWordCount} - {maxWordCount} Wörter</Label>
                <div className="pt-5 pb-2">
                  <Slider
                    value={[minWordCount, maxWordCount]}
                    min={300}
                    max={3000}
                    step={100}
                    onValueChange={(value) => {
                      setMinWordCount(value[0]);
                      setMaxWordCount(value[1]);
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>300</span>
                  <span>1500</span>
                  <span>3000</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Schreibstil und Tonalität</Label>
                <Textarea
                  value={writingStyle}
                  onChange={(e) => setWritingStyle(e.target.value)}
                  placeholder="Beschreibe den gewünschten Schreibstil"
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Beschreibe den Schreibstil detailliert, um die Persönlichkeit von Marianne, einer 50-jährigen ostfriesischen Gärtnerin, zu treffen.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Keywords pro Beitrag: {keywordsPerPost}</Label>
                <Slider
                  value={[keywordsPerPost]}
                  min={3}
                  max={10}
                  step={1}
                  onValueChange={(value) => setKeywordsPerPost(value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <Label>SEO-Richtlinien</Label>
                <Textarea
                  value={seoGuidelines}
                  onChange={(e) => setSeoGuidelines(e.target.value)}
                  placeholder="Definiere SEO-Richtlinien für die Beiträge"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );
      
      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                6. Testumgebung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Testszenarien</Label>
                <Textarea
                  value={testScenarios.join('\n')}
                  onChange={(e) => setTestScenarios(e.target.value.split('\n').filter(Boolean))}
                  placeholder="Ein Szenario pro Zeile"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Qualitätskriterien</Label>
                <div className="grid grid-cols-2 gap-2">
                  {QUALITY_CRITERIA.map(criterion => (
                    <div key={criterion} className="flex items-center space-x-2">
                      <Switch
                        id={`quality-${criterion}`}
                        checked={qualityCriteria.includes(criterion)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setQualityCriteria([...qualityCriteria, criterion]);
                          } else {
                            setQualityCriteria(qualityCriteria.filter(c => c !== criterion));
                          }
                        }}
                      />
                      <Label htmlFor={`quality-${criterion}`}>{criterion}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={abTesting}
                  onCheckedChange={setAbTesting}
                  id="ab-testing"
                />
                <Label htmlFor="ab-testing">A/B-Testing aktivieren</Label>
              </div>
              
              <div className="space-y-2">
                <Label>Performance-Indikatoren</Label>
                <Textarea
                  value={performanceIndicators.join('\n')}
                  onChange={(e) => setPerformanceIndicators(e.target.value.split('\n').filter(Boolean))}
                  placeholder="Ein Indikator pro Zeile"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );
      
      case 7:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                7. Logging-System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={logCreationTime}
                    onCheckedChange={setLogCreationTime}
                    id="log-creation-time"
                  />
                  <Label htmlFor="log-creation-time">Erstellungszeitpunkt und -dauer</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={logResources}
                    onCheckedChange={setLogResources}
                    id="log-resources"
                  />
                  <Label htmlFor="log-resources">Verwendete Ressourcen</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={logErrors}
                    onCheckedChange={setLogErrors}
                    id="log-errors"
                  />
                  <Label htmlFor="log-errors">Fehler und Warnungen</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={logPerformance}
                    onCheckedChange={setLogPerformance}
                    id="log-performance"
                  />
                  <Label htmlFor="log-performance">Performance-Berichte</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={logUserInteractions}
                    onCheckedChange={setLogUserInteractions}
                    id="log-user-interactions"
                  />
                  <Label htmlFor="log-user-interactions">Nutzerinteraktionen</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Erfolgsmetriken</Label>
                <Textarea
                  value={successMetrics.join('\n')}
                  onChange={(e) => setSuccessMetrics(e.target.value.split('\n').filter(Boolean))}
                  placeholder="Eine Metrik pro Zeile"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );
      
      case 8:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                8. Automatisierte Überprüfungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={checkSpelling}
                    onCheckedChange={setCheckSpelling}
                    id="check-spelling"
                  />
                  <Label htmlFor="check-spelling">Rechtschreibung und Grammatik</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={checkPlagiarism}
                    onCheckedChange={setCheckPlagiarism}
                    id="check-plagiarism"
                  />
                  <Label htmlFor="check-plagiarism">Plagiatsprüfung</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={checkImageQuality}
                    onCheckedChange={setCheckImageQuality}
                    id="check-image-quality"
                  />
                  <Label htmlFor="check-image-quality">Bildqualität und -rechte</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={checkSeo}
                    onCheckedChange={setCheckSeo}
                    id="check-seo"
                  />
                  <Label htmlFor="check-seo">SEO-Konformität</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={checkContentGuidelines}
                    onCheckedChange={setCheckContentGuidelines}
                    id="check-content-guidelines"
                  />
                  <Label htmlFor="check-content-guidelines">Content-Richtlinien</Label>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Konfiguration wird gespeichert...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Konfiguration speichern und aktivieren
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      
      case 9:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                Konfiguration erfolgreich gespeichert
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-green-800">
                <p className="flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  Die Content-Automatisierung wurde erfolgreich konfiguriert und aktiviert.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>YAML-Konfiguration</Label>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {yamlOutput}
                  </pre>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={downloadYamlConfig} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  YAML-Konfiguration herunterladen
                </Button>
                
                <Button onClick={() => {
                  onComplete();
                }}>
                  <Zap className="mr-2 h-4 w-4" />
                  Zum Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Schritt {currentStep} von 8</span>
          <span>{Math.round((currentStep / 8) * 100)}%</span>
        </div>
        <Progress value={(currentStep / 8) * 100} className="h-2" />
      </div>
      
      {/* Step content */}
      {renderStepContent()}
      
      {/* Navigation buttons */}
      {currentStep < 9 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Zurück
          </Button>
          
          <Button
            onClick={currentStep < 8 ? nextStep : handleSubmit}
            disabled={isSubmitting}
          >
            {currentStep < 8 ? (
              <>
                Weiter
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Konfiguration speichern
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ContentAutomationWizard;