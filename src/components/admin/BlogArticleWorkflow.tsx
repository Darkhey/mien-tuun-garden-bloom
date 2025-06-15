
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import BlogPromptEditor from "./BlogPromptEditor";
import EnhancedBlogArticleEditor from "./EnhancedBlogArticleEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { BLOG_CATEGORIES, SEASONS } from "./blogHelpers";
import { supabase } from "@/integrations/supabase/client";

interface BlogArticleWorkflowProps {
  suggestionSelections: string[];
  loading: boolean;
  setLoading: (l: boolean) => void;
  prompt: string;
  setPrompt: (p: string) => void;
  input: string;
  setInput: (v: string) => void;
  isPromptImproved: boolean;
  setIsPromptImproved: (b: boolean) => void;
  handleImprovePrompt: () => void;
  canGenerate: boolean;
  editing: string;
  setEditing: (e: string) => void;
  generated: string | null;
  setGenerated: (g: string | null) => void;

  category: string;
  season: string;
  audiences: string[];
  contentType: string[];
  tags: string[];
  excerpt: string;
  imageUrl: string;
  setDebugLogs: React.Dispatch<React.SetStateAction<string[]>>;
  toast: ReturnType<typeof import("@/components/ui/use-toast").useToast>["toast"];
}

const BlogArticleWorkflow: React.FC<BlogArticleWorkflowProps> = ({
  suggestionSelections, loading, setLoading,
  prompt, setPrompt, input, setInput,
  isPromptImproved, setIsPromptImproved, handleImprovePrompt,
  canGenerate, editing, setEditing,
  generated, setGenerated,
  category, season, audiences, contentType, tags, excerpt, imageUrl,
  setDebugLogs, toast,
}) => {
  // Für Mehrfach-Artikel mit Enhanced Editor
  const [enhancedArticles, setEnhancedArticles] = useState<
    { suggestion: string; status: "loading" | "editing" | "saved" }[]
  >([]);

  const handleSaveArticle = async (content: string, title: string, quality: any, suggestion: string) => {
    // Generiere einen Slug
    const slug = (title || suggestion)
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 80)
      + "-" + Date.now();

    // Fallbacks für Felder
    const article = {
      slug,
      title: title || suggestion,
      content,
      excerpt: excerpt || content.slice(0, 200),
      category: category || "Unkategorisiert",
      tags: tags.length ? tags : [],
      content_types: contentType.length ? contentType : [],
      season: season || "",
      audiences: audiences.length ? audiences : [],
      featured_image: imageUrl || "",
      og_image: "",
      original_title: "",
      seo_description: excerpt || "",
      seo_title: title || suggestion,
      seo_keywords: tags.length ? tags : [],
      published: false,
      featured: false,
      reading_time: Math.ceil(content.split(/\s/).length / 160),
      author: "KI-Bot"
    };

    try {
      console.log("Speichere Enhanced Artikel:", { title, quality: quality.score });
      const { error } = await supabase.from("blog_posts").insert([article]);
      if (error) {
        console.error("Fehler beim Speichern in Supabase:", error);
        throw new Error(error.message);
      }
      
      // Update Status in Enhanced Articles
      setEnhancedArticles(prev => 
        prev.map(item => 
          item.suggestion === suggestion 
            ? { ...item, status: "saved" }
            : item
        )
      );
      
      toast({
        title: "Enhanced Artikel gespeichert!",
        description: `"${title}" wurde mit Quality Score ${quality.score} gespeichert.`,
        variant: "default",
      });
      
      setDebugLogs(prev => [...prev, `Enhanced Artikel "${title}" erfolgreich gespeichert (Quality: ${quality.score})`]);
    } catch (err: any) {
      console.error("Fehler beim Speichern:", err);
      toast({
        title: "Fehler beim Speichern",
        description: String(err.message || err),
        variant: "destructive",
      });
    }
  };

  // Enhanced Multi-Artikel Handler
  const handleGenerateEnhancedMultiple = async () => {
    if (!suggestionSelections.length) return;
    setLoading(true);
    
    setEnhancedArticles(
      suggestionSelections.map(s => ({
        suggestion: s,
        status: "loading"
      }))
    );
    
    setDebugLogs(prev => [...prev, `Starte Enhanced Multi-Artikel-Generation für ${suggestionSelections.length} Vorschläge.`]);
    
    // Nach kurzer Delay auf "editing" setzen (simuliert Generierung)
    setTimeout(() => {
      setEnhancedArticles(prev => 
        prev.map(item => ({ ...item, status: "editing" }))
      );
      setLoading(false);
      setDebugLogs(prev => [...prev, "Enhanced Artikel-Editoren bereit"]);
    }, 2000);
  };

  return (
    <div>
      {suggestionSelections.length > 0 && (
        <Button className="mb-4" onClick={handleGenerateEnhancedMultiple} disabled={loading}>
          {loading && <span className="mr-2"><Skeleton className="w-4 h-4 rounded-full inline-block" /></span>}
          Enhanced Artikel für {suggestionSelections.length} Vorschlag{suggestionSelections.length > 1 ? "e" : ""} generieren
        </Button>
      )}

      <BlogPromptEditor
        input={input}
        setInput={setInput}
        prompt={prompt}
        setPrompt={setPrompt}
        handleImprovePrompt={handleImprovePrompt}
        isPromptImproved={isPromptImproved}
        loading={loading}
        isSuggesting={false}
      />

      {/* Enhanced Multi-Artikel-Editoren */}
      {enhancedArticles.length > 0 && (
        <div className="grid gap-6 mt-6">
          {enhancedArticles.map((item, idx) => (
            <div key={idx} className="border rounded-xl p-4 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{item.suggestion}</h3>
                {item.status === "saved" && (
                  <span className="text-green-600 text-sm">✅ Gespeichert</span>
                )}
              </div>
              
              {item.status === "loading" && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Skeleton className="w-full h-6 rounded mb-3" />
                  <Skeleton className="w-3/4 h-4 rounded mb-3" />
                  <Skeleton className="w-1/2 h-4 rounded" />
                  <div className="animate-pulse mt-4 text-blue-600 font-medium">
                    Enhanced Content wird generiert...
                  </div>
                </div>
              )}
              
              {item.status === "editing" && (
                <EnhancedBlogArticleEditor
                  initialPrompt={item.suggestion}
                  onSave={(content, title, quality) => handleSaveArticle(content, title, quality, item.suggestion)}
                  category={category}
                  season={season}
                  audiences={audiences}
                  contentType={contentType}
                  tags={tags}
                  excerpt={excerpt}
                  imageUrl={imageUrl}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Einzelartikel Editor (wenn keine Multi-Auswahl) */}
      {enhancedArticles.length === 0 && canGenerate && (
        <div className="mt-6 p-4 border rounded-xl bg-gradient-to-r from-green-50 to-blue-50">
          <h3 className="font-semibold mb-3">Enhanced Einzelartikel Generator</h3>
          <EnhancedBlogArticleEditor
            initialPrompt={prompt || input}
            onSave={(content, title, quality) => handleSaveArticle(content, title, quality, "Einzelartikel")}
            category={category}
            season={season}
            audiences={audiences}
            contentType={contentType}
            tags={tags}
            excerpt={excerpt}
            imageUrl={imageUrl}
          />
        </div>
      )}
    </div>
  );
};

export default BlogArticleWorkflow;
