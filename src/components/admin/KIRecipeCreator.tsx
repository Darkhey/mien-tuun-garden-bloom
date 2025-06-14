
import React, { useState } from "react";
import { Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const KIRecipeCreator: React.FC = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  // Call KI Funktion zum Erstellen eines Rezepts
  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch("https://ublbxvpmoccmegtwaslh.functions.supabase.co/blog-to-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: input, content: input, image: "" }),
      });
      if (!resp.ok) throw new Error("Fehler bei der KI");
      const { recipe } = await resp.json();
      setResult(recipe);
    } catch (err: any) {
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setLoading(false);
  };

  // Übernahme in DB (Rezepte)
  const handleSave = async () => {
    setLoading(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Nicht eingeloggt!");
      const { title, image, description, ingredients, instructions } = result;
      const slug = title ? title.toLowerCase().replace(/[^a-z0-9]+/gi, "-") : String(Date.now());
      const insertObj = {
        user_id: user.data.user.id,
        title, slug, image_url: image, description, ingredients, instructions,
        source_blog_slug: null
      }
      const { error } = await supabase.from("recipes").insert([insertObj]);
      if (error) throw error;
      toast({ title: "Rezept gespeichert!", description: "Das KI-Rezept ist jetzt unter Rezepte sichtbar." });
    } catch (err: any) {
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setLoading(false);
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
        disabled={loading}
      />
      <button
        className="bg-sage-500 hover:bg-sage-600 text-white px-4 py-2 rounded mb-2 flex items-center gap-2"
        onClick={handleGenerate}
        disabled={loading || !input}
      >
        {loading && <Loader className="h-4 w-4 animate-spin" />} Rezept generieren
      </button>
      {result && (
        <div className="mt-4 border-t pt-4">
          <div className="font-semibold text-sage-700">{result.title}</div>
          {result.description && <div className="mb-1">{result.description}</div>}
          {result.ingredients && (
            <div>
              <div className="font-semibold mt-2">Zutaten:</div>
              <ul className="list-disc pl-5 text-sm">
                {result.ingredients.map((i: any, idx: number) =>
                  <li key={idx}>{typeof i === "string" ? i : (i.name + (i.amount ? ` (${i.amount} ${i.unit || ""})` : ""))}</li>
                )}
              </ul>
            </div>
          )}
          {result.instructions && (
            <div>
              <div className="font-semibold mt-2">Schritte:</div>
              <ol className="list-decimal pl-5 text-sm">
                {result.instructions.map((s: any, idx: number) =>
                  <li key={idx}>{typeof s === "string" ? s : (s.text || JSON.stringify(s))}</li>
                )}
              </ol>
            </div>
          )}
          <button
            className="mt-3 bg-sage-700 hover:bg-sage-800 text-white px-4 py-2 rounded"
            onClick={handleSave}
            disabled={loading}
          >
            In Rezepte speichern
          </button>
        </div>
      )}
    </div>
  );
};

export default KIRecipeCreator;
