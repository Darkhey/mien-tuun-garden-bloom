
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BlogTopicSuggestions from "./BlogTopicSuggestions";
import { buildContextFromMeta } from "./blogHelpers";
import { generateSlug } from "@/utils/blogSeo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  toast: ReturnType<typeof useToast>["toast"];
}

const BlogSuggestionWorkflow: React.FC<BlogSuggestionWorkflowProps> = ({
  topicInput, setTopicInput, category, season, audiences, contentType, tags, excerpt, imageUrl,
  suggestionSelections, setSuggestionSelections, setDebugLogs,
  loading, setLoading, isSuggesting, setIsSuggesting, suggestions, setSuggestions,
  toast,
}) => {
  
  const handleSuggest = async () => {
    setIsSuggesting(true);
    setDebugLogs(prev => [...prev, "Starte Themenvorschlags-Request via Supabase Client."]);
    try {
      const context = buildContextFromMeta({ category, season, audiences, contentType, tags, excerpt, imageUrl });
      const keyword = topicInput || context || "Bitte nur knackige, inspirierende Titel zurückgeben.";
      
      const { data, error } = await supabase.functions.invoke('suggest-blog-topics', {
        body: { keyword },
      });

      if (error) {
        throw new Error(`Edge Function Fehler: ${error.message}`);
      }

      setDebugLogs(prev => [...prev, "Antwort erhalten"]);
      
      const { topics } = data;

      if (!topics) {
        throw new Error("Keine Themenvorschläge von der KI erhalten.");
      }
      
      setDebugLogs(prev => [...prev, "Edge-Function Rückgabe: " + JSON.stringify(data, null, 2)]);
      
      // Entferne doppelte Anführungszeichen und bereinige die Themen
      const cleanedTopics = topics.map((topic: string) => {
        // Entferne führende und abschließende Anführungszeichen
        return topic.replace(/^"(.*)"$/, '$1');
      });

      try {
        const rows = cleanedTopics.map((title: string) => ({
          slug: generateSlug(title),
          title,
          reason: 'suggested',
          context: { keyword, category, season, audiences, contentType, tags }
        }));
        await supabase.from('blog_topic_history').insert(rows);
      } catch (dbErr: any) {
        console.error('Fehler beim Speichern der Themen:', dbErr);
        setDebugLogs(prev => [...prev, `Fehler beim Speichern: ${dbErr.message}`]);
      }

      setSuggestions(cleanedTopics);
      setDebugLogs(prev => [...prev, "Vorschläge extrahiert: " + JSON.stringify(cleanedTopics, null, 2)]);
    } catch (err: any) {
      setDebugLogs(prev => [...prev, "Fehler bei Themenvorschlägen: " + String(err.message || err)]);
      toast({
        title: "Fehler bei Themenvorschlägen",
        description: err.message || "Die KI konnte keine Vorschläge generieren.",
        variant: "destructive",
      });
    }
    setIsSuggesting(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSuggestionSelections((prev) => 
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

