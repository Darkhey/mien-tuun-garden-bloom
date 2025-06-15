
import React from 'react';
import RecipeDetailsSection from './RecipeDetailsSection';
import RecipeMetadataSection from './RecipeMetadataSection';
import RecipeImageSection from './RecipeImageSection';
import RecipeStatusSection from './RecipeStatusSection';
import { RecipeFormData } from '@/types/admin';

interface RecipeFormProps {
  formData: RecipeFormData;
  onInputChange: (field: keyof RecipeFormData, value: string | number) => void;
  loading: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ formData, onInputChange, loading }) => {
  const handleImageUrlChange = (url: string) => {
    onInputChange("image_url", url);
  };

  return (
    <div className="space-y-4">
      <RecipeDetailsSection
        title={formData.title}
        description={formData.description}
        onInputChange={onInputChange}
      />
      <RecipeMetadataSection
        category={formData.category}
        season={formData.season}
        difficulty={formData.difficulty}
        servings={formData.servings}
        prep_time_minutes={formData.prep_time_minutes}
        cook_time_minutes={formData.cook_time_minutes}
        onInputChange={onInputChange}
      />
      <RecipeImageSection
        imageUrl={formData.image_url}
        onImageUrlChange={handleImageUrlChange}
        title={formData.title}
        description={formData.description}
        disabled={loading}
      />
      <RecipeStatusSection
        status={formData.status}
        onInputChange={onInputChange}
      />
    </div>
  );
};

export default RecipeForm;
