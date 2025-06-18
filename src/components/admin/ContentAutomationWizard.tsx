import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  Settings, 
  Image, 
  FileText, 
  CheckSquare, 
  BarChart, 
  Save,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BLOG_CATEGORIES } from "@/components/admin/blogHelpers";
import { scheduledJobService } from "@/services/ScheduledJobService";

// Main categories from blog filter
const CATEGORIES = BLOG_CATEGORIES.map(cat => ({ value: cat.value, label: cat.label }));

// Tags for each category
const CATEGORY_TAGS = {
  "gartenplanung": ["Permakultur", "No-Dig", "Biogarten", "Hochbeet", "Mischkultur", "Planung", "Design", "Beetaufteilung", "Jahresplanung", "Gartenkalender"],
  "aussaat-pflanzung": ["Direktsaat", "Vorkultur", "Jungpflanzen", "Saatgut", "Mondkalender", "Keimung", "Aussaatkalender", "Pflanzabstände", "Saattiefe", "Pikieren"],
  "pflanzenpflege": ["Biologisch", "Naturdünger", "Mulchen", "Schnitt", "Pflanzenstärkung", "Gießen", "Düngen", "Pflanzengesundheit", "Wachstumsförderung", "Pflanzenernährung"],
  "schaedlingsbekaempfung": ["Nützlinge", "Hausmittel", "Biologisch", "Präventiv", "Natürlich", "Pflanzenjauchen", "Mischkultur", "Schädlingsbarrieren", "Fallen", "Resistente Sorten"],
  "kompostierung": ["Wurmkompost", "Bokashi", "Thermokomposter", "Gründüngung", "Komposttee", "Humusaufbau", "Kompostwende", "Mikroorganismen", "Kompostbeschleuniger", "Laubkompost"],
  "saisonale-kueche": ["Meal Prep", "Zero Waste", "Fermentieren", "One Pot", "Regional", "Saisonkalender", "Ernteverwertung", "Vorratshaltung", "Frische Zutaten", "Gartenkochbuch"],
  "konservieren-haltbarmachen": ["Einkochen", "Fermentieren", "Trocknen", "Einfrieren", "Einlegen", "Vakuumieren", "Entsaften", "Marmelade", "Sirup", "Dörren"],
  "kraeuter-heilpflanzen": ["Heilkräuter", "Tee", "Naturmedizin", "Aromatherapie", "Kräutergarten", "Wildkräuter", "Tinkturen", "Salben", "Kräuteröle", "Kräutersalz"],
  "nachhaltigkeit": ["Plastikfrei", "Regenerativ", "Naturgarten", "Kreislaufwirtschaft", "Upcycling", "Ressourcenschonung", "Biodiversität", "Ökologisch", "Klimafreundlich", "Umweltschutz"],
  "wassersparen-bewaesserung": ["Regenwasser", "Tröpfchenbewässerung", "Mulchen", "Wasserspeicher", "Gießkanne", "Ollas", "Bewässerungssystem", "Wassermanagement", "Gießtechniken", "Regentonne"],
  "diY-projekte": ["Upcycling", "Balkonideen", "Selbstgebaut", "Recycling", "Kreativ", "Holzarbeiten", "Palettenmöbel", "Gartendeko", "Werkzeugbau", "Reparieren"],
  "gartengeraete-werkzeuge": ["Pflege", "Auswahl", "Selbstbau", "Reparatur", "Ergonomisch", "Qualitätswerkzeug", "Werkzeugpflege", "Gartenhilfsmittel", "Werkzeugaufbewahrung", "Handwerkzeug"],
  "ernte": ["Haltbarmachen", "Kräutergarten", "Vorrat", "Timing", "Lagerung", "Erntetechniken", "Erntezeit", "Erntereife", "Erntekalender", "Erntedank"],
  "lagerung-vorratshaltung": ["Kellerlagerung", "Mieten", "Konservierung", "Haltbarkeit", "Vorratskammer", "Lagerungsbedingungen", "Lagerfähigkeit", "Vorratsgläser", "Lagerraum", "Lebensmittelmotten"],
  "selbstversorgung": ["Unabhängigkeit", "Microgreens", "Wildkräuter", "Autarkie", "Planung", "Selbstversorger", "Eigenanbau", "Subsistenz", "Nahrungsautonomie", "Selbstversorgergarten"],
  "permakultur": ["Nachhaltigkeit", "Kreisläufe", "Zonierung", "Mischkultur", "Wassermanagement", "Permakulturprinzipien", "Waldgarten", "Humusaufbau", "Mulchsysteme", "Permabeete"],
  "urban-gardening": ["Stadtgarten", "Gemeinschaftsgarten", "Guerilla Gardening", "Kleinfläche", "Balkon", "Dachgarten", "Vertikales Gärtnern", "Stadtökologie", "Urbane Landwirtschaft", "Kleinstgarten"],
  "balkon-terrasse": ["Topfgarten", "Platzsparend", "Mobilität", "Windschutz", "Bewässerung", "Kübelpflanzen", "Vertikalbegrünung", "Balkongarten", "Terrassenbepflanzung", "Gefäßgarten"],
  "indoor-gardening": ["Hydroponik", "LED-Beleuchtung", "Microgreens", "Zimmerpflanzen", "Fensterbrett", "Kräutergarten", "Sprossen", "Anzuchtstation", "Raumklima", "Pflanzenlampen"],
  "tipps-tricks": ["Tool Hacks", "Schädlingskontrolle", "Lifehacks", "Profi-Tipps", "Zeitsparen", "Gartenhacks", "Anfängertipps", "Problemlösungen", "Gartentricks", "Erfahrungswissen"],
  "jahreszeitliche-arbeiten": ["Saisonkalender", "Gartenarbeiten", "Timing", "Planung", "Frühjahr", "Sommer", "Herbst", "Winter", "Monatsarbeiten", "Jahresplanung"],
  "bodenpflege": ["Bodenanalyse", "Humusaufbau", "Gründüngung", "Lebendigkeit", "pH-Wert", "Bodenfruchtbarkeit", "Bodenorganismen", "Bodenstruktur", "Bodenverdichtung", "Bodenverbesserung"],
  "sonstiges": ["Inspiration", "Allgemein", "Verschiedenes", "Gartenliteratur", "Gartenphilosophie", "Gartengeschichte", "Gartenkunst", "Gartenreisen", "Gartenerlebnisse", "Gartenprojekte"]
};

// Priority levels
const PRIORITY_LEVELS = [
  { value: "A", label: "Hohe Priorität", description: "Kernthemen mit hoher Relevanz" },
  { value: "B", label: "Mittlere Priorität", description: "Wichtige Ergänzungsthemen" },
  { value: "C", label: "Niedrige Priorität", description: "Optionale Themen" }
];

// Publishing intervals
const PUBLISHING_INTERVALS = [
  { value: "hourly", label: "Stündlich", cronBase: "0 * * * *" },
  { value: "daily", label: "Täglich", cronBase: "0 9 * * *" },
  { value: "weekly", label: "Wöchentlich", cronBase: "0 9 * * 1" },
  { value: "biweekly", label: "Zweiwöchentlich", cronBase: "0 9 1,15 * *" },
  { value: "monthly", label: "Monatlich", cronBase: "0 9 1 * *" }
];

// Optimal publishing times
const PUBLISHING_TIMES = [
  { value: "morning", label: "Morgens (9:00)", hour: 9 },
  { value: "noon", label: "Mittags (12:00)", hour: 12 },
  { value: "afternoon", label: "Nachmittags (15:00)", hour: 15 },
  { value: "evening", label: "Abends (19:00)", hour: 19 },
  { value: "night", label: "Nachts (22:00)", hour: 22 }
];

// Image styles
const IMAGE_STYLES = [
  { value: "realistic", label: "Realistisch" },
  { value: "artistic", label: "Künstlerisch" },
  { value: "minimalist", label: "Minimalistisch" },
  { value: "vibrant", label: "Lebendig & Farbenfroh" },
  { value: "vintage", label: "Vintage/Retro" },
  { value: "documentary", label: "Dokumentarisch" }
];

// Image sources
const IMAGE_SOURCES = [
  { value: "ai", label: "KI-generiert" },
  { value: "stock", label: "Stock-Fotos" },
  { value: "mixed", label: "Gemischt (KI & Stock)" }
];

// Quality criteria
const QUALITY_CRITERIA = [
  { id: "spelling", label: "Rechtschreibung & Grammatik" },
  { id: "originality", label: "Originalität & Einzigartigkeit" },
  { id: "relevance", label: "Themenrelevanz" },
  { id: "structure", label: "Struktur & Lesbarkeit" },
  { id: "seo", label: "SEO-Optimierung" },
  { id: "images", label: "Bildqualität & -relevanz" }
];

const ContentAutomationWizard: React.FC = () => {
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState({
    // Step 1: Topic Selection
    categories: [] as string[],
    categoryTags: {} as Record<string, string[]>,
    priorities: {} as Record<string, string>,
    
    // Step 2: Time Planning
    publishingInterval: "daily",
    publishingTime: "morning",
    maxPostsPerDay: 2,
    pauseBetweenPosts: 4, // hours
    
    // Step 3: Publishing Settings
    immediatePublishing: false,
    moderators: [] as string[],
    approvalCriteria: ["spelling", "relevance", "seo"],
    maxWaitingTime: 24, // hours
    
    // Step 4: Image Configuration
    imageSource: "ai",
    imageStyle: "realistic",
    imageGuidelines: {
      width: 1200,
      height: 800,
      format: "jpg",
      quality: 80
    },
    
    // Step 5: Text Parameters
    minWordCount: 500,
    maxWordCount: 1500,
    writingStyle: "Informativ und freundlich, wie von Marianne, einer 50-jährigen ostfriesischen Gärtnerin",
    keywordsPerPost: 5,
    seoGuidelines: "Titel mit Keywords, Meta-Beschreibung mit Call-to-Action, Zwischenüberschriften alle 300 Wörter",
    
    // Step 6: Test Environment
    testScenarios: [] as string[],
    qualityCriteria: ["spelling", "originality", "relevance", "structure", "seo"],
    abTesting: false,
    performanceIndicators: ["views", "engagement", "conversion"],
    
    // Step 7: Logging System
    logCreationTime: true,
    logResources: true,
    logErrors: true,
    createPerformanceReports: true,
    trackUserInteractions: false,
    successMetrics: ["views", "comments", "shares"],
    
    // Step 8: Automated Checks
    checkSpelling: true,
    checkPlagiarism: true,
    checkImageQuality: true,
    checkSeo: true,
    checkContentGuidelines: true
  });
  
  const [availableModerators, setAvailableModerators] = useState<{id: string, name: string}[]>([]);
  
  // Load available moderators (admin users)
  useEffect(() => {
    const loadModerators = async () => {
      try {
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');
          
        if (rolesError) throw rolesError;
        
        if (userRoles && userRoles.length > 0) {
          const userIds = userRoles.map(ur => ur.user_id);
          
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', userIds);
            
          if (profilesError) throw profilesError;
          
          setAvailableModerators(profiles.map(p => ({
            id: p.id,
            name: p.display_name
          })));
        }
      } catch (error) {
        console.error("Error loading moderators:", error);
      }
    };
    
    loadModerators();
  }, []);

  const handleCategoryChange = (category: string, selected: boolean) => {
    setConfig(prev => {
      const newCategories = selected 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category);
        
      return {
        ...prev,
        categories: newCategories
      };
    });
  };
  
  const handleCategoryTagsChange = (category: string, tags: string[]) => {
    setConfig(prev => ({
      ...prev,
      categoryTags: {
        ...prev.categoryTags,
        [category]: tags
      }
    }));
  };
  
  const handlePriorityChange = (category: string, priority: string) => {
    setConfig(prev => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [category]: priority
      }
    }));
  };
  
  const handleModeratorChange = (moderatorId: string, selected: boolean) => {
    setConfig(prev => {
      const newModerators = selected
        ? [...prev.moderators, moderatorId]
        : prev.moderators.filter(m => m !== moderatorId);
        
      return {
        ...prev,
        moderators: newModerators
      };
    });
  };
  
  const handleQualityCriteriaChange = (criteriaId: string, selected: boolean) => {
    setConfig(prev => {
      const newCriteria = selected
        ? [...prev.qualityCriteria, criteriaId]
        : prev.qualityCriteria.filter(c => c !== criteriaId);
        
      return {
        ...prev,
        qualityCriteria: newCriteria
      };
    });
  };
  
  const handleApprovalCriteriaChange = (criteriaId: string, selected: boolean) => {
    setConfig(prev => {
      const newCriteria = selected
        ? [...prev.approvalCriteria, criteriaId]
        : prev.approvalCriteria.filter(c => c !== criteriaId);
        
      return {
        ...prev,
        approvalCriteria: newCriteria
      };
    });
  };
  
  const nextStep = () => {
    if (activeStep < 8) {
      setActiveStep(activeStep + 1);
    }
  };
  
  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };
  
  const saveConfiguration = async () => {
    setIsSubmitting(true);
    
    try {
      // Generate YAML configuration
      const yamlConfig = generateYamlConfig();
      
      // Save configuration to database
      const { data, error } = await supabase
        .from('content_automation_configs')
        .insert([{
          name: 'Content Automation Config',
          config: config,
          yaml_config: yamlConfig,
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      // Create scheduled jobs based on configuration
      await createScheduledJobs();
      
      toast({
        title: "Konfiguration gespeichert",
        description: "Die Content-Automatisierung wurde erfolgreich eingerichtet.",
      });
      
      // Reset wizard
      setActiveStep(1);
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
  
  const createScheduledJobs = async () => {
    // Create a job for each selected category
    for (const category of config.categories) {
      const priority = config.priorities[category] || 'C';
      const tags = config.categoryTags[category] || [];
      
      // Skip if no tags selected
      if (tags.length === 0) continue;
      
      // Get cron pattern based on publishing interval and time
      const interval = PUBLISHING_INTERVALS.find(i => i.value === config.publishingInterval);
      const time = PUBLISHING_TIMES.find(t => t.value === config.publishingTime);
      
      if (!interval || !time) continue;
      
      // Create cron pattern
      let cronPattern = interval.cronBase;
      // Replace hour in cron pattern
      cronPattern = cronPattern.replace(/\d+(?= \* \* \*| \d+ \* \*| \* \* \d+)/, time.hour.toString());
      
      // Create job config
      const jobConfig = {
        name: `Automatischer ${CATEGORIES.find(c => c.value === category)?.label || category} Artikel`,
        description: `Automatisch generierter Artikel für Kategorie ${category} mit Priorität ${priority}`,
        schedule_pattern: cronPattern,
        schedule_type: config.publishingInterval === 'hourly' ? 'custom' : 
                       config.publishingInterval === 'biweekly' ? 'custom' : 
                       config.publishingInterval,
        target_table: 'blog_posts',
        template_data: {
          title: `Automatischer ${CATEGORIES.find(c => c.value === category)?.label || category} Artikel`,
          content: "Wird durch KI generiert",
          excerpt: "Automatisch generierter Artikel",
          category: category,
          tags: tags,
          status: config.immediatePublishing ? 'veröffentlicht' : 'entwurf',
          published: config.immediatePublishing,
          author: "Marianne (KI-generiert)",
          seo_title: `${CATEGORIES.find(c => c.value === category)?.label || category} Tipps und Tricks`,
          seo_description: `Entdecke wertvolle Tipps zum Thema ${CATEGORIES.find(c => c.value === category)?.label || category}`,
          seo_keywords: tags,
          reading_time: 5,
          featured: false
        },
        is_active: true
      };
      
      try {
        await scheduledJobService.createJobConfig(jobConfig);
      } catch (error) {
        console.error(`Error creating job for category ${category}:`, error);
      }
    }
  };
  
  const generateYamlConfig = (): string => {
    return `# Content Automation Configuration
# Erstellt am: ${new Date().toISOString()}

# 1. Themenauswahl
categories:
${config.categories.map(cat => `  - ${cat}: ${config.priorities[cat] || 'C'}`).join('\n')}

category_tags:
${Object.entries(config.categoryTags).map(([cat, tags]) => `  ${cat}:\n${tags.map(tag => `    - ${tag}`).join('\n')}`).join('\n')}

# 2. Zeitplanung
publishing:
  interval: ${config.publishingInterval}
  time: ${config.publishingTime}
  max_posts_per_day: ${config.maxPostsPerDay}
  pause_between_posts: ${config.pauseBetweenPosts}h

# 3. Veröffentlichungseinstellungen
approval:
  immediate_publishing: ${config.immediatePublishing}
  moderators:
${config.moderators.map(mod => `    - ${mod}`).join('\n')}
  criteria:
${config.approvalCriteria.map(crit => `    - ${crit}`).join('\n')}
  max_waiting_time: ${config.maxWaitingTime}h

# 4. Bildmaterial-Konfiguration
images:
  source: ${config.imageSource}
  style: ${config.imageStyle}
  guidelines:
    width: ${config.imageGuidelines.width}
    height: ${config.imageGuidelines.height}
    format: ${config.imageGuidelines.format}
    quality: ${config.imageGuidelines.quality}

# 5. Textparameter
text:
  min_word_count: ${config.minWordCount}
  max_word_count: ${config.maxWordCount}
  writing_style: "${config.writingStyle}"
  keywords_per_post: ${config.keywordsPerPost}
  seo_guidelines: "${config.seoGuidelines}"

# 6. Testumgebung
testing:
  scenarios:
${config.testScenarios.map(scenario => `    - ${scenario}`).join('\n')}
  quality_criteria:
${config.qualityCriteria.map(criteria => `    - ${criteria}`).join('\n')}
  ab_testing: ${config.abTesting}
  performance_indicators:
${config.performanceIndicators.map(indicator => `    - ${indicator}`).join('\n')}

# 7. Logging-System
logging:
  creation_time: ${config.logCreationTime}
  resources: ${config.logResources}
  errors: ${config.logErrors}
  performance_reports: ${config.createPerformanceReports}
  user_interactions: ${config.trackUserInteractions}
  success_metrics:
${config.successMetrics.map(metric => `    - ${metric}`).join('\n')}

# 8. Automatisierte Überprüfungen
checks:
  spelling: ${config.checkSpelling}
  plagiarism: ${config.checkPlagiarism}
  image_quality: ${config.checkImageQuality}
  seo: ${config.checkSeo}
  content_guidelines: ${config.checkContentGuidelines}
`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Content-Automatisierungs-Assistent</h1>
        <p className="text-gray-600">Konfiguriere die automatische Content-Erstellung in 8 einfachen Schritten</p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <Progress value={(activeStep / 8) * 100} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Start</span>
            <span>Schritt {activeStep}/8</span>
            <span>Fertig</span>
          </div>
        </div>
      </div>
      
      {/* Step 1: Topic Selection */}
      {activeStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              1. Themenauswahl
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Hauptkategorien</h3>
              <p className="text-sm text-gray-600 mb-4">
                Wähle die Hauptkategorien für den automatisch generierten Content aus
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CATEGORIES.map(category => (
                  <div key={category.value} className="flex items-start space-x-2">
                    <Checkbox 
                      id={`category-${category.value}`}
                      checked={config.categories.includes(category.value)}
                      onCheckedChange={(checked) => 
                        handleCategoryChange(category.value, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`category-${category.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            {config.categories.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Tags und Prioritäten</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Wähle für jede Kategorie relevante Tags und setze die Priorität
                </p>
                
                <div className="space-y-4">
                  {config.categories.map(categoryValue => {
                    const category = CATEGORIES.find(c => c.value === categoryValue);
                    const availableTags = CATEGORY_TAGS[categoryValue as keyof typeof CATEGORY_TAGS] || [];
                    const selectedTags = config.categoryTags[categoryValue] || [];
                    
                    return (
                      <div key={categoryValue} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{category?.label}</h4>
                          <Select
                            value={config.priorities[categoryValue] || 'C'}
                            onValueChange={(value) => handlePriorityChange(categoryValue, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Priorität" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRIORITY_LEVELS.map(priority => (
                                <SelectItem key={priority.value} value={priority.value}>
                                  {priority.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="mt-2">
                          <Label className="text-sm mb-1 block">Tags (5-10 empfohlen)</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {availableTags.map(tag => (
                              <Badge 
                                key={tag}
                                variant={selectedTags.includes(tag) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                  const newTags = selectedTags.includes(tag)
                                    ? selectedTags.filter(t => t !== tag)
                                    : [...selectedTags, tag];
                                  handleCategoryTagsChange(categoryValue, newTags);
                                }}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button onClick={nextStep}>
                Weiter <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 2: Time Planning */}
      {activeStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              2. Zeitplanung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Veröffentlichungsintervall</h3>
              <p className="text-sm text-gray-600 mb-4">
                Lege fest, wie häufig neue Inhalte veröffentlicht werden sollen
              </p>
              
              <Select
                value={config.publishingInterval}
                onValueChange={(value) => setConfig(prev => ({ ...prev, publishingInterval: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Intervall wählen" />
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
            
            <div>
              <h3 className="text-lg font-medium mb-2">Optimale Veröffentlichungszeit</h3>
              <p className="text-sm text-gray-600 mb-4">
                Wähle die beste Tageszeit für die Veröffentlichung
              </p>
              
              <Select
                value={config.publishingTime}
                onValueChange={(value) => setConfig(prev => ({ ...prev, publishingTime: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Zeit wählen" />
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
            
            <div>
              <h3 className="text-lg font-medium mb-2">Maximale Posts pro Tag</h3>
              <p className="text-sm text-gray-600 mb-4">
                Begrenze die Anzahl der täglich veröffentlichten Beiträge
              </p>
              
              <div className="flex items-center space-x-4">
                <Slider
                  value={[config.maxPostsPerDay]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, maxPostsPerDay: value[0] }))}
                  className="flex-1"
                />
                <span className="font-medium">{config.maxPostsPerDay}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Pause zwischen Veröffentlichungen</h3>
              <p className="text-sm text-gray-600 mb-4">
                Lege die Mindestzeit zwischen zwei Veröffentlichungen fest (in Stunden)
              </p>
              
              <div className="flex items-center space-x-4">
                <Slider
                  value={[config.pauseBetweenPosts]}
                  min={1}
                  max={24}
                  step={1}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, pauseBetweenPosts: value[0] }))}
                  className="flex-1"
                />
                <span className="font-medium">{config.pauseBetweenPosts} Stunden</span>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
              </Button>
              <Button onClick={nextStep}>
                Weiter <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 3: Publishing Settings */}
      {activeStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              3. Veröffentlichungseinstellungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Veröffentlichungsmethode</h3>
              <p className="text-sm text-gray-600 mb-4">
                Wähle zwischen sofortiger Veröffentlichung oder Freigabeprozess
              </p>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="immediate-publishing"
                  checked={config.immediatePublishing}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, immediatePublishing: checked }))}
                />
                <Label htmlFor="immediate-publishing">
                  {config.immediatePublishing ? "Sofortveröffentlichung" : "Freigabeprozess"}
                </Label>
              </div>
              
              <p className="text-xs text-gray-500 mt-1">
                {config.immediatePublishing 
                  ? "Inhalte werden automatisch veröffentlicht, ohne manuelle Prüfung."
                  : "Inhalte werden als Entwurf gespeichert und müssen manuell freigegeben werden."}
              </p>
            </div>
            
            {!config.immediatePublishing && (
              <>
                <div>
                  <h3 className="text-lg font-medium mb-2">Moderatoren für die Freigabe</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Wähle Benutzer aus, die Inhalte freigeben können
                  </p>
                  
                  <div className="space-y-2">
                    {availableModerators.map(moderator => (
                      <div key={moderator.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`moderator-${moderator.id}`}
                          checked={config.moderators.includes(moderator.id)}
                          onCheckedChange={(checked) => 
                            handleModeratorChange(moderator.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={`moderator-${moderator.id}`} className="text-sm font-normal">
                          {moderator.name}
                        </Label>
                      </div>
                    ))}
                    
                    {availableModerators.length === 0 && (
                      <p className="text-sm text-gray-500">Keine Moderatoren verfügbar</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Freigabekriterien</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Definiere die Kriterien für die Freigabe von Inhalten
                  </p>
                  
                  <div className="space-y-2">
                    {QUALITY_CRITERIA.map(criteria => (
                      <div key={criteria.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`approval-${criteria.id}`}
                          checked={config.approvalCriteria.includes(criteria.id)}
                          onCheckedChange={(checked) => 
                            handleApprovalCriteriaChange(criteria.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={`approval-${criteria.id}`} className="text-sm font-normal">
                          {criteria.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Maximale Wartezeit bis zur Freigabe</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Lege fest, wie lange ein Inhalt maximal auf Freigabe warten soll (in Stunden)
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[config.maxWaitingTime]}
                      min={1}
                      max={72}
                      step={1}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, maxWaitingTime: value[0] }))}
                      className="flex-1"
                    />
                    <span className="font-medium">{config.maxWaitingTime} Stunden</span>
                  </div>
                </div>
              </>
            )}
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
              </Button>
              <Button onClick={nextStep}>
                Weiter <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 4: Image Configuration */}
      {activeStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              4. Bildmaterial-Konfiguration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Bildquelle</h3>
              <p className="text-sm text-gray-600 mb-4">
                Wähle zwischen Stock-Fotos oder KI-generierten Bildern
              </p>
              
              <Select
                value={config.imageSource}
                onValueChange={(value) => setConfig(prev => ({ ...prev, imageSource: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bildquelle wählen" />
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
            
            <div>
              <h3 className="text-lg font-medium mb-2">Bildstil</h3>
              <p className="text-sm text-gray-600 mb-4">
                Definiere den visuellen Stil der Bilder
              </p>
              
              <Select
                value={config.imageStyle}
                onValueChange={(value) => setConfig(prev => ({ ...prev, imageStyle: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bildstil wählen" />
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
            
            <div>
              <h3 className="text-lg font-medium mb-2">Bildrichtlinien</h3>
              <p className="text-sm text-gray-600 mb-4">
                Lege Größe, Format und Qualität der Bilder fest
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image-width" className="text-sm">Breite (px)</Label>
                  <Input
                    id="image-width"
                    type="number"
                    value={config.imageGuidelines.width}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      imageGuidelines: {
                        ...prev.imageGuidelines,
                        width: parseInt(e.target.value)
                      }
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="image-height" className="text-sm">Höhe (px)</Label>
                  <Input
                    id="image-height"
                    type="number"
                    value={config.imageGuidelines.height}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      imageGuidelines: {
                        ...prev.imageGuidelines,
                        height: parseInt(e.target.value)
                      }
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="image-format" className="text-sm">Format</Label>
                  <Select
                    value={config.imageGuidelines.format}
                    onValueChange={(value) => setConfig(prev => ({
                      ...prev,
                      imageGuidelines: {
                        ...prev.imageGuidelines,
                        format: value
                      }
                    }))}
                  >
                    <SelectTrigger id="image-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jpg">JPG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="image-quality" className="text-sm">Qualität (%)</Label>
                  <Input
                    id="image-quality"
                    type="number"
                    min="1"
                    max="100"
                    value={config.imageGuidelines.quality}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      imageGuidelines: {
                        ...prev.imageGuidelines,
                        quality: parseInt(e.target.value)
                      }
                    }))}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
              </Button>
              <Button onClick={nextStep}>
                Weiter <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 5: Text Parameters */}
      {activeStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              5. Textparameter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Wortanzahl</h3>
              <p className="text-sm text-gray-600 mb-4">
                Lege die minimale und maximale Wortanzahl für Beiträge fest
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="min-word-count" className="text-sm">Minimale Wortanzahl</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      id="min-word-count"
                      value={[config.minWordCount]}
                      min={300}
                      max={2000}
                      step={100}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, minWordCount: value[0] }))}
                      className="flex-1"
                    />
                    <span className="font-medium">{config.minWordCount}</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="max-word-count" className="text-sm">Maximale Wortanzahl</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      id="max-word-count"
                      value={[config.maxWordCount]}
                      min={500}
                      max={3000}
                      step={100}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, maxWordCount: value[0] }))}
                      className="flex-1"
                    />
                    <span className="font-medium">{config.maxWordCount}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Schreibstil und Tonalität</h3>
              <p className="text-sm text-gray-600 mb-4">
                Definiere den Schreibstil für die generierten Inhalte
              </p>
              
              <Textarea
                value={config.writingStyle}
                onChange={(e) => setConfig(prev => ({ ...prev, writingStyle: e.target.value }))}
                placeholder="Beschreibe den gewünschten Schreibstil..."
                rows={3}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Keywords pro Beitrag</h3>
              <p className="text-sm text-gray-600 mb-4">
                Lege die Anzahl der Keywords pro Beitrag fest
              </p>
              
              <div className="flex items-center space-x-4">
                <Slider
                  value={[config.keywordsPerPost]}
                  min={3}
                  max={15}
                  step={1}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, keywordsPerPost: value[0] }))}
                  className="flex-1"
                />
                <span className="font-medium">{config.keywordsPerPost}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">SEO-Richtlinien</h3>
              <p className="text-sm text-gray-600 mb-4">
                Definiere SEO-Richtlinien für die generierten Inhalte
              </p>
              
              <Textarea
                value={config.seoGuidelines}
                onChange={(e) => setConfig(prev => ({ ...prev, seoGuidelines: e.target.value }))}
                placeholder="Beschreibe die SEO-Richtlinien..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
              </Button>
              <Button onClick={nextStep}>
                Weiter <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 6: Test Environment */}
      {activeStep === 6 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              6. Testumgebung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Testszenarien</h3>
              <p className="text-sm text-gray-600 mb-4">
                Definiere Testszenarien für verschiedene Content-Typen
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Neues Testszenario hinzufügen..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        setConfig(prev => ({
                          ...prev,
                          testScenarios: [...prev.testScenarios, e.currentTarget.value]
                        }));
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Neues Testszenario hinzufügen..."]') as HTMLInputElement;
                      if (input && input.value) {
                        setConfig(prev => ({
                          ...prev,
                          testScenarios: [...prev.testScenarios, input.value]
                        }));
                        input.value = '';
                      }
                    }}
                  >
                    Hinzufügen
                  </Button>
                </div>
                
                <div className="space-y-1 mt-2">
                  {config.testScenarios.map((scenario, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>{scenario}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          testScenarios: prev.testScenarios.filter((_, i) => i !== index)
                        }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {config.testScenarios.length === 0 && (
                    <p className="text-sm text-gray-500">Keine Testszenarien definiert</p>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Qualitätskriterien</h3>
              <p className="text-sm text-gray-600 mb-4">
                Definiere die Kriterien für die Qualitätsbewertung
              </p>
              
              <div className="space-y-2">
                {QUALITY_CRITERIA.map(criteria => (
                  <div key={criteria.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`quality-${criteria.id}`}
                      checked={config.qualityCriteria.includes(criteria.id)}
                      onCheckedChange={(checked) => 
                        handleQualityCriteriaChange(criteria.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`quality-${criteria.id}`} className="text-sm font-normal">
                      {criteria.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">A/B-Testing</h3>
              <p className="text-sm text-gray-600 mb-4">
                Aktiviere A/B-Testing für verschiedene Content-Varianten
              </p>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="ab-testing"
                  checked={config.abTesting}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, abTesting: checked }))}
                />
                <Label htmlFor="ab-testing">
                  A/B-Testing aktivieren
                </Label>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Performance-Indikatoren</h3>
              <p className="text-sm text-gray-600 mb-4">
                Wähle die Indikatoren zur Messung der Content-Performance
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="indicator-views"
                    checked={config.performanceIndicators.includes('views')}
                    onCheckedChange={(checked) => {
                      const newIndicators = checked
                        ? [...config.performanceIndicators, 'views']
                        : config.performanceIndicators.filter(i => i !== 'views');
                      setConfig(prev => ({ ...prev, performanceIndicators: newIndicators }));
                    }}
                  />
                  <Label htmlFor="indicator-views" className="text-sm font-normal">
                    Aufrufe
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="indicator-engagement"
                    checked={config.performanceIndicators.includes('engagement')}
                    onCheckedChange={(checked) => {
                      const newIndicators = checked
                        ? [...config.performanceIndicators, 'engagement']
                        : config.performanceIndicators.filter(i => i !== 'engagement');
                      setConfig(prev => ({ ...prev, performanceIndicators: newIndicators }));
                    }}
                  />
                  <Label htmlFor="indicator-engagement" className="text-sm font-normal">
                    Engagement (Kommentare, Likes)
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="indicator-conversion"
                    checked={config.performanceIndicators.includes('conversion')}
                    onCheckedChange={(checked) => {
                      const newIndicators = checked
                        ? [...config.performanceIndicators, 'conversion']
                        : config.performanceIndicators.filter(i => i !== 'conversion');
                      setConfig(prev => ({ ...prev, performanceIndicators: newIndicators }));
                    }}
                  />
                  <Label htmlFor="indicator-conversion" className="text-sm font-normal">
                    Conversion (Klicks auf Links, Downloads)
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="indicator-retention"
                    checked={config.performanceIndicators.includes('retention')}
                    onCheckedChange={(checked) => {
                      const newIndicators = checked
                        ? [...config.performanceIndicators, 'retention']
                        : config.performanceIndicators.filter(i => i !== 'retention');
                      setConfig(prev => ({ ...prev, performanceIndicators: newIndicators }));
                    }}
                  />
                  <Label htmlFor="indicator-retention" className="text-sm font-normal">
                    Verweildauer
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="indicator-seo"
                    checked={config.performanceIndicators.includes('seo')}
                    onCheckedChange={(checked) => {
                      const newIndicators = checked
                        ? [...config.performanceIndicators, 'seo']
                        : config.performanceIndicators.filter(i => i !== 'seo');
                      setConfig(prev => ({ ...prev, performanceIndicators: newIndicators }));
                    }}
                  />
                  <Label htmlFor="indicator-seo" className="text-sm font-normal">
                    SEO-Performance
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
              </Button>
              <Button onClick={nextStep}>
                Weiter <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 7: Logging System */}
      {activeStep === 7 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              7. Logging-System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Grundlegende Logs</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="log-creation-time"
                      checked={config.logCreationTime}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, logCreationTime: checked }))}
                    />
                    <Label htmlFor="log-creation-time">
                      Erstellungszeitpunkt und -dauer
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="log-resources"
                      checked={config.logResources}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, logResources: checked }))}
                    />
                    <Label htmlFor="log-resources">
                      Verwendete Ressourcen
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="log-errors"
                      checked={config.logErrors}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, logErrors: checked }))}
                    />
                    <Label htmlFor="log-errors">
                      Fehler und Warnungen
                    </Label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Erweiterte Logs</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="create-performance-reports"
                      checked={config.createPerformanceReports}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, createPerformanceReports: checked }))}
                    />
                    <Label htmlFor="create-performance-reports">
                      Performance-Berichte erstellen
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="track-user-interactions"
                      checked={config.trackUserInteractions}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, trackUserInteractions: checked }))}
                    />
                    <Label htmlFor="track-user-interactions">
                      Nutzerinteraktionen erfassen
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Erfolgsmetriken</h3>
              <p className="text-sm text-gray-600 mb-4">
                Wähle die Metriken zur Erfolgsmessung
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metric-views"
                    checked={config.successMetrics.includes('views')}
                    onCheckedChange={(checked) => {
                      const newMetrics = checked
                        ? [...config.successMetrics, 'views']
                        : config.successMetrics.filter(m => m !== 'views');
                      setConfig(prev => ({ ...prev, successMetrics: newMetrics }));
                    }}
                  />
                  <Label htmlFor="metric-views" className="text-sm font-normal">
                    Aufrufe
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metric-comments"
                    checked={config.successMetrics.includes('comments')}
                    onCheckedChange={(checked) => {
                      const newMetrics = checked
                        ? [...config.successMetrics, 'comments']
                        : config.successMetrics.filter(m => m !== 'comments');
                      setConfig(prev => ({ ...prev, successMetrics: newMetrics }));
                    }}
                  />
                  <Label htmlFor="metric-comments" className="text-sm font-normal">
                    Kommentare
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metric-shares"
                    checked={config.successMetrics.includes('shares')}
                    onCheckedChange={(checked) => {
                      const newMetrics = checked
                        ? [...config.successMetrics, 'shares']
                        : config.successMetrics.filter(m => m !== 'shares');
                      setConfig(prev => ({ ...prev, successMetrics: newMetrics }));
                    }}
                  />
                  <Label htmlFor="metric-shares" className="text-sm font-normal">
                    Shares
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metric-time-on-page"
                    checked={config.successMetrics.includes('time-on-page')}
                    onCheckedChange={(checked) => {
                      const newMetrics = checked
                        ? [...config.successMetrics, 'time-on-page']
                        : config.successMetrics.filter(m => m !== 'time-on-page');
                      setConfig(prev => ({ ...prev, successMetrics: newMetrics }));
                    }}
                  />
                  <Label htmlFor="metric-time-on-page" className="text-sm font-normal">
                    Verweildauer
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metric-conversion"
                    checked={config.successMetrics.includes('conversion')}
                    onCheckedChange={(checked) => {
                      const newMetrics = checked
                        ? [...config.successMetrics, 'conversion']
                        : config.successMetrics.filter(m => m !== 'conversion');
                      setConfig(prev => ({ ...prev, successMetrics: newMetrics }));
                    }}
                  />
                  <Label htmlFor="metric-conversion" className="text-sm font-normal">
                    Conversion-Rate
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
              </Button>
              <Button onClick={nextStep}>
                Weiter <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 8: Automated Checks */}
      {activeStep === 8 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              8. Automatisierte Überprüfungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Inhaltsprüfungen</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="check-spelling"
                      checked={config.checkSpelling}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, checkSpelling: checked }))}
                    />
                    <Label htmlFor="check-spelling">
                      Rechtschreibung und Grammatik
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="check-plagiarism"
                      checked={config.checkPlagiarism}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, checkPlagiarism: checked }))}
                    />
                    <Label htmlFor="check-plagiarism">
                      Plagiatsprüfung
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="check-content-guidelines"
                      checked={config.checkContentGuidelines}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, checkContentGuidelines: checked }))}
                    />
                    <Label htmlFor="check-content-guidelines">
                      Content-Richtlinien
                    </Label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Technische Prüfungen</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="check-image-quality"
                      checked={config.checkImageQuality}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, checkImageQuality: checked }))}
                    />
                    <Label htmlFor="check-image-quality">
                      Bildqualität und -rechte
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="check-seo"
                      checked={config.checkSeo}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, checkSeo: checked }))}
                    />
                    <Label htmlFor="check-seo">
                      SEO-Konformität
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Zusammenfassung</h3>
              <p className="text-sm text-gray-600 mb-4">
                Überprüfe deine Konfiguration, bevor du sie speicherst
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ausgewählte Kategorien:</span>
                  <span className="text-sm">{config.categories.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Veröffentlichungsintervall:</span>
                  <span className="text-sm">{PUBLISHING_INTERVALS.find(i => i.value === config.publishingInterval)?.label}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Veröffentlichungszeit:</span>
                  <span className="text-sm">{PUBLISHING_TIMES.find(t => t.value === config.publishingTime)?.label}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Sofortveröffentlichung:</span>
                  <span className="text-sm">{config.immediatePublishing ? 'Ja' : 'Nein'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Bildquelle:</span>
                  <span className="text-sm">{IMAGE_SOURCES.find(s => s.value === config.imageSource)?.label}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Wortanzahl:</span>
                  <span className="text-sm">{config.minWordCount} - {config.maxWordCount}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
              </Button>
              <Button onClick={saveConfiguration} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Konfiguration speichern
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentAutomationWizard;