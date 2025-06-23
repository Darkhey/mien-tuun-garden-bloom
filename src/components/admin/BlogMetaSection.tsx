import React from "react";
import TagSelector from "./TagSelector";

interface BlogMetaSectionProps {
  category: string;
  setCategory: (v: string) => void;
  season: string;
  setSeason: (v: string) => void;
  audiences: string[];
  setAudiences: (v: string[]) => void;
  contentType: string[];
  setContentType: (v: string[]) => void;
  excerpt: string;
  setExcerpt: (v: string) => void;
  imageUrl: string;
  setImageUrl: (v: string) => void;
  tags: string[];
  setTags: (v: string[]) => void;
  dynamicTags: string[];
  loading: boolean;
}

const BLOG_CATEGORIES = [
  { value: "allgemein", label: "Allgemein" },
  { value: "gartentipps", label: "Gartentipps" },
  { value: "garten", label: "Garten" },
  { value: "gartenplanung", label: "Gartenplanung" },
  { value: "küche", label: "Küche" },
  { value: "nachhaltigkeit", label: "Nachhaltigkeit" },
];

const SEASONS = [
  { value: "frühling", label: "Frühling" },
  { value: "sommer", label: "Sommer" },
  { value: "herbst", label: "Herbst" },
  { value: "winter", label: "Winter" },
  { value: "ganzjährig", label: "Ganzjährig" },
];

const AUDIENCE_OPTIONS = [
  "Anfänger", "Fortgeschrittene", "Familien", "Singles", "Kinder", "Senioren"
];

const CONTENT_TYPE_OPTIONS = [
  "Anleitung", "Inspiration", "Ratgeber", "Checkliste", "Rezeptsammlung"
];

const BlogMetaSection: React.FC<BlogMetaSectionProps> = ({
  category, setCategory,
  season, setSeason,
  audiences, setAudiences,
  contentType, setContentType,
  excerpt, setExcerpt,
  imageUrl, setImageUrl,
  tags, setTags,
  dynamicTags,
  loading
}) => (
  <div className="mb-2 grid gap-2">
    <div>
      <label className="block text-xs mb-1">Kategorie (optional)</label>
      <select
        className="w-full border rounded p-2"
        value={category}
        onChange={e => setCategory(e.target.value)}
        disabled={loading}
      >
        <option value="">–</option>
        {BLOG_CATEGORIES.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-xs mb-1">Saison (optional)</label>
      <select
        className="w-full border rounded p-2"
        value={season}
        onChange={e => setSeason(e.target.value)}
        disabled={loading}
      >
        <option value="">–</option>
        {SEASONS.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-xs mb-1">Zielgruppe (optional, mehrere möglich)</label>
      <TagSelector
        options={AUDIENCE_OPTIONS}
        selected={audiences}
        setSelected={setAudiences}
        disabled={loading}
      />
    </div>
    <div>
      <label className="block text-xs mb-1">Artikel-Typ/Format (optional, mehrere möglich)</label>
      <TagSelector
        options={CONTENT_TYPE_OPTIONS}
        selected={contentType}
        setSelected={setContentType}
        disabled={loading}
      />
    </div>
    <div>
      <label className="block text-xs mb-1">Kurz-Teaser oder Excerpt (optional)</label>
      <textarea
        value={excerpt}
        onChange={e => setExcerpt(e.target.value)}
        rows={2}
        className="w-full border rounded mb-2 p-2"
        placeholder="Kurze Einleitung oder Vorschau für den Artikel …"
        disabled={loading}
      />
    </div>
    <div>
      <label className="block text-xs mb-1">Artikelbild (URL, optional)</label>
      <input
        type="url"
        className="w-full border rounded p-2"
        placeholder="https://beispiel.de/bild.jpg"
        value={imageUrl}
        onChange={e => setImageUrl(e.target.value)}
        disabled={loading}
      />
    </div>
    <div>
      <label className="block text-xs mb-1">Tags (optional, mehrere möglich – Vorschläge werden angepasst)</label>
      <TagSelector
        options={dynamicTags}
        selected={tags}
        setSelected={setTags}
        disabled={loading}
      />
    </div>
  </div>
);

export default BlogMetaSection;
