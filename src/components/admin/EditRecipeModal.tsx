
import React, { useState } from "react";
import StatusSelector from "./StatusSelector";
import ImageUploadField from "./ImageUploadField";
import VersionHistory from "./VersionHistory";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditRecipeModalProps {
  recipe: any;
  onClose: () => void;
  onSaved: () => void;
}

const EditRecipeModal: React.FC<EditRecipeModalProps> = ({ recipe, onClose, onSaved }) => {
  const [form, setForm] = useState({ ...recipe });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  function handleChange(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function saveVersionAndUpdateRecipe() {
    setSaving(true);
    // 1. Version speichern
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      toast({ title: "Nicht eingeloggt", description: "Melde dich neu an." });
      setSaving(false);
      return;
    }
    const versionInsert = {
      recipe_id: recipe.id,
      user_id: user.data.user.id,
      ...recipe // alte Daten
    };
    await supabase.from("recipe_versions").insert([versionInsert]);
    // 2. Update Recipe
    const { error } = await supabase.from("recipes").update(form).eq("id", recipe.id);
    if (error) {
      toast({ title: "Fehler beim Speichern", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Gespeichert!", description: "Rezept wurde erfolgreich aktualisiert." });
      onSaved();
      onClose();
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1001]">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-4 text-xl">&times;</button>
        <h2 className="font-bold text-xl mb-2">Rezept bearbeiten</h2>
        <div className="mb-2">
          <label className="block text-sm font-semibold">Titel:</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={form.title}
            onChange={e => handleChange("title", e.target.value)}
            disabled={saving}
          />
        </div>
        <div className="mb-2">
          <ImageUploadField
            value={form.image_url}
            onChange={url => handleChange("image_url", url)}
            bucket="recipe-images"
            disabled={saving}
          />
        </div>
        <div className="mb-2">
          <StatusSelector
            value={form.status}
            onChange={val => handleChange("status", val)}
            disabled={saving}
          />
        </div>
        {/* Weitere Felder wie Beschreibung, Zutaten etc. sind ähnlich hinzufügbar */}
        <div className="flex gap-2 mt-4">
          <button className="bg-sage-700 text-white px-4 py-2 rounded" disabled={saving} onClick={saveVersionAndUpdateRecipe}>
            {saving ? "Speichere..." : "Speichern & Version sichern"}
          </button>
          <button className="bg-sage-100 px-4 py-2 rounded" onClick={onClose} disabled={saving}>Abbrechen</button>
        </div>
        <VersionHistory type="recipe" itemId={recipe.id} />
      </div>
    </div>
  );
};

export default EditRecipeModal;
