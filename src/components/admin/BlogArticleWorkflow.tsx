
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
  const [enhancedArticles, setEnhancedArticles] = useState<
    { suggestion: string; status: "loading" | "editing" | "saved" }[]
  >([]);

  const handleSaveArticle = async (content: string, title: string, quality: any, suggestion: string) => {
    console.log('[BlogWorkflow] Starte Artikel-Speicherung:', { title, suggestion, quality });
    setDebugLogs(prev => [...prev, `[SAVE] Beginne Speicherung: "${title}"`]);
    
    try {
      // Validierung der Eingabedaten
      if (!title || !content) {
        throw new Error('Titel und Inhalt sind erforderlich');
      }

      // Generiere einen eindeutigen Slug
      const baseSlug = (title || suggestion)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 80);
      
      const slug = `${baseSlug}-${Date.now()}`;
      console.log('[BlogWorkflow] Generierter Slug:', slug);

      // Bereite Artikel-Daten vor
      const article = {
        slug,
        title: title || suggestion,
        content,
        excerpt: excerpt || content.slice(0, 200),
        category: category || "Allgemein",
        tags: tags.length ? tags : [],
        content_types: contentType.length ? contentType : ["blog"],
        season: season || "",
        audiences: audiences.length ? audiences : ["anfaenger"],
        featured_image: imageUrl || "",
        og_image: imageUrl || "",
        original_title: title || suggestion,
        seo_description: excerpt || content.slice(0, 156),
        seo_title: title || suggestion,
        seo_keywords: tags.length ? tags : [],
        published: false,
        featured: quality?.score > 90,
        reading_time: Math.ceil(content.split(/\s+/).length / 160),
        author: "KI-Enhanced Pipeline",
        status: "entwurf"
      };

      console.log('[BlogWorkflow] Artikel-Daten vorbereitet:', article);
      setDebugLogs(prev => [...prev, `[SAVE] Daten vorbereitet für Slug: ${slug}`]);

      // Speichere in Supabase
      console.log('[BlogWorkflow] Sende Insert-Request an Supabase...');
      const { data, error } = await supabase
        .from("blog_posts")
        .insert([article])
        .select()
        .single();

      if (error) {
        console.error('[BlogWorkflow] Supabase Insert Fehler:', error);
        setDebugLogs(prev => [...prev, `[ERROR] Supabase Fehler: ${error.message}`]);
        throw new Error(`Supabase Fehler: ${error.message}`);
      }

      console.log('[BlogWorkflow] Artikel erfolgreich gespeichert:', data);
      setDebugLogs(prev => [...prev, `[SUCCESS] Artikel gespeichert mit ID: ${data.id}`]);
      
      // Update Status in Enhanced Articles
      setEnhancedArticles(prev => 
        prev.map(item => 
          item.suggestion === suggestion 
            ? { ...item, status: "saved" }
            : item
        )
      );
      
      toast({
        title: "✅ Enhanced Artikel erfolgreich gespeichert!",
        description: `"${title}" wurde in der Datenbank gespeichert (ID: ${data.id})`,
        variant: "default",
      });
      
      setDebugLogs(prev => [...prev, `[COMPLETE] Artikel-Speicherung abgeschlossen für "${title}"`]);

    } catch (err: any) {
      console.error('[BlogWorkflow] Fehler beim Speichern:', err);
      setDebugLogs(prev => [...prev, `[ERROR] Speicher-Fehler: ${err.message}`]);
      
      toast({
        title: "❌ Fehler beim Speichern",
        description: `Artikel konnte nicht gespeichert werden: ${err.message}`,
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
