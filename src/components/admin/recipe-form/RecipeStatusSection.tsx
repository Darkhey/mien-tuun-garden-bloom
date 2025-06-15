
import React from 'react';
import { Label } from '@/components/ui/label';
import { RecipeFormData } from '@/types/admin';

interface RecipeStatusSectionProps {
  status: string;
  onInputChange: (field: keyof RecipeFormData, value: string) => void;
}

const RecipeStatusSection: React.FC<RecipeStatusSectionProps> = ({ status, onInputChange }) => {
  return (
    <div>
      <Label htmlFor="status">Status</Label>
      <select
        id="status"
        value={status}
        onChange={(e) => onInputChange("status", e.target.value)}
        className="w-full p-2 border rounded-md"
      >
        <option value="entwurf">Entwurf</option>
        <option value="veröffentlicht">Veröffentlicht</option>
      </select>
    </div>
  );
};

export default RecipeStatusSection;
