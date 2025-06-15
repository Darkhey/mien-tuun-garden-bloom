
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import ImageUploadField from '../ImageUploadField';
import { Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RecipeImageSectionProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  title: string;
  description: string;
  disabled?: boolean;
}

const RecipeImageSection: React.FC<RecipeImageSectionProps> = ({
  imageUrl,
  onImageUrlChange,
  title,
  description,
  disabled,
}) => {
  const [generatingImage, setGeneratingImage] = useState(false);
  const { toast } = useToast();

  const generateImageFromContent = async () => {
    if (!title) {
      toast({
        title: "Fehler",
        description: "Titel ist erforderlich für die Bildgenerierung",
        variant: "destructive",
      });
      return;
    }

    setGeneratingImage(true);
    try {
      const imagePrompt = `Hyperrealistisches, appetitliches Food-Foto von "${title}". ${description}. Professionelle Küchenfotografie, natürliches Licht, ansprechende Präsentation. Ohne Text.`;

      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { prompt: imagePrompt },
      });

      if (error) throw error;

      if (data.imageUrl) {
        onImageUrlChange(data.imageUrl);
        toast({
          title: "Erfolg",
          description: "Bild wurde erfolgreich generiert!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Bildgenerierung fehlgeschlagen: " + error.message,
        variant: "destructive",
      });
    }
    setGeneratingImage(false);
  };

  return (
    <div>
      <Label>Rezept-Bild</Label>
      <div className="space-y-3">
        <ImageUploadField
          value={imageUrl}
          onChange={onImageUrlChange}
          bucket="recipe-images"
          disabled={disabled || generatingImage}
        />

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">oder</span>
          <Button
            type="button"
            variant="outline"
            onClick={generateImageFromContent}
            disabled={generatingImage || !title || disabled}
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

        {imageUrl && (
          <div className="mt-3">
            <img
              src={imageUrl}
              alt="Rezept-Bild Vorschau"
              className="w-full max-w-md h-48 object-cover rounded-lg border"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeImageSection;
