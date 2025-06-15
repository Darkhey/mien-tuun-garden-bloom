
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import TagSelector from "./TagSelector";
import BlogMetaSection from "./BlogMetaSection";
import MetaDebugTerminal from "./MetaDebugTerminal";
import BlogSuggestionWorkflow from "./BlogSuggestionWorkflow";
import BlogArticleWorkflow from "./BlogArticleWorkflow";
import { getTrendTags, buildContextFromMeta } from "./blogHelpers";

const TAG_OPTIONS = [
  "Schnell", "Kinder", "Tipps", "DIY", "Low Budget", "Bio", "Natur", "Regional", "Saisonal", "Nachhaltig", "Praktisch", "Dekor", "Haushalt",
  "Step-by-Step", "Checkliste", "Inspiration"
];

const KIBlogCreator: React.FC = () => {
  // Alle State-Variablen wie zuvor
  const [topicInput, setTopicInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionSelections, setSuggestionSelections] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isPromptImproved, setIsPromptImproved] = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);
  const [editing, setEditing] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [season, setSeason] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [audiences, setAudiences] = useState<string[]>([]);
  const [contentType, setContentType] = useState<string[]>([]);
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [dynamicTags, setDynamicTags] = useState<string[]>([]);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const { toast } = useToast();

  // Zustand für Prompteditor
  const handleImprovePrompt = async () => {
    setLoading(true);
    setIsPromptImproved(true);
    setPrompt(input);
    setLoading(false);
  };

  useEffect(() => {
    // Dynamische Tag-Sammlung je nach Kategorie & Saison
    const trendTags = getTrendTags(category, season);
    setDynamicTags(Array.from(new Set([...TAG_OPTIONS, ...trendTags])));
  }, [category, season]);

  return (
    <div className="bg-white p-5 rounded-xl shadow max-w-xl mx-auto">
      <h2 className="font-bold text-lg mb-4">KI Blogartikel Generator</h2>
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
      <BlogArticleWorkflow
        suggestionSelections={suggestionSelections}
        loading={loading}
        setLoading={setLoading}
        prompt={prompt}
        setPrompt={setPrompt}
        input={input}
        setInput={setInput}
        isPromptImproved={isPromptImproved}
        setIsPromptImproved={setIsPromptImproved}
        handleImprovePrompt={handleImprovePrompt}
        canGenerate={Boolean(prompt || input)}
        editing={editing}
        setEditing={setEditing}
        generated={generated}
        setGenerated={setGenerated}
        category={category}
        season={season}
        audiences={audiences}
        contentType={contentType}
        tags={tags}
        excerpt={excerpt}
        imageUrl={imageUrl}
        setDebugLogs={setDebugLogs}
        toast={toast}
      />
      <MetaDebugTerminal logs={debugLogs} />
    </div>
  );
};

export default KIBlogCreator;
