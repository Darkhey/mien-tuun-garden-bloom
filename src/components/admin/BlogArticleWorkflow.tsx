import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import BlogPromptEditor from "./BlogPromptEditor";
import BlogArticleEditor from "./BlogArticleEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { BLOG_CATEGORIES, SEASONS } from "./blogHelpers";
import { supabase } from "@/integrations/supabase/client";

const GENERATE_FUNCTION_URL = "https://ublbxvpmoccmegtwaslh.functions.supabase.co/generate-blog-post";

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
      // Für jede Auswahl: Prompt bauen
      const requests = suggestionSelections.map((sug, idx) => {
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
        return fetch(GENERATE_FUNCTION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: fullPrompt }),
        }).then(async response => {
          const data = await response.json();
          if (!response.ok || !data.content) throw new Error(data?.error ?? "Fehler bei der KI");
          return { idx, content: data.content, error: undefined };
        }).catch(error => {
          return { idx, content: "", error: String(error?.message || error) };
        });
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
      toast({ title: "Generierung abgeschlossen", description: "Alle Aufgaben sind fertig." });
    } catch (err: any) {
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
      setDebugLogs(prev => [...prev, "Sende POST an: " + GENERATE_FUNCTION_URL]);
      const response = await fetch(GENERATE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      const data = await response.json();
      setDebugLogs(prev => [...prev, "Antwort erhalten (Status: " + response.status + ")"]);
      if (!response.ok || !data.content) throw new Error(data?.error ?? "Fehler bei der KI");
      setGenerated(data.content);
      setEditing(data.content);
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
      author: "KI-Bot",
      excerpt: excerpt || content.slice(0, 180),
    };

    try {
      // API-Call zu Supabase
      const { error } = await supabase.from("blog_posts").insert([article]);
      if (error) throw new Error(error.message);
      toast({
        title: "Erfolgreich gespeichert!",
        description: `Artikel "${suggestion}" wurde gespeichert.`,
        variant: "success",
      });
    } catch (err: any) {
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
                <div className="text-red-600">Fehler: {item.error}</div>
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
