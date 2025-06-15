
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RecipeFormData } from '@/types/admin';

interface RecipeMetadataSectionProps {
  category: string;
  season: string;
  difficulty: string;
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  onInputChange: (field: keyof RecipeFormData, value: string | number) => void;
}

const RecipeMetadataSection: React.FC<RecipeMetadataSectionProps> = ({
  category,
  season,
  difficulty,
  servings,
  prep_time_minutes,
  cook_time_minutes,
  onInputChange,
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Kategorie</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => onInputChange("category", e.target.value)}
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
            value={season}
            onChange={(e) => onInputChange("season", e.target.value)}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="difficulty">Schwierigkeit</Label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => onInputChange("difficulty", e.target.value)}
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
            value={servings}
            onChange={(e) => onInputChange("servings", parseInt(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="prep_time">Zubereitungszeit (Min.)</Label>
          <Input
            id="prep_time"
            type="number"
            min="0"
            value={prep_time_minutes}
            onChange={(e) => onInputChange("prep_time_minutes", parseInt(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="cook_time">Kochzeit (Min.)</Label>
          <Input
            id="cook_time"
            type="number"
            min="0"
            value={cook_time_minutes}
            onChange={(e) => onInputChange("cook_time_minutes", parseInt(e.target.value))}
          />
        </div>
      </div>
    </>
  );
};

export default RecipeMetadataSection;
