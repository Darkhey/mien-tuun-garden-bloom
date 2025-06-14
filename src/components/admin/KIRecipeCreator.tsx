
import React, { useState } from "react";
import { Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Ernährungsformen und Mahlzeiten für Auswahlfelder
const DIETS = [
  { value: "omnivor", label: "Omnivor" },
  { value: "vegetarisch", label: "Vegetarisch" },
  { value: "vegan", label: "Vegan" },
  { value: "pescetarisch", label: "Pescetarisch" },
  { value: "glutenfrei", label: "Glutenfrei" },
  { value: "laktosefrei", label: "Laktosefrei" },
];
const MEALS = [
  { value: "frühstück", label: "Frühstück" },
  { value: "mittag", label: "Mittagessen" },
  { value: "abend", label: "Abendessen" },
  { value: "snack", label: "Snack" },
  { value: "dessert", label: "Dessert" },
];

const KIRecipeCreator: React.FC = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [manualRecipe, setManualRecipe] = useState<any>(null);
  const { toast } = useToast();

  // Zusätzliche auswählbare Felder
  const [diet, setDiet] = useState("");
  const [meal, setMeal] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // KI Rezept generieren
  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setIsEditing(false);
    setManualRecipe(null);
    try {
      const resp = await fetch("https://ublbxvpmoccmegtwaslh.functions.supabase.co/blog-to-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: input, content: input, image: "" }),
      });
      if (!resp.ok) throw new Error("Fehler bei der KI");
      const { recipe } = await resp.json();
      setResult(recipe);
      // Starte Bearbeitungsmodus direkt mit generiertem Rezept
      setManualRecipe({
        ...recipe,
        diet: "",
        meal: "",
        tags: [],
      });
      setIsEditing(true);
    } catch (err: any) {
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setLoading(false);
  };

  // Rezept nach Editing speichern
  const handleSave = async () => {
    if (!manualRecipe?.title) return;
    setLoading(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Nicht eingeloggt!");
      // Bilde Slug
      const slug = manualRecipe.title
        ? manualRecipe.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")
        : String(Date.now());
      // Übertrage zusätzliche Felder direkt in DB
      const insertObj = {
        user_id: user.data.user.id,
        title: manualRecipe.title,
        slug,
        image_url: manualRecipe.image,
        description: manualRecipe.description,
        ingredients: manualRecipe.ingredients,
        instructions: manualRecipe.instructions,
        source_blog_slug: null,
        // Zusätzliche Felder
        tags: manualRecipe.tags?.length ? manualRecipe.tags : [],
        category: manualRecipe.meal || null,
        author: user.data.user.email || "",
        // Ernährungsform extra: in tags oder als extra DB Spalte möglich, wir nehmen tags
      };
      // Ernährungsform als Tag hinzufügen falls gewählt
      if (manualRecipe.diet) {
        insertObj.tags = [...(insertObj.tags || []), manualRecipe.diet];
      }
      const { error } = await supabase.from("recipes").insert([insertObj]);
      if (error) throw error;
      toast({ title: "Rezept gespeichert!", description: "Das KI-Rezept ist jetzt unter Rezepte sichtbar." });
      setResult(null);
      setIsEditing(false);
      setManualRecipe(null);
      setDiet("");
      setMeal("");
      setTags([]);
      setInput("");
    } catch (err: any) {
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setLoading(false);
  };

  // Hilfsfunktion für tag input (kommasepariert)
  const handleTagsInput = (val: string) => {
    setTags(val.split(",").map(s => s.trim()).filter(Boolean));
    setManualRecipe((prev: any) => ({ ...prev, tags: val.split(",").map(s => s.trim()).filter(Boolean) }));
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow max-w-xl mx-auto">
      <h2 className="font-bold text-lg mb-2">KI Rezept erstellen</h2>
      <textarea
        className="w-full border rounded p-2 mb-2"
        rows={3}
        placeholder="Beschreibe das Wunschrezept (z.B. 'Erdbeer-Marmelade ohne Zucker')"
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={loading || isEditing}
      />
      <button
        className="bg-sage-500 hover:bg-sage-600 text-white px-4 py-2 rounded mb-2 flex items-center gap-2"
        onClick={handleGenerate}
        disabled={loading || !input || isEditing}
      >
        {loading && <Loader className="h-4 w-4 animate-spin" />} Rezept generieren
      </button>
      {/* Bearbeitbares Rezept-Formular nach Generierung */}
      {isEditing && manualRecipe && (
        <form
          className="mt-4 border-t pt-4"
          onSubmit={e => { e.preventDefault(); handleSave(); }}
        >
          <div className="mb-2">
            <label className="block font-semibold text-sage-700">Titel</label>
            <input
              className="w-full border rounded p-2"
              value={manualRecipe.title}
              onChange={e => setManualRecipe({ ...manualRecipe, title: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold text-sage-700">Beschreibung</label>
            <textarea
              className="w-full border rounded p-2"
              rows={2}
              value={manualRecipe.description || ""}
              onChange={e => setManualRecipe({ ...manualRecipe, description: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="mb-2 flex gap-2">
            <div>
              <label className="block text-xs mb-1">Ernährungsform</label>
              <select
                className="border rounded px-2 py-1"
                value={manualRecipe.diet}
                onChange={e => setManualRecipe({ ...manualRecipe, diet: e.target.value })}
                disabled={loading}
              >
                <option value="">Keine Auswahl</option>
                {DIETS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Mahlzeit</label>
              <select
                className="border rounded px-2 py-1"
                value={manualRecipe.meal}
                onChange={e => setManualRecipe({ ...manualRecipe, meal: e.target.value })}
                disabled={loading}
              >
                <option value="">Keine Auswahl</option>
                {MEALS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-xs mb-1">Tags (Komma getrennt)</label>
            <input
              className="w-full border rounded p-2"
              value={manualRecipe.tags?.join(", ") || ""}
              onChange={e => handleTagsInput(e.target.value)}
              disabled={loading}
              placeholder="z.B. Marmelade, Sommer, Dessert"
            />
          </div>
          {/* Zutaten & Schritte (nur Anzeigen, nicht voll editierbar für Kürze) */}
          <div className="mb-2">
            <label className="block font-semibold">Zutaten</label>
            <ul className="list-disc pl-5 text-sm">
              {(manualRecipe.ingredients || []).map((i: any, idx: number) =>
                <li key={idx}>{typeof i === "string" ? i : (i.name + (i.amount ? ` (${i.amount} ${i.unit || ""})` : ""))}</li>
              )}
            </ul>
          </div>
          <div className="mb-2">
            <label className="block font-semibold">Schritte</label>
            <ol className="list-decimal pl-5 text-sm">
              {(manualRecipe.instructions || []).map((s: any, idx: number) =>
                <li key={idx}>{typeof s === "string" ? s : (s.text || JSON.stringify(s))}</li>
              )}
            </ol>
          </div>
          <button
            type="submit"
            className="mt-3 bg-sage-700 hover:bg-sage-800 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : "Rezept speichern"}
          </button>
        </form>
      )}
    </div>
  );
};

export default KIRecipeCreator;
