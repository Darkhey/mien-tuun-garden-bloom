
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RecipeFormData } from '@/types/admin';

interface RecipeDetailsSectionProps {
  title: string;
  description: string;
  onInputChange: (field: keyof RecipeFormData, value: string) => void;
}

const RecipeDetailsSection: React.FC<RecipeDetailsSectionProps> = ({ title, description, onInputChange }) => {
  return (
    <>
      <div>
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onInputChange("title", e.target.value)}
          placeholder="Rezept-Titel"
        />
      </div>
      <div>
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onInputChange("description", e.target.value)}
          placeholder="Kurze Beschreibung des Rezepts"
          rows={3}
        />
      </div>
    </>
  );
};

export default RecipeDetailsSection;
