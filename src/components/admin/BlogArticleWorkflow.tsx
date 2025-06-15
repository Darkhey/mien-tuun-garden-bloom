
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import BlogPromptEditor from "./BlogPromptEditor";
import BlogArticleEditor from "./BlogArticleEditor";
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
  // Für Mehrfach-Artikel
  const [generatedList, setGeneratedList] = useState<
    { suggestion: string; content: string; editing: string; status: "loading" | "success" | "error"; error?: string }[]
  >([]);

  // Hilfsfunktion für Artikel-Generierung
  const generateSingleArticle = async (fullPrompt: string, suggestion: string) => {
    console.log(`Generiere Artikel für "${suggestion}" mit Prompt:`, fullPrompt);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: { prompt: fullPrompt }
      });

      if (error) {
        console.error(`Supabase function error für "${suggestion}":`, error);
        throw new Error(`Edge Function Fehler: ${error.message || error}`);
      }

      if (!data || !data.content) {
        console.error(`Keine Inhalte erhalten für "${suggestion}":`, data);
        throw new Error("Keine Inhalte von der KI erhalten");
      }

      console.log(`Artikel erfolgreich generiert für "${suggestion}"`);
      return data.content;
    } catch (err: any) {
      console.error(`Fehler bei Artikel-Generierung für "${suggestion}":`, err);
      throw err;
    }
  };

  // Neuer Multi-Artikel Handler: PARALLEL statt sequentiell
  const handleGenerateMultiple = async () => {
    if (!suggestionSelections.length) return;
    setLoading(true);
    setGeneratedList(
      suggestionSelections.map(s => ({
        suggestion: s,
        content: "",
        editing: "",
        status: "loading"
      }))
    );
    setDebugLogs(prev => [...prev, `Starte Multi-Artikel-Generation für ${suggestionSelections.length} Vorschläge.`]);
    
    try {
      // Für jede Auswahl: Prompt bauen und parallel generieren
      const requests = suggestionSelections.map(async (sug, idx) => {
        const contextParts = [
          sug,
          category ? `Kategorie: ${BLOG_CATEGORIES.find(c => c.value === category)?.label ?? category}.` : "",
          season ? `Saison: ${SEASONS.find(s => s.value === season)?.label ?? season}.` : "",
          audiences.length ? `Zielgruppe: ${audiences.join(", ")}.` : "",
          contentType.length ? `Artikel-Typ/Format: ${contentType.join(", ")}.` : "",
          tags.length ? `Tags: ${tags.join(", ")}.` : "",
          excerpt ? `Kurzbeschreibung/Teaser: ${excerpt}` : "",
          imageUrl ? `Bild: ${imageUrl}` : "",
        ];
        const fullPrompt = contextParts.filter(Boolean).join(" ");
        
        setDebugLogs(prev => [...prev, `Sende Artikel-Request für "${sug}" an KI-Edge-Function.`]);
        
        try {
          const content = await generateSingleArticle(fullPrompt, sug);
          return { idx, content, error: undefined };
        } catch (error: any) {
          return { idx, content: "", error: String(error?.message || error) };
        }
      });

      const results = await Promise.all(requests);
      
      setGeneratedList(prev =>
        prev.map((itm, idx) => {
          const result = results.find(r => r.idx === idx);
          if (!result) return itm;
          return {
            ...itm,
            content: result.content,
            editing: result.content,
            status: result.error ? "error" : "success",
            error: result.error
          };
        })
      );
      
      setDebugLogs(prev => [
        ...prev,
        ...results.map((r, idx) =>
          r.error
            ? `Fehler bei "${suggestionSelections[idx]}": ${r.error}`
            : `Artikel erfolgreich generiert für "${suggestionSelections[idx]}".`
        ),
      ]);
      
      const successCount = results.filter(r => !r.error).length;
      toast({ 
        title: "Generierung abgeschlossen", 
        description: `${successCount} von ${results.length} Artikeln erfolgreich generiert.` 
      });
    } catch (err: any) {
      console.error("Fehler in Multi-Artikel-Generation:", err);
      setDebugLogs(prev => [...prev, "Fehler in Multi-Artikel-Generation: " + String(err.message || err)]);
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setLoading(false);
  };

  // Einzelartikel-Generierung: wie gehabt, aber auch Ladeanimation!
  const handleGenerate = async () => {
    setLoading(true);
    setGenerated(null);
    setEditing("");
    setDebugLogs(prev => [...prev, "Starte Einzel-Artikel-Generation via KI-Edge-Function."]);
    
    try {
      const contextParts = [
        category ? `Kategorie: ${BLOG_CATEGORIES.find(c => c.value === category)?.label ?? category}.` : "",
        season ? `Saison: ${SEASONS.find(s => s.value === season)?.label ?? season}.` : "",
        audiences.length ? `Zielgruppe: ${audiences.join(", ")}.` : "",
        contentType.length ? `Artikel-Typ/Format: ${contentType.join(", ")}.` : "",
        tags.length ? `Tags: ${tags.join(", ")}.` : "",
        excerpt ? `Kurzbeschreibung/Teaser: ${excerpt}` : "",
        imageUrl ? `Bild: ${imageUrl}` : "",
      ];
      const fullPrompt = [prompt || input, ...contextParts].filter(Boolean).join(" ");
      
      const content = await generateSingleArticle(fullPrompt, "Einzelartikel");
      
      setGenerated(content);
      setEditing(content);
      setDebugLogs(prev => [...prev, "Artikel erfolgreich generiert"]);
    } catch (err: any) {
      setDebugLogs(prev => [...prev, "Fehler bei Einzel-Artikel-Generation: " + String(err.message || err)]);
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setLoading(false);
  };

  // Artikel speichern (tatsächlicher API-Call zu Supabase)
  const handleSave = async (content: string, suggestion: string) => {
    // Generiere einen Slug
    const slug = suggestion
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
      title: suggestion,
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
      seo_title: suggestion,
      seo_keywords: tags.length ? tags : [],
      published: false,
      featured: false,
      reading_time: Math.ceil(content.split(/\s/).length / 160), // roughly word count / wpm
      author: "KI-Bot"
    };

    try {
      console.log("Speichere Artikel:", article);
      // API-Call zu Supabase
      const { error } = await supabase.from("blog_posts").insert([article]);
      if (error) {
        console.error("Fehler beim Speichern in Supabase:", error);
        throw new Error(error.message);
      }
      toast({
        title: "Erfolgreich gespeichert!",
        description: `Artikel "${suggestion}" wurde gespeichert.`,
        variant: "default",
      });
    } catch (err: any) {
      console.error("Fehler beim Speichern:", err);
      toast({
        title: "Fehler beim Speichern",
        description: String(err.message || err),
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {suggestionSelections.length > 0 && (
        <Button className="mb-4" onClick={handleGenerateMultiple} disabled={loading}>
          {loading && <span className="mr-2"><Skeleton className="w-4 h-4 rounded-full inline-block" /></span>}
          Artikel für {suggestionSelections.length} Vorschlag{suggestionSelections.length > 1 ? "e" : ""} generieren
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

      {/* Multi-Artikel-Editoren */}
      {generatedList.length > 0 && (
        <div className="grid gap-6 mt-2">
          {generatedList.map((item, idx) => (
            <div key={idx} className="border rounded-xl p-3 shadow-sm bg-muted/30 relative">
              <div className="font-semibold mb-2">{item.suggestion}</div>
              {item.status === "loading" && (
                <div className="flex flex-col items-center justify-center py-6">
                  <Skeleton className="w-full h-5 rounded mb-2" />
                  <Skeleton className="w-full h-10 rounded" />
                  <div className="animate-pulse mt-3 text-muted-foreground">Wird generiert ...</div>
                </div>
              )}
              {item.status === "success" && (
                <BlogArticleEditor
                  generated={item.content}
                  editing={item.editing}
                  setEditing={val => {
                    setGeneratedList(list =>
                      list.map((el, i) => i === idx ? { ...el, editing: val } : el)
                    );
                  }}
                  loading={false}
                  handleGenerate={() => {}} // Kein erneutes Generieren
                  handleSave={() => handleSave(item.editing, item.suggestion)}
                  canGenerate={true}
                />
              )}
              {item.status === "error" && (
                <div className="text-red-600 p-4 bg-red-50 rounded">
                  <div className="font-semibold">Fehler beim Generieren:</div>
                  <div className="text-sm mt-1">{item.error}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Einzelartikel (nur wenn KEIN Multi läuft): */}
      {generatedList.length === 0 && (
        <BlogArticleEditor
          generated={generated}
          editing={editing}
          setEditing={setEditing}
          loading={loading}
          handleGenerate={handleGenerate}
          handleSave={() => handleSave(editing, "Einzelartikel")}
          canGenerate={Boolean(prompt || input)}
        />
      )}
    </div>
  );
};

export default BlogArticleWorkflow;
