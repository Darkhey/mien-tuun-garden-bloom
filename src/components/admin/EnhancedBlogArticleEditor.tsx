
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Save, Eye, TrendingUp, Target } from "lucide-react";
import ContentQualityIndicator from "./ContentQualityIndicator";
import { contentGenerationService, GeneratedContent } from "@/services/ContentGenerationService";
import { contextAnalyzer, TrendData } from "@/services/ContextAnalyzer";

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
  imageUrl
}) => {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [currentTrends, setCurrentTrends] = useState<TrendData[]>([]);

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
      
      const result = await contentGenerationService.generateBlogPost({
        prompt: optimizedPrompt || initialPrompt,
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
    } catch (error) {
      console.error("[EnhancedEditor] Generation failed:", error);
    }
    setLoading(false);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const result = await contentGenerationService.generateBlogPost({
        prompt: optimizedPrompt + " (Neue Variante)",
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
    } catch (error) {
      console.error("[EnhancedEditor] Regeneration failed:", error);
    }
    setRegenerating(false);
  };

  const handleSave = () => {
    if (generatedContent) {
      onSave(editingContent, generatedContent.title, generatedContent.quality);
    }
  };

  // Re-analyze quality when content changes
  useEffect(() => {
    if (generatedContent && editingContent !== generatedContent.content) {
      // Debounce quality analysis
      const timer = setTimeout(() => {
        // Could implement real-time quality analysis here
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [editingContent, generatedContent]);

  return (
    <div className="space-y-4">
      {/* Trend-Insights */}
      {currentTrends.length > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800">Aktuelle Trends</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {currentTrends.map((trend, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {trend.keyword} ({Math.round(trend.relevance * 100)}%)
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Optimierter Prompt Anzeige */}
      {optimizedPrompt !== initialPrompt && (
        <div className="p-3 bg-green-50 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800">KI-optimierter Prompt</span>
          </div>
          <p className="text-sm text-green-700">{optimizedPrompt}</p>
        </div>
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
            "KI-Artikel generieren"
          )}
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
            <div className="prose max-w-none p-4 border rounded-lg bg-white">
              <div dangerouslySetInnerHTML={{ __html: editingContent.replace(/\n/g, '<br>') }} />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Artikel bearbeiten (Markdown möglich):
              </label>
              <Textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                rows={15}
                className="font-mono text-sm"
                placeholder="Generierter Artikel-Inhalt..."
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
              Artikel speichern
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedBlogArticleEditor;
