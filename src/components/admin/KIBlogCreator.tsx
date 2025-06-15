import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import TagSelector from "./TagSelector";
import BlogMetaSection from "./BlogMetaSection";
import BlogTopicSuggestions from "./BlogTopicSuggestions";
import BlogPromptEditor from "./BlogPromptEditor";
import BlogArticleEditor from "./BlogArticleEditor";

const BLOG_CATEGORIES = [
  { value: "gartenplanung", label: "Gartenplanung" },
  { value: "saisonale-kueche", label: "Saisonale Küche" },
  { value: "nachhaltigkeit", label: "Nachhaltigkeit" },
  { value: "diY-projekte", label: "DIY Projekte" },
  { value: "ernte", label: "Ernte" },
  { value: "selbstversorgung", label: "Selbstversorgung" },
  { value: "tipps-tricks", label: "Tipps & Tricks" },
  { value: "sonstiges", label: "Sonstiges" },
];

// Zielgruppen für Blogartikel
const AUDIENCE_OPTIONS = [
  "Anfänger", "Fortgeschrittene", "Familien", "Singles", "Kinder", "Senioren"
];

// Content-Typen für Blogartikel
const CONTENT_TYPE_OPTIONS = [
  "Anleitung", "Inspiration", "Ratgeber", "Checkliste", "Rezeptsammlung"
];

const SEASONS = [
  { value: "frühling", label: "Frühling" },
  { value: "sommer", label: "Sommer" },
  { value: "herbst", label: "Herbst" },
  { value: "winter", label: "Winter" },
  { value: "ganzjährig", label: "Ganzjährig" },
];

const TAG_OPTIONS = [
  "Schnell", "Kinder", "Tipps", "DIY", "Low Budget", "Bio", "Natur", "Regional", "Saisonal", "Nachhaltig", "Praktisch", "Dekor", "Haushalt",
  "Step-by-Step", "Checkliste", "Inspiration"
];

const SUGGESTION_FUNCTION_URL = "https://ublbxvpmoccmegtwaslh.functions.supabase.co/suggest-blog-topics";
const GENERATE_FUNCTION_URL = "https://ublbxvpmoccmegtwaslh.functions.supabase.co/generate-blog-post";

// Dynamische Trend-Tags pro Kategorie/Saison (Beispielbasis)
const TREND_TAGS = {
  gartenplanung: ["Permakultur", "No-Dig", "Biogarten", "Hochbeet"],
  "saisonale-kueche": ["Meal Prep", "Zero Waste", "Fermentieren", "One Pot"],
  nachhaltigkeit: ["Plastikfrei", "Regenerativ", "Naturgarten"],
  "diY-projekte": ["Upcycling", "Balkonideen"],
  ernte: ["Haltbarmachen", "Kräutergarten", "Vorrat"],
  selbstversorgung: ["Unabhängigkeit", "Microgreens", "Wildkräuter"],
  "tipps-tricks": ["Tool Hacks", "Schädlingskontrolle"],
  sonstiges: ["Inspiration"],
  default: ["Nachhaltig", "DIY", "Tipps"]
};

function getTrendTags(category: string, season: string) {
  const catTags = TREND_TAGS[category as keyof typeof TREND_TAGS] || TREND_TAGS.default;
  const seasonTag = season ? [season.charAt(0).toUpperCase() + season.slice(1)] : [];
  return Array.from(new Set([...catTags, ...seasonTag]));
}

const KIBlogCreator: React.FC = () => {
  const [topicInput, setTopicInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const [suggestionSelections, setSuggestionSelections] = useState<string[]>([]);

  const [input, setInput] = useState(""); // Themenwahl oder Prompt
  const [prompt, setPrompt] = useState("");
  const [isPromptImproved, setIsPromptImproved] = useState(false);

  const [generated, setGenerated] = useState<string | null>(null);
  const [editing, setEditing] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(""); // Artikel-Kategorie
  const [season, setSeason] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [audiences, setAudiences] = useState<string[]>([]);
  const [contentType, setContentType] = useState<string[]>([]);
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [dynamicTags, setDynamicTags] = useState<string[]>([]);
  const { toast } = useToast();

  // Hilfsfunktion: Kontext-String aus allen Metadaten erzeugen
  function buildContextFromMeta() {
    const contextParts = [
      category ? `Kategorie: ${BLOG_CATEGORIES.find(c => c.value === category)?.label ?? category}.` : "",
      season ? `Saison: ${SEASONS.find(s => s.value === season)?.label ?? season}.` : "",
      audiences.length ? `Zielgruppe: ${audiences.join(", ")}.` : "",
      contentType.length ? `Artikel-Typ/Format: ${contentType.join(", ")}.` : "",
      tags.length ? `Tags: ${tags.join(", ")}.` : "",
      excerpt ? `Kurzbeschreibung/Teaser: ${excerpt}` : "",
      imageUrl ? `Bild: ${imageUrl}` : "",
      "Bitte nur knackige, inspirierende Titel zurückgeben."
    ];
    return [topicInput || input, ...contextParts].filter(Boolean).join(" ");
  }

  // Themenvorschlag per Edge Function holen (nun nur noch 3 Vorschläge, Input inkl. aller Metadaten)
  const handleSuggestTopics = async () => {
    setIsSuggesting(true);
    setSuggestions([]);
    setSuggestionSelections([]);
    try {
      const context = buildContextFromMeta();
      const response = await fetch(SUGGESTION_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: context }),
      });
      const data = await response.json();
      if (!response.ok || !data.topics) throw new Error(data?.error ?? "Fehler beim Vorschlag");

      // Maximal 3 Vorschläge aus der KI-Antwort extrahieren
      const regex = /(?:\d+\.\s*)?(.*?)(?:\n|$)/g;
      const topics = [];
      let match;
      while ((match = regex.exec(data.topics))) {
        if (match[1]?.trim()) topics.push(match[1].trim());
      }
      setSuggestions(topics.slice(0, 3));
    } catch (err: any) {
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setIsSuggesting(false);
  };

  // Dynamische Tag-Sammlung je nach Kategorie & Saison
  useEffect(() => {
    // Dynamische Tag-Sammlung je nach Kategorie & Saison
    const trendTags = getTrendTags(category, season);
    setDynamicTags(Array.from(new Set([...TAG_OPTIONS, ...trendTags])));
  }, [category, season]);

  // Inhalt der Vorschlagsauswahl als Main-Prompt oder als Array speichern
  const handleSuggestionSelect = (s: string) => {
    setPrompt("");
    setIsPromptImproved(false);
    setInput(""); // Verhindert Kollision mit Custom Prompt
    setSuggestionSelections(prev =>
      prev.includes(s)
        ? prev.filter(item => item !== s)
        : [...prev, s]
    );
  };

  // Artikel für ALLE gewählten Vorschläge generieren (jeweils als einzelnes KI-Request)
  const handleGenerateMultiple = async () => {
    setLoading(true);
    setGenerated(null);
    setEditing("");
    try {
      for (const sug of suggestionSelections) {
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

        const response = await fetch(GENERATE_FUNCTION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: fullPrompt }),
        });
        const data = await response.json();
        if (!response.ok || !data.content) throw new Error(data?.error ?? "Fehler bei der KI");
        // Zeige nacheinander die generierten Artikel im Editor
        setGenerated(data.content);
        setEditing(data.content);
        // Optional: toast oder Info für Batch-Fortschritt ausgeben
        toast({ title: "Artikel generiert", description: `Artikel zu "${sug}" erstellt.` });
      }
    } catch (err: any) {
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setLoading(false);
  };

  // Artikel generieren lassen
  const handleGenerate = async () => {
    setLoading(true);
    setGenerated(null);
    setEditing("");
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
      const response = await fetch(GENERATE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      const data = await response.json();
      if (!response.ok || !data.content) throw new Error(data?.error ?? "Fehler bei der KI");
      setGenerated(data.content);
      setEditing(data.content);
    } catch (err: any) {
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setLoading(false);
  };

  // Speichern des Artikels
  const handleSave = async () => {
    setLoading(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Nicht eingeloggt!");
      const slug = "blog-" + Date.now();
      const { error } = await supabase.from("blog_posts").insert([{
        slug,
        title: input,
        excerpt,
        content: editing,
        author: user.data.user.email,
        published: true,
        featured: false,
        featured_image: imageUrl,
        seo_title: "",
        seo_description: "",
        seo_keywords: tags,
        tags,
        category: category 
          ? BLOG_CATEGORIES.find(c => c.value === category)?.label ?? category
          : "Sonstiges",
        published_at: new Date().toISOString(),
        reading_time: 5,
        difficulty: "",
        season: season ? SEASONS.find(s => s.value === season)?.label ?? season : "",
        audiences: audiences,
        content_types: contentType,
      }]);
      if (error) throw error;
      toast({ title: "Erstellt!", description: "Der Blogartikel wurde angelegt." });
    } catch (err: any) {
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setLoading(false);
  };

  // Prompt-Optimierung: Hier als Placeholder einfach das aktuelle input-Feld in den Prompt schreiben
  const handleImprovePrompt = async () => {
    setLoading(true);
    try {
      // Placeholder: einfach das user input als prompt setzen (ersetzt durch KI-Call wenn gewünscht)
      setPrompt(input);
      setIsPromptImproved(true);
    } catch (err: any) {
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow max-w-xl mx-auto">
      <h2 className="font-bold text-lg mb-4">KI Blogartikel Generator</h2>
      {/* Meta-Formular */}
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
      {/* Themenvorschlag */}
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
      {/* Button: Generiere Artikel zu gewählten Vorschlägen */}
      {suggestionSelections.length > 0 && (
        <Button
          className="mb-4"
          onClick={handleGenerateMultiple}
          disabled={loading || isSuggesting}
        >
          Artikel für {suggestionSelections.length} Vorschlag{suggestionSelections.length > 1 ? "e" : ""} generieren
        </Button>
      )}

      {/* Prompt bearbeiten/editor */}
      <BlogPromptEditor
        input={input}
        setInput={setInput}
        prompt={prompt}
        setPrompt={setPrompt}
        handleImprovePrompt={handleImprovePrompt}
        isPromptImproved={isPromptImproved}
        loading={loading}
        isSuggesting={isSuggesting}
      />
      {/* Artikel generieren & Editor (Single Workflow für eigenen Prompt) */}
      <BlogArticleEditor
        generated={generated}
        editing={editing}
        setEditing={setEditing}
        loading={loading}
        handleGenerate={handleGenerate}
        handleSave={handleSave}
        canGenerate={Boolean(prompt || input)}
      />
    </div>
  );
};

export default KIBlogCreator;

// Das File ist inzwischen recht lang (>286 Zeilen). Bitte nach Bedarf eine Aufsplittung in kleinere Komponenten erwägen!
