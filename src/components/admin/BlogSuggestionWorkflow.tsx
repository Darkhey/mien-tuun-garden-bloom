
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BlogTopicSuggestions from "./BlogTopicSuggestions";
import { buildContextFromMeta } from "./blogHelpers";

const SUGGEST_FUNCTION_URL = "https://ublbxvpmoccmegtwaslh.functions.supabase.co/suggest-blog-topics";

interface BlogSuggestionWorkflowProps {
  topicInput: string;
  setTopicInput: (v: string) => void;
  category: string;
  season: string;
  audiences: string[];
  contentType: string[];
  tags: string[];
  excerpt: string;
  imageUrl: string;
  suggestionSelections: string[];
  setSuggestionSelections: React.Dispatch<React.SetStateAction<string[]>>;
  setDebugLogs: React.Dispatch<React.SetStateAction<string[]>>;
  loading: boolean;
  setLoading: (l: boolean) => void;
  isSuggesting: boolean;
  setIsSuggesting: (s: boolean) => void;
  suggestions: string[];
  setSuggestions: (s: string[]) => void;
}

const BlogSuggestionWorkflow: React.FC<BlogSuggestionWorkflowProps> = ({
  topicInput, setTopicInput, category, season, audiences, contentType, tags, excerpt, imageUrl,
  suggestionSelections, setSuggestionSelections, setDebugLogs,
  loading, setLoading, isSuggesting, setIsSuggesting, suggestions, setSuggestions,
}) => {
  
  const handleSuggest = async () => {
    setIsSuggesting(true);
    setDebugLogs(prev => [...prev, "Starte Themenvorschlags-Request an KI-Edge-Function."]);
    try {
      const context = buildContextFromMeta({ category, season, audiences, contentType, tags, excerpt, imageUrl });
      const keyword = topicInput || context || "Bitte nur knackige, inspirierende Titel zurückgeben.";
      setDebugLogs(prev => [...prev, "Sende POST an: " + SUGGEST_FUNCTION_URL]);
      const response = await fetch(SUGGEST_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      const data = await response.json();
      setDebugLogs(prev => [...prev, "Antwort erhalten (Status: " + response.status + ")"]);
      setDebugLogs(prev => [...prev, "Edge-Function Rückgabe: " + JSON.stringify(data, null, 2)]);
      if (!response.ok || !data.topics) throw new Error(data?.error ?? "Fehler bei der KI");
      
      // Entferne doppelte Anführungszeichen und bereinige die Themen
      const cleanedTopics = data.topics.map((topic: string) => {
        // Entferne führende und abschließende Anführungszeichen
        return topic.replace(/^"(.*)"$/, '$1');
      });
      
      setSuggestions(cleanedTopics);
      setDebugLogs(prev => [...prev, "Vorschläge extrahiert: " + JSON.stringify(cleanedTopics, null, 2)]);
    } catch (err: any) {
      setDebugLogs(prev => [...prev, "Fehler bei Themenvorschlägen: " + String(err.message || err)]);
    }
    setIsSuggesting(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSuggestionSelections((prev: string[]) => 
      prev.includes(suggestion) 
        ? prev.filter(s => s !== suggestion)
        : [...prev, suggestion]
    );
  };

  return (
    <div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Thema/Stichwort (optional)</label>
        <Input
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          placeholder="z.B. 'Herbstgarten', 'Meal Prep', 'Urban Gardening'..."
          disabled={loading || isSuggesting}
        />
      </div>
      <Button
        onClick={handleSuggest}
        disabled={loading || isSuggesting}
        className="mb-4"
      >
        {isSuggesting && <span className="mr-2 w-4 h-4 animate-spin border-2 border-white/20 border-t-white rounded-full inline-block" />}
        Themenvorschläge generieren
      </Button>
      {suggestions.length > 0 && (
        <BlogTopicSuggestions
          topicInput={topicInput}
          setTopicInput={setTopicInput}
          isSuggesting={isSuggesting}
          loading={loading}
          handleSuggestTopics={handleSuggest}
          suggestions={suggestions}
          selected={suggestionSelections}
          onSuggestionClick={handleSuggestionClick}
        />
      )}
    </div>
  );
};

export default BlogSuggestionWorkflow;
