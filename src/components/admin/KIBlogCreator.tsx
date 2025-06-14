
import React, { useState } from "react";
import { Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const SUGGESTION_FUNCTION_URL = "https://ublbxvpmoccmegtwaslh.functions.supabase.co/suggest-blog-topics";
const GENERATE_FUNCTION_URL = "https://ublbxvpmoccmegtwaslh.functions.supabase.co/generate-blog-post";

const KIBlogCreator: React.FC = () => {
  const [topicInput, setTopicInput] = useState(""); // Benutzer kann Oberbegriff eingeben
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const [input, setInput] = useState(""); // Themenwahl oder Prompt
  const [prompt, setPrompt] = useState(""); // Optimierter Prompt
  const [isPromptImproved, setIsPromptImproved] = useState(false);

  const [generated, setGenerated] = useState<string | null>(null); // Rohentwurf KI
  const [editing, setEditing] = useState<string>(""); // Editor
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Themenvorschlag per Edge Function holen
  const handleSuggestTopics = async () => {
    setIsSuggesting(true);
    setSuggestions([]);
    try {
      const response = await fetch(SUGGESTION_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: topicInput }),
      });
      const data = await response.json();
      if (!response.ok || !data.topics) throw new Error(data?.error ?? "Fehler beim Vorschlag");
      // Versuche, Markdown/Nummerierung zu entfernen und als Liste zu zeigen
      const regex = /(?:\d+\.\s*)?(.*?)(?:\n|$)/g;
      const topics = [];
      let match;
      while ((match = regex.exec(data.topics))) {
        if (match[1]?.trim()) topics.push(match[1].trim());
      }
      setSuggestions(topics);
    } catch (err: any) {
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setIsSuggesting(false);
  };

  // Prompt automatisch verbessern (optional, kann nochmals nachbearbeitet werden)
  const handleImprovePrompt = async () => {
    setLoading(true);
    try {
      // Wir nutzen OpenAI direkt über vorhandene Funktion, aber geben ein "Verbesserungs-Systemprompt"
      const response = await fetch(GENERATE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Formuliere diesen Blogartikel-Idee/Prompt noch einmal so um, dass eine KI daraus einen besonders inspirierenden, ausführlichen und suchmaschinenoptimierten Artikel mit Tipps und Alltagspraxis verfassen kann. Gib mir nur den verbesserten Prompt zurück:\n${input}`
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.content) throw new Error(data?.error ?? "Fehler bei Prompt-Optimierung");
      setPrompt(data.content.trim());
      setIsPromptImproved(true);
    } catch (err: any) {
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setLoading(false);
  };

  // Artikel generieren lassen (Prompt kann noch angepasst werden)
  const handleGenerate = async () => {
    setLoading(true);
    setGenerated(null);
    setEditing("");
    try {
      const response = await fetch(GENERATE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok || !data.content) throw new Error(data?.error ?? "Fehler bei der KI");
      setGenerated(data.content);
      setEditing(data.content); // Artikel vorschlagsweise in Editiermodus übernehmen
    } catch (err: any) {
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setLoading(false);
  };

  // Als Blogpost speichern (nach finaler Bestätigung)
  const handleSave = async () => {
    setLoading(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Nicht eingeloggt!");
      const slug = "blog-" + Date.now();
      const { error } = await supabase.from("blog_posts").insert([{
        slug,
        title: input,
        excerpt: "",
        content: editing,
        author: user.data.user.email,
        published: true,
        featured: false,
        featured_image: "",
        seo_title: "",
        seo_description: "",
        seo_keywords: [],
        tags: [],
        category: "Sonstiges",
        published_at: new Date().toISOString(),
        reading_time: 5
      }]);
      if (error) throw error;
      toast({ title: "Erstellt!", description: "Der Blogartikel wurde angelegt." });
    } catch (err: any) {
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow max-w-xl mx-auto">
      <h2 className="font-bold text-lg mb-4">KI Blogartikel Generator</h2>
      {/* Themenvorschlag */}
      <div className="flex gap-2 mb-2">
        <input
          className="border rounded px-2 py-1 flex-1"
          value={topicInput}
          onChange={e => setTopicInput(e.target.value)}
          placeholder="Schlagwort/Oberthema für Vorschläge (optional)"
          disabled={isSuggesting}
        />
        <Button
          variant="secondary"
          onClick={handleSuggestTopics}
          disabled={isSuggesting}
        >
          {isSuggesting && <Loader className="animate-spin w-4 h-4" />}
          Themenvorschläge
        </Button>
      </div>
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-3">
          <div className="text-xs mb-1 text-sage-700">Vorschläge:</div>
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <li key={i}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setInput(s); setPrompt(""); setIsPromptImproved(false); }}
                >
                  {s}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prompt bearbeiten */}
      <Textarea
        className="mb-2"
        rows={2}
        placeholder="Blogthema oder ausführlicher KI-Prompt (z.B. 'So wird dein Hochbeet im Sommer grün')"
        value={input}
        onChange={e => { setInput(e.target.value); setPrompt(""); setIsPromptImproved(false); }}
        disabled={loading || isSuggesting}
      />
      <Button
        onClick={handleImprovePrompt}
        className="mb-2"
        disabled={!input || loading || isSuggesting || isPromptImproved}
        variant="secondary"
      >
        {loading && !isPromptImproved && <Loader className="w-4 h-4 animate-spin" />}
        Prompt von KI optimieren
      </Button>

      {/* Optimierter Prompt */}
      {prompt && (
        <div className="mb-2">
          <div className="text-xs text-sage-700 mb-1">Verbesserter Prompt:</div>
          <Textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={3}
            className="mb-2"
            disabled={loading}
          />
        </div>
      )}

      {/* Artikel generieren */}
      <Button
        onClick={handleGenerate}
        className="mb-2"
        disabled={loading || !prompt}
      >
        {loading && !generated && <Loader className="w-4 h-4 animate-spin" />}
        KI-Artikel generieren
      </Button>
      {/* Entwurf Editor & Bestätigung zum Speichern */}
      {generated && (
        <div className="mt-4 border-t pt-4">
          <div className="text-xs text-sage-700 mb-1">Artikel-Entwurf (anpassbar, Markdown möglich):</div>
          <Textarea
            className="mb-2"
            rows={12}
            value={editing}
            onChange={e => setEditing(e.target.value)}
            disabled={loading}
          />
          <Button
            className="mt-2"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
            Bestätigen & speichern
          </Button>
        </div>
      )}
    </div>
  );
};

export default KIBlogCreator;
