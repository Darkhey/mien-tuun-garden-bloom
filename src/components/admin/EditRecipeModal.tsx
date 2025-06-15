import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import ImageUploadField from "./ImageUploadField";
import { AdminRecipe } from "@/types/admin";

interface EditRecipeModalProps {
  recipe: AdminRecipe;
  onClose: () => void;
  onSaved: () => void;
}

const EditRecipeModal: React.FC<EditRecipeModalProps> = ({ recipe, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    season: "",
    difficulty: "",
    servings: 1,
    prep_time_minutes: 0,
    cook_time_minutes: 0,
    image_url: "",
    status: "entwurf",
  });
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title || "",
        description: recipe.description || "",
        category: recipe.category || "",
        season: recipe.season || "",
        difficulty: recipe.difficulty || "",
        servings: recipe.servings || 1,
        prep_time_minutes: recipe.prep_time_minutes || 0,
        cook_time_minutes: recipe.cook_time_minutes || 0,
        image_url: recipe.image_url || "",
        status: recipe.status || "entwurf",
      });
    }
  }, [recipe]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateImageFromContent = async () => {
    if (!formData.title) {
      toast({
        title: "Fehler",
        description: "Titel ist erforderlich für die Bildgenerierung",
        variant: "destructive"
      });
      return;
    }

    setGeneratingImage(true);
    try {
      const imagePrompt = `Hyperrealistisches, appetitliches Food-Foto von "${formData.title}". ${formData.description}. Professionelle Küchenfotografie, natürliches Licht, ansprechende Präsentation. Ohne Text.`;

      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { prompt: imagePrompt }
      });

      if (error) throw error;

      if (data.imageUrl) {
        setFormData(prev => ({ ...prev, image_url: data.imageUrl }));
        toast({
          title: "Erfolg",
          description: "Bild wurde erfolgreich generiert!"
        });
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Bildgenerierung fehlgeschlagen: " + error.message,
        variant: "destructive"
      });
    }
    setGeneratingImage(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("recipes")
        .update(formData)
        .eq("id", recipe.id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Rezept wurde aktualisiert"
      });
      onSaved();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rezept bearbeiten</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Rezept-Titel"
            />
          </div>

          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Kurze Beschreibung des Rezepts"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Kategorie</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Wähle Kategorie</option>
                <option value="Süßes & Kuchen">Süßes & Kuchen</option>
                <option value="Suppen & Eintöpfe">Suppen & Eintöpfe</option>
                <option value="Salate & Vorspeisen">Salate & Vorspeisen</option>
                <option value="Konservieren">Konservieren</option>
              </select>
            </div>

            <div>
              <Label htmlFor="season">Saison</Label>
              <select
                id="season"
                value={formData.season}
                onChange={(e) => handleInputChange("season", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Wähle Saison</option>
                <option value="frühling">Frühling</option>
                <option value="sommer">Sommer</option>
                <option value="herbst">Herbst</option>
                <option value="winter">Winter</option>
                <option value="ganzjährig">Ganzjährig</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="difficulty">Schwierigkeit</Label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => handleInputChange("difficulty", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Wähle Schwierigkeit</option>
                <option value="einfach">Einfach</option>
                <option value="mittel">Mittel</option>
                <option value="schwer">Schwer</option>
              </select>
            </div>

            <div>
              <Label htmlFor="servings">Portionen</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={formData.servings}
                onChange={(e) => handleInputChange("servings", parseInt(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="prep_time">Zubereitungszeit (Min.)</Label>
              <Input
                id="prep_time"
                type="number"
                min="0"
                value={formData.prep_time_minutes}
                onChange={(e) => handleInputChange("prep_time_minutes", parseInt(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label>Rezept-Bild</Label>
            <div className="space-y-3">
              <ImageUploadField
                value={formData.image_url}
                onChange={(imageUrl) => handleInputChange("image_url", imageUrl)}
                bucket="recipe-images"
                disabled={loading || generatingImage}
              />
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">oder</span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateImageFromContent}
                  disabled={generatingImage || !formData.title}
                  className="flex items-center gap-2"
                >
                  {generatingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {generatingImage ? "Generiere Bild..." : "KI-Bild generieren"}
                </Button>
              </div>
              
              {formData.image_url && (
                <div className="mt-3">
                  <img
                    src={formData.image_url}
                    alt="Rezept-Bild Vorschau"
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="entwurf">Entwurf</option>
              <option value="veröffentlicht">Veröffentlicht</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecipeModal;
