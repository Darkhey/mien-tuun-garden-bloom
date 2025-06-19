
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "lucide-react";
import { BLOG_CATEGORIES, SEASONS, getTrendTags } from "./blogHelpers";
import { contentAutomationService } from "@/services/ContentAutomationService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContentAutomationWizardProps {
  onComplete: () => void;
}

const ContentAutomationWizard: React.FC<ContentAutomationWizardProps> = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [configName, setConfigName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryPriorities, setCategoryPriorities] = useState<{ [key: string]: string }>({});
  const [categoryTags, setCategoryTags] = useState<{ [key: string]: string[] }>({});
  const [publishingSettings, setPublishingSettings] = useState({
    interval: "weekly",
    time: "09:00",
    maxPostsPerTimeUnit: 3,
    pauseBetweenPosts: "2 days"
  });
  const [contentSettings, setContentSettings] = useState({
    minWordCount: 500,
    maxWordCount: 800,
    includeImages: true,
    seoOptimization: true,
    readabilityLevel: "medium"
  });
  const [targetingSettings, setTargetingSettings] = useState({
    audiences: ["Hobbygärtner", "Kochbegeisterte"],
    contentTypes: ["Blog-Artikel", "Rezept"],
    languages: ["Deutsch"]
  });
  const [automationSettings, setAutomationSettings] = useState({
    autoPublish: false,
    reviewBeforePublish: true,
    duplicateCheck: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const availableTags = selectedCategories.reduce((acc: string[], category: string) => {
    const tags = getTrendTags(category, "");
    return [...acc, ...tags];
  }, []);

  const handleNext = () => {
    setActiveStep(prev => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleTagSelect = (category: string, tag: string) => {
    setCategoryTags(prev => {
      const currentTags = prev[category] || [];
      if (currentTags.includes(tag)) {
        return {
          ...prev,
          [category]: currentTags.filter(t => t !== tag)
        };
      } else {
        return {
          ...prev,
          [category]: [...currentTags, tag]
        };
      }
    });
  };

  const generateYAMLConfig = () => {
    const config = {
      name: configName,
      categories: selectedCategories.map(cat => ({ [cat]: categoryPriorities[cat] || 'medium' })),
      category_tags: categoryTags,
      publishing: publishingSettings,
      content: contentSettings,
      targeting: targetingSettings,
      automation: automationSettings
    };
    return JSON.stringify(config, null, 2);
  };

  const handleSaveConfiguration = async () => {
    if (!configName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Namen für die Konfiguration ein.",
        variant: "destructive"
      });
      return;
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "Fehler", 
        description: "Bitte wähle mindestens eine Kategorie aus.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Get current user for created_by field
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const categoriesArray = selectedCategories.map(cat => ({ [cat]: categoryPriorities[cat] || 'medium' }));
      
      const configData = {
        name: configName,
        config: {
          name: configName,
          created_at: new Date().toISOString(),
          categories: categoriesArray,
          category_tags: categoryTags,
          publishing: {
            interval: publishingSettings.interval,
            time: publishingSettings.time,
            max_posts_per_time_unit: publishingSettings.maxPostsPerTimeUnit,
            pause_between_posts: publishingSettings.pauseBetweenPosts
          },
          content: {
            min_word_count: contentSettings.minWordCount,
            max_word_count: contentSettings.maxWordCount,
            include_images: contentSettings.includeImages,
            seo_optimization: contentSettings.seoOptimization,
            readability_level: contentSettings.readabilityLevel
          },
          targeting: {
            audiences: targetingSettings.audiences,
            content_types: targetingSettings.contentTypes,
            languages: targetingSettings.languages
          },
          automation: {
            auto_publish: automationSettings.autoPublish,
            review_before_publish: automationSettings.reviewBeforePublish,
            duplicate_check: automationSettings.duplicateCheck
          },
          checks: {
            quality_threshold: 80,
            plagiarism_check: true,
            fact_check: false
          }
        },
        yaml_config: generateYAMLConfig(),
        is_active: true,
        created_by: user.id
      };

      await contentAutomationService.createConfiguration(configData);
      
      toast({
        title: "Erfolg",
        description: "Content-Automatisierung wurde erfolgreich konfiguriert!"
      });
      
      onComplete();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Fehler",
        description: "Konfiguration konnte nicht gespeichert werden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Content-Automatisierung einrichten</h2>
        <div className="text-gray-500">Schritt {activeStep} von 5</div>
      </div>

      {activeStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>1. Konfigurationsname</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="configName">Name</Label>
            <Input
              id="configName"
              value={configName}
              onChange={e => setConfigName(e.target.value)}
              placeholder="z.B. 'Wöchentliche Garten-Tipps'"
            />
            <p className="text-sm text-gray-500">
              Gib deiner Konfiguration einen aussagekräftigen Namen.
            </p>
          </CardContent>
        </Card>
      )}

      {activeStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Kategorien auswählen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Wähle die Kategorien aus, für die du automatisiert Inhalte erstellen möchtest.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {BLOG_CATEGORIES.map(category => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.value}`}
                    checked={selectedCategories.includes(category.value)}
                    onCheckedChange={() => handleCategorySelect(category.value)}
                  />
                  <Label htmlFor={`category-${category.value}`}>{category.label}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>3. Kategorie-Einstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Lege Prioritäten und Tags für jede Kategorie fest.
            </p>
            {selectedCategories.map(category => (
              <div key={category} className="space-y-2 border rounded-md p-4">
                <h3 className="text-lg font-medium">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`priority-${category}`}>Priorität</Label>
                    <Select
                      value={categoryPriorities[category] || "medium"}
                      onValueChange={value => setCategoryPriorities({ ...categoryPriorities, [category]: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Priorität auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Hoch</SelectItem>
                        <SelectItem value="medium">Mittel</SelectItem>
                        <SelectItem value="low">Niedrig</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {getTrendTags(category, "").map(tag => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${category}-${tag}`}
                            checked={(categoryTags[category] || []).includes(tag)}
                            onCheckedChange={() => handleTagSelect(category, tag)}
                          />
                          <Label htmlFor={`tag-${category}-${tag}`}>{tag}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>4. Veröffentlichungs-Einstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Definiere, wie oft und wann Inhalte veröffentlicht werden sollen.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interval">Intervall</Label>
                <Select
                  value={publishingSettings.interval}
                  onValueChange={value => setPublishingSettings({ ...publishingSettings, interval: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Intervall auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Täglich</SelectItem>
                    <SelectItem value="weekly">Wöchentlich</SelectItem>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time">Uhrzeit</Label>
                <Input
                  id="time"
                  type="time"
                  value={publishingSettings.time}
                  onChange={e => setPublishingSettings({ ...publishingSettings, time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="maxPosts">Maximale Anzahl an Posts</Label>
                <Input
                  id="maxPosts"
                  type="number"
                  value={publishingSettings.maxPostsPerTimeUnit}
                  onChange={e => setPublishingSettings({ ...publishingSettings, maxPostsPerTimeUnit: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="pause">Pause zwischen Posts</Label>
                <Input
                  id="pause"
                  type="text"
                  value={publishingSettings.pauseBetweenPosts}
                  onChange={e => setPublishingSettings({ ...publishingSettings, pauseBetweenPosts: e.target.value })}
                  placeholder="z.B. '2 Tage'"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>5. Inhalts-Einstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Definiere die Einstellungen für die generierten Inhalte.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minWordCount">Minimale Wortanzahl</Label>
                <Input
                  id="minWordCount"
                  type="number"
                  value={contentSettings.minWordCount}
                  onChange={e => setContentSettings({ ...contentSettings, minWordCount: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="maxWordCount">Maximale Wortanzahl</Label>
                <Input
                  id="maxWordCount"
                  type="number"
                  value={contentSettings.maxWordCount}
                  onChange={e => setContentSettings({ ...contentSettings, maxWordCount: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeImages"
                  checked={contentSettings.includeImages}
                  onCheckedChange={checked => setContentSettings({ ...contentSettings, includeImages: checked })}
                />
                <Label htmlFor="includeImages">Bilder einfügen</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="seoOptimization"
                  checked={contentSettings.seoOptimization}
                  onCheckedChange={checked => setContentSettings({ ...contentSettings, seoOptimization: checked })}
                />
                <Label htmlFor="seoOptimization">SEO-Optimierung</Label>
              </div>
              <div>
                <Label htmlFor="readabilityLevel">Lesbarkeitsgrad</Label>
                <Select
                  value={contentSettings.readabilityLevel}
                  onValueChange={value => setContentSettings({ ...contentSettings, readabilityLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Lesbarkeitsgrad auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Leicht</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="difficult">Schwer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={activeStep === 1}>
          Zurück
        </Button>
        {activeStep < 5 ? (
          <Button onClick={handleNext}>Weiter</Button>
        ) : (
          <Button onClick={handleSaveConfiguration} disabled={loading}>
            {loading ? "Speichern..." : "Konfiguration speichern"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ContentAutomationWizard;
