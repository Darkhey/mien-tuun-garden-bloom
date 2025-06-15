
import React from "react";
import { Button } from "@/components/ui/button";
import BlogPromptEditor from "./BlogPromptEditor";
import BlogArticleEditor from "./BlogArticleEditor";
import { BLOG_CATEGORIES, SEASONS } from "./blogHelpers";

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
  generated: string|null;
  setGenerated: (g: string|null) => void;

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
  canGenerate,
  editing, setEditing,
  generated, setGenerated,
  category, season, audiences, contentType, tags, excerpt, imageUrl,
  setDebugLogs,
  toast,
}) => {

  // Multi-Artikel-Generierung für alle Vorschläge
  const handleGenerateMultiple = async () => {
    setLoading(true);
    setGenerated(null);
    setEditing("");
    setDebugLogs((prev) => [...prev, `Starte Multi-Artikel-Generation für ${suggestionSelections.length} Vorschläge.`]);
    try {
      for (const sug of suggestionSelections) {
        setDebugLogs(prev => [...prev, `Sende Artikel-Request für Vorschlag "${sug}" an KI-Edge-Function.`]);
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
        setDebugLogs(prev => [...prev, "Artikel erfolgreich generiert für Vorschlag: " + sug]);
        toast({ title: "Artikel generiert", description: `Artikel zu "${sug}" erstellt.` });
      }
    } catch (err: any) {
      setDebugLogs(prev => [...prev, "Fehler bei Multi-Artikel-Generation: " + String(err.message || err)]);
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setLoading(false);
  };

  // Einzelartikel-Generierung (wie gehabt)
  const handleGenerate = async () => {
    setLoading(true);
    setGenerated(null);
    setEditing("");
    setDebugLogs((prev) => [...prev, "Starte Einzel-Artikel-Generation via KI-Edge-Function."]);
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

  return (
    <>
      {suggestionSelections.length > 0 && (
        <Button
          className="mb-4"
          onClick={handleGenerateMultiple}
          disabled={loading}
        >
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

      <BlogArticleEditor
        generated={generated}
        editing={editing}
        setEditing={setEditing}
        loading={loading}
        handleGenerate={handleGenerate}
        handleSave={() => {}} // Save-Logik ggf. noch herauslösen, da sie API/Supabase betrifft
        canGenerate={Boolean(prompt || input)}
      />
    </>
  );
};

export default BlogArticleWorkflow;
