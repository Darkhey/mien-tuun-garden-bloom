
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import TagSelector from "./TagSelector";
import BlogMetaSection from "./BlogMetaSection";
import MetaDebugTerminal from "./MetaDebugTerminal";
import BlogSuggestionWorkflow from "./BlogSuggestionWorkflow";
import EnhancedBlogArticleEditor from "./EnhancedBlogArticleEditor";
import { getTrendTags, buildContextFromMeta } from "./blogHelpers";

const TAG_OPTIONS = [
  "Schnell", "Kinder", "Tipps", "DIY", "Low Budget", "Bio", "Natur", "Regional", "Saisonal", "Nachhaltig", "Praktisch", "Dekor", "Haushalt",
  "Step-by-Step", "Checkliste", "Inspiration"
];

const KIBlogCreator: React.FC = () => {
  // Meta-Informationen State
  const [category, setCategory] = useState("");
  const [season, setSeason] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [audiences, setAudiences] = useState<string[]>([]);
  const [contentType, setContentType] = useState<string[]>([]);
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [dynamicTags, setDynamicTags] = useState<string[]>([]);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  // Suggestion Workflow State
  const [topicInput, setTopicInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionSelections, setSuggestionSelections] = useState<string[]>([]);
  
  // Enhanced Editor State
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    // Dynamische Tag-Sammlung je nach Kategorie & Saison
    const trendTags = getTrendTags(category, season);
    setDynamicTags(Array.from(new Set([...TAG_OPTIONS, ...trendTags])));
  }, [category, season]);

  const handleSaveArticle = async (content: string, title: string, quality: any) => {
    try {
      console.log("Speichere Artikel:", { title, quality: quality.score });
      toast({
        title: "Artikel gespeichert!",
        description: `"${title}" wurde erfolgreich gespeichert.`,
      });
      
      // Reset nach dem Speichern
      setSelectedPrompt("");
      setSuggestionSelections([]);
      setDebugLogs(prev => [...prev, `Artikel "${title}" erfolgreich gespeichert`]);
    } catch (error: any) {
      console.error("Fehler beim Speichern:", error);
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow max-w-4xl mx-auto">
      <h2 className="font-bold text-lg mb-4">KI Blogartikel Generator</h2>
      
      {/* Meta-Informationen */}
      <BlogMetaSection
        category={category}
        setCategory={setCategory}
        season={season}
        setSeason={setSeason}
        audiences={audiences}
        setAudiences={setAudiences}
        contentType={contentType}
        setContentType={setContentType}
        excerpt={excerpt}
        setExcerpt={setExcerpt}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        tags={tags}
        setTags={setTags}
        dynamicTags={dynamicTags}
        loading={loading || isSuggesting}
      />

      {/* Suggestion Workflow */}
      <BlogSuggestionWorkflow
        topicInput={topicInput}
        setTopicInput={setTopicInput}
        category={category}
        season={season}
        audiences={audiences}
        contentType={contentType}
        tags={tags}
        excerpt={excerpt}
        imageUrl={imageUrl}
        suggestionSelections={suggestionSelections}
        setSuggestionSelections={setSuggestionSelections}
        setDebugLogs={setDebugLogs}
        loading={loading}
        setLoading={setLoading}
        isSuggesting={isSuggesting}
        setIsSuggesting={setIsSuggesting}
        suggestions={suggestions}
        setSuggestions={setSuggestions}
      />

      {/* Enhanced Artikel Editor */}
      {suggestionSelections.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Artikel für ausgewählte Vorschläge generieren:</h3>
          {suggestionSelections.map((suggestion, idx) => (
            <div key={idx} className="mb-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-2">{suggestion}</h4>
              <EnhancedBlogArticleEditor
                initialPrompt={suggestion}
                onSave={handleSaveArticle}
                category={category}
                season={season}
                audiences={audiences}
                contentType={contentType}
                tags={tags}
                excerpt={excerpt}
                imageUrl={imageUrl}
              />
            </div>
          ))}
        </div>
      )}

      {/* Einzelartikel Editor (wenn keine Suggestions ausgewählt) */}
      {suggestionSelections.length === 0 && selectedPrompt && (
        <div className="mt-6">
          <EnhancedBlogArticleEditor
            initialPrompt={selectedPrompt}
            onSave={handleSaveArticle}
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

      {/* Debug Terminal */}
      <MetaDebugTerminal logs={debugLogs} />
    </div>
  );
};

export default KIBlogCreator;
