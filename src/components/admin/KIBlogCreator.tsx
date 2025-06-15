
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, TrendingUp } from "lucide-react";
import TagSelector from "./TagSelector";
import BlogMetaSection from "./BlogMetaSection";
import MetaDebugTerminal from "./MetaDebugTerminal";
import BlogSuggestionWorkflow from "./BlogSuggestionWorkflow";
import EnhancedBlogArticleEditor from "./EnhancedBlogArticleEditor";
import SmartPromptOptimizer from "./SmartPromptOptimizer";
import PersonalizedContentGenerator from "./PersonalizedContentGenerator";
import { getTrendTags, buildContextFromMeta } from "./blogHelpers";

const TAG_OPTIONS = [
  "Schnell", "Kinder", "Tipps", "DIY", "Low Budget", "Bio", "Natur", "Regional", "Saisonal", "Nachhaltig", "Praktisch", "Dekor", "Haushalt",
  "Step-by-Step", "Checkliste", "Inspiration"
];

const KIBlogCreator: React.FC = () => {
  // Meta-Informationen State
  const [category, setCategory] = useState("");
  const [season, setSeason] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [audiences, setAudiences] = useState<string[]>([]);
  const [contentType, setContentType] = useState<string[]>([]);
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [dynamicTags, setDynamicTags] = useState<string[]>([]);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  // Suggestion Workflow State
  const [topicInput, setTopicInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionSelections, setSuggestionSelections] = useState<string[]>([]);
  // Track which suggestions were successfully saved
  const [savedSuggestions, setSavedSuggestions] = useState<string[]>([]);
  
  // Enhanced Editor State
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    // Dynamische Tag-Sammlung je nach Kategorie & Saison
    const trendTags = getTrendTags(category, season);
    setDynamicTags(Array.from(new Set([...TAG_OPTIONS, ...trendTags])));
    setDebugLogs(prev => [...prev, `Enhanced KI Blog Creator geladen - ${trendTags.length} Trend-Tags aktiv`]);
  }, [category, season]);

  const handleSaveArticle = async (
    content: string,
    title: string,
    quality: any,
    suggestion?: string
  ) => {
    try {
      console.log("Speichere Enhanced Artikel:", { title, quality: quality.score });
      toast({
        title: "Enhanced Artikel gespeichert!",
        description: `"${title}" wurde mit Quality Score ${quality.score} gespeichert.`,
      });
      
      if (suggestion) {
        // Markiere den Vorschlag als gespeichert, lasse ihn aber sichtbar
        setSavedSuggestions(prev =>
          prev.includes(suggestion) ? prev : [...prev, suggestion]
        );

        if (selectedPrompt === suggestion) {
          setSelectedPrompt("");
        }
      } else {
        setSelectedPrompt("");
      }

      setDebugLogs(prev => [
        ...prev,
        `Enhanced Artikel "${title}" erfolgreich gespeichert (Quality: ${quality.score})`
      ]);
    } catch (error: any) {
      console.error("Fehler beim Speichern:", error);
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="font-bold text-2xl">Enhanced KI Blog Creator</h2>
          <p className="text-gray-600">Intelligente Content-Generierung mit KI-Optimierung</p>
        </div>
      </div>
      
      <Tabs defaultValue="creator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="creator" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Smart Creator
          </TabsTrigger>
          <TabsTrigger value="optimizer" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Prompt Optimizer
          </TabsTrigger>
          <TabsTrigger value="personalized" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Personalisiert
          </TabsTrigger>
        </TabsList>

        <TabsContent value="creator" className="mt-6">
          {/* Meta-Informationen */}
          <BlogMetaSection
            category={category}
            setCategory={setCategory}
            season={season}
            setSeason={setSeason}
            audiences={audiences}
            setAudiences={setAudiences}
            contentType={contentType}
            setContentType={setContentType}
            excerpt={excerpt}
            setExcerpt={setExcerpt}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            tags={tags}
            setTags={setTags}
            dynamicTags={dynamicTags}
            loading={loading || isSuggesting}
          />

          {/* Suggestion Workflow */}
          <BlogSuggestionWorkflow
            topicInput={topicInput}
            setTopicInput={setTopicInput}
            category={category}
            season={season}
            audiences={audiences}
            contentType={contentType}
            tags={tags}
            excerpt={excerpt}
            imageUrl={imageUrl}
            suggestionSelections={suggestionSelections}
            setSuggestionSelections={setSuggestionSelections}
            setDebugLogs={setDebugLogs}
            loading={loading}
            setLoading={setLoading}
            isSuggesting={isSuggesting}
            setIsSuggesting={setIsSuggesting}
            suggestions={suggestions}
            setSuggestions={setSuggestions}
            toast={toast}
          />

          {/* Enhanced Artikel Editor für ausgewählte Vorschläge */}
          {suggestionSelections.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Enhanced Artikel für ausgewählte Vorschläge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {suggestionSelections.map((suggestion, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                      <h4 className="font-medium mb-3 text-lg">{suggestion}</h4>
                      {savedSuggestions.includes(suggestion) ? (
                        <div className="text-green-600 font-medium">✅ Gespeichert</div>
                      ) : (
                        <EnhancedBlogArticleEditor
                          initialPrompt={suggestion}
                          onSave={(content, title, quality) =>
                            handleSaveArticle(content, title, quality, suggestion)
                          }
                          category={category}
                          season={season}
                          audiences={audiences}
                          contentType={contentType}
                          tags={tags}
                          excerpt={excerpt}
                          imageUrl={imageUrl}
                          toast={toast}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Einzelartikel Editor */}
          {suggestionSelections.length === 0 && selectedPrompt && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Enhanced Einzelartikel Generator</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedBlogArticleEditor
                  initialPrompt={selectedPrompt}
                  onSave={(content, title, quality) =>
                    handleSaveArticle(content, title, quality, selectedPrompt)
                  }
                  category={category}
                  season={season}
                  audiences={audiences}
                  contentType={contentType}
                  tags={tags}
                  excerpt={excerpt}
                  imageUrl={imageUrl}
                  toast={toast}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="optimizer" className="mt-6">
          <SmartPromptOptimizer />
        </TabsContent>

        <TabsContent value="personalized" className="mt-6">
          <PersonalizedContentGenerator />
        </TabsContent>
      </Tabs>

      {/* Debug Terminal */}
      <MetaDebugTerminal logs={debugLogs} />
    </div>
  );
};

export default KIBlogCreator;

