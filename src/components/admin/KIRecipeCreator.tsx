import React, { useState } from "react";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Auswahloptionen (erweitert)
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
const DIFFICULTY = [
  { value: "einfach", label: "Einfach" },
  { value: "mittel", label: "Mittel" },
  { value: "schwer", label: "Schwer" },
];
const SEASONS = [
  { value: "frühling", label: "Frühling" },
  { value: "sommer", label: "Sommer" },
  { value: "herbst", label: "Herbst" },
  { value: "winter", label: "Winter" },
];
const TAG_OPTIONS = [
  "Schnell", "Kinder", "Grillen", "Low Carb", "Meal Prep", "Backen", "Saisonal", "Gesund", "Party", "Süß", "Herzhaft", "Festlich"
];

// Hilfskomponente für Multi-Tag-Auswahl
function TagSelector({ selected, setSelected, disabled }: { selected: string[], setSelected: (v: string[])=>void, disabled?: boolean }) {
  function toggleTag(tag: string) {
    setSelected(
      selected.includes(tag)
        ? selected.filter(t => t !== tag)
        : [...selected, tag]
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {TAG_OPTIONS.map(tag => (
        <button
          type="button"
          key={tag}
          className={`px-2 py-1 rounded border ${selected.includes(tag) ? "bg-sage-600 text-white" : "bg-sage-50"} ${disabled && "opacity-40 pointer-events-none"}`}
          onClick={() => toggleTag(tag)}
          disabled={disabled}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

const KIRecipeCreator: React.FC = () => {
  // Auswahlfelder & State
  const [diet, setDiet] = useState("");
  const [meal, setMeal] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [season, setSeason] = useState("");
  const [servings, setServings] = useState(2);
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState(""); // Freitext

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]); // KI-Vorschläge (max. 1)
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [manualRecipe, setManualRecipe] = useState<any>(null);
  const { toast } = useToast();

  // Hilfsfunktion zum Upload von Base64-Bildern
  const uploadBase64Image = async (base64Data: string, fileName: string): Promise<string | null> => {
    try {
      // Get current user to ensure authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User authentication error:', userError);
        return null;
      }

      // Convert base64 to blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // Create a unique file path with user ID to avoid conflicts
      const filePath = `generated/${fileName}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('recipe-images')
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: true
        });

      if (error) {
        console.error('Storage upload error:', error);
        toast({
          title: "Bild-Upload Fehler",
          description: "Das generierte Bild konnte nicht hochgeladen werden. Das Rezept wird ohne Bild gespeichert.",
          variant: "destructive",
        });
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Bild-Upload Fehler",
        description: "Das generierte Bild konnte nicht hochgeladen werden. Das Rezept wird ohne Bild gespeichert.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Rezeptbild generieren
  const generateRecipeImage = async (recipe: any): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No session available for image generation');
        return null;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-recipe-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          category: recipe.category || meal
        }),
      });

      if (!response.ok) {
        console.error('Image generation failed:', await response.text());
        toast({
          title: "Bild-Generierung fehlgeschlagen",
          description: "Das Rezeptbild konnte nicht generiert werden. Das Rezept wird ohne Bild gespeichert.",
          variant: "destructive",
        });
        return null;
      }

      const { imageB64 } = await response.json();
      if (!imageB64) {
        console.warn('No image data received from generation service');
        return null;
      }

      // Upload image and get URL
      const fileName = `${recipe.title?.toLowerCase().replace(/[^a-z0-9]+/gi, '-') || 'recipe'}-${Date.now()}.png`;
      return await uploadBase64Image(imageB64, fileName);
    } catch (error) {
      console.error('Error generating recipe image:', error);
      toast({
        title: "Bild-Generierung Fehler",
        description: "Das Rezeptbild konnte nicht generiert werden. Das Rezept wird ohne Bild gespeichert.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Rezeptvorschlag generieren (nur einen)
  const handleGenerate = async () => {
    setLoading(true);
    setResults([]);
    setIsEditing(false);
    setManualRecipe(null);
    setSelectedRecipe(null);
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Nicht eingeloggt!");
      }

      // Prepare request body for generate-recipe function
      const requestBody = {
        title: input || "Neues Rezept",
        description: input,
        diet,
        season,
        category: meal,
        servings,
        tags,
        freeText: input
      };

      // Call generate-recipe function
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-recipe`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Fehler bei der KI-Rezeptgenerierung: ${errorText}`);
      }
      
      const { recipe } = await resp.json();

      if (!recipe) {
        throw new Error("Konnte kein Rezept generieren");
      }

      // Set the single recipe result
      setResults([recipe]);
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: String(err.message || err),
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  // Vorschlag auswählen & bearbeiten
  const handleChooseForEdit = async (recipe: any) => {
    setLoading(true);
    
    // Generate image for the recipe (with error handling)
    const imageUrl = await generateRecipeImage(recipe);
    
    const recipeWithImage = {
      ...recipe,
      diet,
      meal,
      difficulty: recipe.difficulty || difficulty,
      season: recipe.season || season,
      tags: recipe.tags || tags,
      servings: recipe.servings || servings,
      image: imageUrl || recipe.image || ""
    };

    setManualRecipe(recipeWithImage);
    setIsEditing(true);
    setSelectedRecipe(recipe);
    setLoading(false);
  };

  // Rezept speichern
  const handleSave = async () => {
    if (!manualRecipe?.title) return;
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Nicht eingeloggt!");
      }
      
      const slug = manualRecipe.title
        ? manualRecipe.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")
        : String(Date.now());
        
      const insertObj = {
        user_id: user.id,
        title: manualRecipe.title,
        slug,
        image_url: manualRecipe.image || null,
        description: manualRecipe.description,
        ingredients: manualRecipe.ingredients,
        instructions: manualRecipe.instructions,
        servings: manualRecipe.servings,
        prep_time_minutes: manualRecipe.prepTime || manualRecipe.prep_time_minutes || null,
        cook_time_minutes: manualRecipe.cookTime || manualRecipe.cook_time_minutes || null,
        source_blog_slug: null,
        tags: manualRecipe.tags?.length ? manualRecipe.tags : [],
        difficulty: manualRecipe.difficulty || null,
        season: manualRecipe.season || null,
        category: manualRecipe.category || manualRecipe.meal || null,
        author: user.email || "",
        status: 'veröffentlicht'
      };
      
      if (manualRecipe.diet) {
        insertObj.tags = [...(insertObj.tags || []), manualRecipe.diet];
      }
      
      const { error } = await supabase.from("recipes").insert([insertObj]);
      if (error) {
        console.error('Recipe insert error:', error);
        throw error;
      }
      
      toast({ 
        title: "Rezept gespeichert!", 
        description: "Das KI-Rezept ist jetzt unter Rezepte sichtbar." 
      });
      
      // Reset form
      setResults([]);
      setIsEditing(false);
      setManualRecipe(null);
      setDiet("");
      setMeal("");
      setTags([]);
      setServings(2);
      setDifficulty("");
      setSeason("");
      setInput("");
    } catch (err: any) {
      toast({ 
        title: "Fehler", 
        description: String(err.message || err), 
        variant: "destructive" 
      });
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow max-w-xl mx-auto">
      <h2 className="font-bold text-lg mb-3">KI Rezepte vorschlagen</h2>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs mb-1">Ernährungsform</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={diet}
            onChange={e => setDiet(e.target.value)}
            disabled={loading || isEditing}
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
            className="border rounded px-2 py-1 w-full"
            value={meal}
            onChange={e => setMeal(e.target.value)}
            disabled={loading || isEditing}
          >
            <option value="">Keine Auswahl</option>
            {MEALS.map(opt => (
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
            disabled={loading || isEditing}
          >
            <option value="">Keine Auswahl</option>
            {DIFFICULTY.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Saison</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={season}
            onChange={e => setSeason(e.target.value)}
            disabled={loading || isEditing}
          >
            <option value="">Keine Auswahl</option>
            {SEASONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Portionen</label>
          <input
            type="number"
            min={1}
            className="border rounded px-2 py-1 w-full"
            value={servings}
            onChange={e => setServings(Number(e.target.value))}
            disabled={loading || isEditing}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs mb-1">Tags (Mehrfachauswahl)</label>
          <TagSelector selected={tags} setSelected={setTags} disabled={loading || isEditing} />
        </div>
      </div>
      <div className="mb-1">
        <label className="block text-xs mb-1">Freitext (z.B. Wunschzutat oder Geschmack, optional)</label>
        <textarea
          className="w-full border rounded p-2"
          rows={2}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading || isEditing}
          placeholder="z.B. 'ohne Zucker', 'sommerlich', 'für Kindergeburtstag' etc."
        ></textarea>
      </div>
      <button
        className="bg-sage-500 hover:bg-sage-600 text-white px-4 py-2 rounded mb-2 flex items-center gap-2 w-full"
        onClick={handleGenerate}
        disabled={loading || isEditing}
      >
        {loading && <Loader className="h-4 w-4 animate-spin" />} Rezept vorschlagen
      </button>

      {/* Vorschläge */}
      {results.length > 0 && !isEditing && (
        <div className="mt-2 space-y-4">
          <div className="mb-2 font-semibold text-sage-700">Vorschlag:</div>
          {results.map((recipe, idx) => (
            <div key={idx} className="p-3 border rounded-lg bg-sage-50">
              <div className="font-bold">{recipe.title}</div>
              <div className="text-xs mb-2">{recipe.description}</div>
              {recipe.story && (
                <div className="text-sm mb-2 italic text-sage-600">{recipe.story}</div>
              )}
              <ul className="list-disc pl-5 text-sm mb-1">
                {(recipe.ingredients||[]).map((i: any, iidx: number) =>
                  <li key={iidx}>
                    {typeof i === "string" ? i : (
                      i.name + 
                      (i.amount ? ` (${i.amount}${i.unit ? ` ${i.unit}` : ""})` : "") +
                      (i.optional ? " (optional)" : "")
                    )}
                  </li>
                )}
              </ul>
              <ol className="list-decimal pl-5 text-sm mb-2">
                {(recipe.instructions||[]).map((s: any, sidx: number) =>
                  <li key={sidx}>{typeof s === "string" ? s : (s.text || JSON.stringify(s))}</li>
                )}
              </ol>
              {recipe.tips && recipe.tips.length > 0 && (
                <div className="text-sm mb-2">
                  <strong>Tipps:</strong> {recipe.tips.join(", ")}
                </div>
              )}
              <button
                className="bg-sage-600 hover:bg-sage-700 text-white px-3 py-1 rounded flex items-center gap-2"
                onClick={() => handleChooseForEdit(recipe)}
                disabled={loading}
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                Vorschlag übernehmen & bearbeiten
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Rezept in Bearbeitung */}
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
          {manualRecipe.story && (
            <div className="mb-2">
              <label className="block font-semibold text-sage-700">Geschichte/Hintergrund</label>
              <textarea
                className="w-full border rounded p-2"
                rows={3}
                value={manualRecipe.story || ""}
                onChange={e => setManualRecipe({ ...manualRecipe, story: e.target.value })}
                disabled={loading}
              />
            </div>
          )}
          {manualRecipe.image && (
            <div className="mb-2">
              <label className="block font-semibold text-sage-700">Generiertes Bild</label>
              <img 
                src={manualRecipe.image} 
                alt={manualRecipe.title} 
                className="w-full max-w-sm rounded border"
              />
            </div>
          )}
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
          <div className="mb-2 flex gap-2">
            <div>
              <label className="block text-xs mb-1">Schwierigkeitsgrad</label>
              <select
                className="border rounded px-2 py-1"
                value={manualRecipe.difficulty}
                onChange={e => setManualRecipe({ ...manualRecipe, difficulty: e.target.value })}
                disabled={loading}
              >
                <option value="">Keine Auswahl</option>
                {DIFFICULTY.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Saison</label>
              <select
                className="border rounded px-2 py-1"
                value={manualRecipe.season}
                onChange={e => setManualRecipe({ ...manualRecipe, season: e.target.value })}
                disabled={loading}
              >
                <option value="">Keine Auswahl</option>
                {SEASONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Portionen</label>
              <input
                type="number"
                min={1}
                className="border rounded px-2 py-1 w-20"
                value={manualRecipe.servings}
                onChange={e => setManualRecipe({ ...manualRecipe, servings: Number(e.target.value) })}
                disabled={loading}
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-xs mb-1">Tags (Mehrfachauswahl)</label>
            <TagSelector selected={manualRecipe.tags || []} setSelected={tags => setManualRecipe({ ...manualRecipe, tags })} disabled={loading} />
          </div>
          <div className="mb-2">
            <label className="block font-semibold">Zutaten</label>
            <ul className="list-disc pl-5 text-sm">
              {(manualRecipe.ingredients || []).map((i: any, ix: number) =>
                <li key={ix}>
                  {typeof i === "string" ? i : (
                    i.name + 
                    (i.amount ? ` (${i.amount}${i.unit ? ` ${i.unit}` : ""})` : "") +
                    (i.optional ? " (optional)" : "")
                  )}
                </li>
              )}
            </ul>
          </div>
          <div className="mb-2">
            <label className="block font-semibold">Schritte</label>
            <ol className="list-decimal pl-5 text-sm">
              {(manualRecipe.instructions || []).map((s: any, sx: number) =>
                <li key={sx}>{typeof s === "string" ? s : (s.text || JSON.stringify(s))}</li>
              )}
            </ol>
          </div>
          {manualRecipe.tips && manualRecipe.tips.length > 0 && (
            <div className="mb-2">
              <label className="block font-semibold">Tipps</label>
              <ul className="list-disc pl-5 text-sm">
                {manualRecipe.tips.map((tip: string, tipIdx: number) => (
                  <li key={tipIdx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="submit"
            className="mt-3 bg-sage-700 hover:bg-sage-800 text-white px-4 py-2 rounded flex items-center gap-2"
            disabled={loading}
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Rezept speichern
          </button>
        </form>
      )}
    </div>
  );
};

export default KIRecipeCreator;