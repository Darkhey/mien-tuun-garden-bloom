
import React from "react";
import TagSelector from "./TagSelector";

const CATEGORY_OPTIONS = [
  { value: "gartenplanung", label: "Gartenplanung" },
  { value: "aussaat-pflanzung", label: "Aussaat & Pflanzung" },
  { value: "pflanzenpflege", label: "Pflanzenpflege" },
  { value: "schaedlingsbekaempfung", label: "Schädlingsbekämpfung" },
  { value: "kompostierung", label: "Kompostierung" },
  { value: "saisonale-kueche", label: "Saisonale Küche" },
  { value: "konservieren-haltbarmachen", label: "Konservieren & Haltbarmachen" },
  { value: "kraeuter-heilpflanzen", label: "Kräuter & Heilpflanzen" },
  { value: "nachhaltigkeit", label: "Nachhaltigkeit" },
  { value: "wassersparen-bewaesserung", label: "Wassersparen & Bewässerung" },
  { value: "diY-projekte", label: "DIY Projekte" },
  { value: "gartengeraete-werkzeuge", label: "Gartengeräte & Werkzeuge" },
  { value: "ernte", label: "Ernte" },
  { value: "lagerung-vorratshaltung", label: "Lagerung & Vorratshaltung" },
  { value: "selbstversorgung", label: "Selbstversorgung" },
  { value: "permakultur", label: "Permakultur" },
  { value: "urban-gardening", label: "Urban Gardening" },
  { value: "balkon-terrasse", label: "Balkon & Terrasse" },
  { value: "indoor-gardening", label: "Indoor Gardening" },
  { value: "tipps-tricks", label: "Tipps & Tricks" },
  { value: "jahreszeitliche-arbeiten", label: "Jahreszeitliche Arbeiten" },
  { value: "bodenpflege", label: "Bodenpflege" },
  { value: "sonstiges", label: "Sonstiges" },
];

const DIFFICULTY = [
  { value: "leicht", label: "Leicht" },
  { value: "mittel", label: "Mittel" },
  { value: "schwer", label: "Schwer" },
];

const SEASONS = [
  { value: "frühling", label: "Frühling" },
  { value: "sommer", label: "Sommer" },
  { value: "herbst", label: "Herbst" },
  { value: "winter", label: "Winter" },
  { value: "ganzjährig", label: "Ganzjährig" },
];

const TAG_OPTIONS = [
  "Schnell", "Kinder", "Tipps", "DIY", "Low Budget", "Bio", "Natur", "Regional", "Saisonal", 
  "Nachhaltig", "Praktisch", "Dekor", "Haushalt", "Anfänger", "Fortgeschritten", "Profi",
  "Urban", "Balkon", "Indoor", "Outdoor", "Wassersparend", "Biologisch", "Permakultur"
];

interface BlogMetaFormProps {
  category: string;
  setCategory: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
  season: string;
  setSeason: (v: string) => void;
  tags: string[];
  setTags: (v: string[]) => void;
  excerpt: string;
  setExcerpt: (v: string) => void;
  imageUrl: string;
  setImageUrl: (v: string) => void;
  disabled?: boolean;
}

const BlogMetaForm: React.FC<BlogMetaFormProps> = ({
  category, setCategory,
  difficulty, setDifficulty,
  season, setSeason,
  tags, setTags,
  excerpt, setExcerpt,
  imageUrl, setImageUrl,
  disabled = false
}) => (
  <div className="mb-2 grid grid-cols-2 gap-2">
    <div>
      <label className="block text-xs mb-1">Kategorie</label>
      <select
        className="border rounded px-2 py-1 w-full"
        value={category}
        onChange={e => setCategory(e.target.value)}
        disabled={disabled}
      >
        <option value="">Keine Auswahl</option>
        {CATEGORY_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-xs mb-1">Schwierigkeitsgrad</label>
      <select
        className="border rounded px-2 py-1 w-full"
        value={difficulty}
        onChange={e => setDifficulty(e.target.value)}
        disabled={disabled}
      >
        <option value="">Keine Auswahl</option>
        {DIFFICULTY.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-xs mb-1">Saison (optional)</label>
      <select
        className="border rounded px-2 py-1 w-full"
        value={season}
        onChange={e => setSeason(e.target.value)}
        disabled={disabled}
      >
        <option value="">Keine Auswahl</option>
        {SEASONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
    <div className="col-span-2">
      <label className="block text-xs mb-1">Tags (Mehrfachauswahl)</label>
      <TagSelector options={TAG_OPTIONS} selected={tags} setSelected={setTags} disabled={disabled} />
    </div>
    <div className="col-span-2">
      <label className="block text-xs mb-1">Kurz-Teaser oder Excerpt (optional)</label>
      <textarea
        className="w-full border rounded p-2"
        rows={2}
        value={excerpt}
        onChange={e => setExcerpt(e.target.value)}
        disabled={disabled}
        placeholder="Kurze Einleitung oder Vorschau für den Artikel …"
      />
    </div>
    <div className="col-span-2">
      <label className="block text-xs mb-1">Artikelbild (URL, optional)</label>
      <input
        type="url"
        className="w-full border rounded p-2"
        placeholder="https://beispiel.de/bild.jpg"
        value={imageUrl}
        onChange={e => setImageUrl(e.target.value)}
        disabled={disabled}
      />
    </div>
  </div>
);

export default BlogMetaForm;
