
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import BlogTopicSuggestions from "./BlogTopicSuggestions";
import { buildContextFromMeta } from "./blogHelpers";

const SUGGESTION_FUNCTION_URL = "https://ublbxvpmoccmegtwaslh.functions.supabase.co/suggest-blog-topics";

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
  setSuggestionSelections: (v: string[]) => void;
  setDebugLogs: React.Dispatch<React.SetStateAction<string[]>>;
  loading: boolean;
  setLoading: (l: boolean) => void;
  isSuggesting: boolean;
  setIsSuggesting: (s: boolean) => void;
  suggestions: string[];
  setSuggestions: (s: string[]) => void;
}

const BlogSuggestionWorkflow: React.FC<BlogSuggestionWorkflowProps> = ({
  topicInput, setTopicInput,
  category, season,
  audiences, contentType, tags, excerpt, imageUrl,
  suggestionSelections, setSuggestionSelections,
  setDebugLogs,
  loading, setLoading,
  isSuggesting, setIsSuggesting,
  suggestions, setSuggestions
}) => {
  const { toast } = useToast();

  // Themenvorschlag per Edge Function holen
  const handleSuggestTopics = async () => {
    setIsSuggesting(true);
    setSuggestions([]);
    setSuggestionSelections([]);
    setDebugLogs((prev) => [...prev, "Starte Themenvorschlags-Request an KI-Edge-Function."]);
    try {
      const context = buildContextFromMeta({
        topicInput, category, season, audiences, contentType, tags, excerpt, imageUrl
      });
      setDebugLogs(prev => [...prev, "Sende POST an: " + SUGGESTION_FUNCTION_URL]);
      const response = await fetch(SUGGESTION_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: context }),
      });

      const data = await response.json().catch(() => ({}));
      setDebugLogs(prev => [...prev, "Antwort erhalten (Status: " + response.status + ")", "Edge-Function Rückgabe: " + JSON.stringify(data, null, 2)]);
      if (!response.ok || !data.topics) {
        setDebugLogs(prev => [...prev, "Fehler beim Vorschlag: " + (data?.error || "Unbekannter Fehler")]);
        toast({ title: "Fehler", description: String(data?.error || "Fehler beim Vorschlag"), variant: "destructive" });
        setSuggestions([]);
        return;
      }

      if (!Array.isArray(data.topics) || data.topics.length === 0) {
        setDebugLogs(prev => [...prev, "Kein Thema extrahiert (topics leeres Array)."]);
        toast({ title: "Keine Vorschläge", description: "Die KI hat keine brauchbaren Themen zurückgegeben.", variant: "destructive" });
        setSuggestions([]);
        return;
      }
      setDebugLogs(prev => [...prev, "Vorschläge extrahiert: " + JSON.stringify(data.topics)]);
      setSuggestions(data.topics.slice(0, 3));
    } catch (err: any) {
      setDebugLogs(prev => [...prev, "Fehler beim Themenvorschlag: " + String(err.message || err)]);
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
      setSuggestions([]);
    }
    setIsSuggesting(false);
  };

  // Inhalt der Vorschlagsauswahl als Main-Prompt oder als Array speichern
  const handleSuggestionSelect = (s: string) => {
    setSuggestionSelections(prev =>
      prev.includes(s)
        ? prev.filter(item => item !== s)
        : [...prev, s]
    );
  };

  return (
    <BlogTopicSuggestions
      topicInput={topicInput}
      setTopicInput={setTopicInput}
      isSuggesting={isSuggesting}
      loading={loading}
      handleSuggestTopics={handleSuggestTopics}
      suggestions={suggestions}
      selected={suggestionSelections}
      onSuggestionClick={handleSuggestionSelect}
    />
  );
};

export default BlogSuggestionWorkflow;
