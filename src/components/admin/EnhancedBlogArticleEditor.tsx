import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Save, Eye, TrendingUp, Target, Zap, Clock } from "lucide-react";
import ContentQualityIndicator from "./ContentQualityIndicator";
import { contentGenerationService, GeneratedContent } from "@/services/ContentGenerationService";
import { contextAnalyzer, TrendData } from "@/services/ContextAnalyzer";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EnhancedBlogArticleEditorProps {
  initialPrompt: string;
  onSave: (content: string, title: string, quality: any) => void;
  category?: string;
  season?: string;
  audiences?: string[];
  contentType?: string[];
  tags?: string[];
  excerpt?: string;
  imageUrl?: string;
  toast: ReturnType<typeof import("@/hooks/use-toast").useToast>["toast"];
}

const EnhancedBlogArticleEditor: React.FC<EnhancedBlogArticleEditorProps> = ({
  initialPrompt,
  onSave,
  category,
  season,
  audiences,
  contentType,
  tags,
  excerpt,
  imageUrl,
  toast
}) => {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [currentTrends, setCurrentTrends] = useState<TrendData[]>([]);
  const [readingTime, setReadingTime] = useState<string>("5");

  // Trend-Analyse und Prompt-Optimierung beim Laden
  useEffect(() => {
    const trends = contextAnalyzer.getCurrentTrends(category, season);
    setCurrentTrends(trends.slice(0, 5)); // Top 5 Trends
    
    const optimized = contextAnalyzer.optimizePrompt(initialPrompt, {
      category,
      season,
      audience: audiences,
      trends: trends.slice(0, 3)
    });
    setOptimizedPrompt(optimized);
  }, [initialPrompt, category, season, audiences]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      console.log("[EnhancedEditor] Generating content with enhanced service");
      
      // Calculate target word count based on reading time
      const targetWordCount = parseInt(readingTime) * 250; // ~250 words per minute
      
      const result = await contentGenerationService.generateBlogPost({
        prompt: `${optimizedPrompt || initialPrompt}. Erstelle einen Artikel mit ca. ${targetWordCount} Wörtern (${readingTime} Minuten Lesezeit). Verwende eine klare Struktur mit: 
        - Prägnanter Hauptüberschrift (H1)
        - Übersichtlichem Inhaltsverzeichnis in Aufzählungsform direkt nach der Einleitung
        - Logisch gegliederten Zwischenüberschriften (H2, H3)
        - Kurzen, scanfähigen Absätzen
        - Relevanten Aufzählungen und Hervorhebungen`,
        category,
        season,
        audiences,
        contentType,
        tags,
        excerpt,
        imageUrl
      });

      setGeneratedContent(result);
      setEditingContent(result.content);
      
      console.log("[EnhancedEditor] Content generated successfully:", {
        title: result.title,
        quality: result.quality.score,
        wordCount: result.quality.wordCount
      });
    } catch (error: any) {
      console.error("[EnhancedEditor] Generation failed:", error);
      toast({
        title: "Fehler bei der Artikel-Generierung",
        description: error.message || "Unbekannter Fehler bei der Kommunikation mit der KI.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      // Calculate target word count based on reading time
      const targetWordCount = parseInt(readingTime) * 250; // ~250 words per minute
      
      const result = await contentGenerationService.generateBlogPost({
        prompt: `${optimizedPrompt || initialPrompt} (Neue Variante). Erstelle einen Artikel mit ca. ${targetWordCount} Wörtern (${readingTime} Minuten Lesezeit). Verwende eine klare Struktur mit: 
        - Prägnanter Hauptüberschrift (H1)
        - Übersichtlichem Inhaltsverzeichnis in Aufzählungsform direkt nach der Einleitung
        - Logisch gegliederten Zwischenüberschriften (H2, H3)
        - Kurzen, scanfähigen Absätzen
        - Relevanten Aufzählungen und Hervorhebungen`,
        category,
        season,
        audiences,
        contentType,
        tags,
        excerpt,
        imageUrl
      });

      setGeneratedContent(result);
      setEditingContent(result.content);
    } catch (error: any) {
      console.error("[EnhancedEditor] Regeneration failed:", error);
      toast({
        title: "Fehler bei der Artikel-Neugenerierung",
        description: error.message || "Unbekannter Fehler bei der Kommunikation mit der KI.",
        variant: "destructive",
      });
    }
    setRegenerating(false);
  };

  const handleSave = () => {
    if (generatedContent) {
      onSave(editingContent, generatedContent.title, generatedContent.quality);
    }
  };

  return (
    <div className="space-y-4">
      {/* Reading Time Selector */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-sage-600" />
        <span className="font-medium">Gewünschte Lesezeit:</span>
        <Select value={readingTime} onValueChange={setReadingTime}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Lesezeit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 Minuten</SelectItem>
            <SelectItem value="5">5 Minuten</SelectItem>
            <SelectItem value="10">10 Minuten</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-sage-600">
          (ca. {parseInt(readingTime) * 250} Wörter)
        </span>
      </div>

      {/* Trend-Insights */}
      {currentTrends.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Aktuelle Trends eingebunden</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {currentTrends.map((trend, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {trend.keyword} ({Math.round(trend.relevance * 100)}%)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimierter Prompt Anzeige */}
      {optimizedPrompt !== initialPrompt && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">KI-optimierter Prompt</span>
            </div>
            <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
              {optimizedPrompt}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleGenerate}
          disabled={loading || regenerating}
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          Enhanced Artikel generieren
        </Button>

        {generatedContent && (
          <>
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={loading || regenerating}
              className="flex items-center gap-2"
            >
              {regenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Neue Variante
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? "Editor" : "Vorschau"}
            </Button>
          </>
        )}
      </div>

      {generatedContent && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <Badge variant="outline" className="text-xs">
                {generatedContent.metadata.generationTime}ms
              </Badge>
              <span className="text-sm text-gray-500 ml-2">
                Titel: {generatedContent.title}
              </span>
            </div>
          </div>

          <ContentQualityIndicator quality={generatedContent.quality} />

          {showPreview ? (
            <Card>
              <CardHeader>
                <CardTitle>Vorschau</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {editingContent}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Enhanced Artikel bearbeiten (Markdown möglich):
              </label>
              <Textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                rows={15}
                className="font-mono text-sm"
                placeholder="Generierter Enhanced Artikel-Inhalt..."
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              onClick={handleSave}
              disabled={loading || regenerating}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Enhanced Artikel speichern
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedBlogArticleEditor;