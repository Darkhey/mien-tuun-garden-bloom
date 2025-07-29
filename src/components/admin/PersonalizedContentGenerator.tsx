
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Zap, Target, Settings } from "lucide-react";
import { contentStrategyService, PersonalizationProfile } from "@/services/ContentStrategyService";
import { contentGenerationService } from "@/services/ContentGenerationService";

const PersonalizedContentGenerator: React.FC = () => {
  const [profile, setProfile] = useState<PersonalizationProfile>({
    preferredCategories: [],
    readingTime: 5,
    engagementHistory: {},
    skillLevel: 'fortgeschritten'
  });
  
  const [basePrompt, setBasePrompt] = useState("");
  const [personalizedPrompt, setPersonalizedPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = [
    "garten-planung",
    "pflanzenpflege",
    "ernte-kueche",
    "selbermachen-ausruestung",
    "nachhaltigkeit-umwelt",
    "philosophie-lifestyle"
  ];

  const handleCategoryToggle = (category: string) => {
    setProfile(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(category)
        ? prev.preferredCategories.filter(c => c !== category)
        : [...prev.preferredCategories, category]
    }));
  };

  const handlePersonalizePrompt = async () => {
    if (!basePrompt.trim()) return;
    
    try {
      const personalized = await contentStrategyService.personalizeContent(basePrompt, profile);
      setPersonalizedPrompt(personalized);
    } catch (error) {
      console.error("Error personalizing prompt:", error);
    }
  };

  const handleGenerateContent = async () => {
    if (!personalizedPrompt.trim()) return;
    
    setLoading(true);
    try {
      console.log("[PersonalizedGenerator] Generating personalized content");
      
      const result = await contentGenerationService.generateBlogPost({
        prompt: personalizedPrompt,
        category: profile.preferredCategories[0],
        audiences: [profile.skillLevel]
      });

      setGeneratedContent(result.content);
      
      console.log("[PersonalizedGenerator] Content generated successfully");
    } catch (error) {
      console.error("[PersonalizedGenerator] Generation failed:", error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <User className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Personalisierter Content-Generator</h2>
      </div>

      {/* Personalization Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Personalisierungs-Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Skill Level */}
          <div>
            <label className="block text-sm font-medium mb-2">Zielgruppen-Level</label>
            <Select
              value={profile.skillLevel}
              onValueChange={(value: 'anfaenger' | 'fortgeschritten' | 'experte') => 
                setProfile(prev => ({ ...prev, skillLevel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anfaenger">Anfänger</SelectItem>
                <SelectItem value="fortgeschritten">Fortgeschritten</SelectItem>
                <SelectItem value="experte">Experte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reading Time */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Gewünschte Lesezeit: {profile.readingTime} Minuten
            </label>
            <Input
              type="range"
              min="1"
              max="15"
              value={profile.readingTime}
              onChange={(e) => setProfile(prev => ({ 
                ...prev, 
                readingTime: parseInt(e.target.value) 
              }))}
              className="w-full"
            />
          </div>

          {/* Preferred Categories */}
          <div>
            <label className="block text-sm font-medium mb-2">Bevorzugte Kategorien</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={profile.preferredCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Content-Generierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Base Prompt */}
          <div>
            <label className="block text-sm font-medium mb-2">Basis-Prompt</label>
            <Textarea
              value={basePrompt}
              onChange={(e) => setBasePrompt(e.target.value)}
              placeholder="Beschreibe das gewünschte Thema oder den Artikel..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handlePersonalizePrompt}
            disabled={!basePrompt.trim()}
            className="w-full"
          >
            <Zap className="h-4 w-4 mr-2" />
            Prompt personalisieren
          </Button>

          {/* Personalized Prompt */}
          {personalizedPrompt && (
            <div>
              <label className="block text-sm font-medium mb-2">Personalisierter Prompt</label>
              <div className="p-3 bg-blue-50 border rounded-lg">
                <p className="text-sm">{personalizedPrompt}</p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleGenerateContent}
            disabled={!personalizedPrompt.trim() || loading}
            className="w-full"
          >
            {loading ? "Generiere..." : "Personalisierten Content generieren"}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Generierter Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{generatedContent}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Profil-Zusammenfassung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Skill Level:</span> {profile.skillLevel}</div>
            <div><span className="font-medium">Lesezeit:</span> {profile.readingTime} Minuten</div>
            <div><span className="font-medium">Kategorien:</span> {profile.preferredCategories.join(", ") || "Keine ausgewählt"}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedContentGenerator;
