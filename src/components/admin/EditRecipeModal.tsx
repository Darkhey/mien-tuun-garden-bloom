
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { AdminRecipe, RecipeFormData } from "@/types/admin";
import RecipeForm from "./recipe-form/RecipeForm";

interface EditRecipeModalProps {
  recipe: AdminRecipe;
  onClose: () => void;
  onSaved: () => void;
}

const EditRecipeModal: React.FC<EditRecipeModalProps> = ({ recipe, onClose, onSaved }) => {
  const [formData, setFormData] = useState<RecipeFormData>({
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

  const handleInputChange = (field: keyof RecipeFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        
        <RecipeForm 
            formData={formData} 
            onInputChange={handleInputChange} 
            loading={loading}
        />

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
