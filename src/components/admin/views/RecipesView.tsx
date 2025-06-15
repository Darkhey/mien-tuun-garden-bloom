
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { AdminRecipe } from "@/types/admin";

interface RecipesViewProps {
  recipes: AdminRecipe[];
  loading: boolean;
  error: string | null;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onDelete: (id: string) => void;
  onEdit: (recipe: AdminRecipe) => void;
}

const RecipesView: React.FC<RecipesViewProps> = ({ recipes, loading, error, onToggleStatus, onDelete, onEdit }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin mr-2" /> Rezepte werden geladen...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 p-4 bg-red-50 rounded">{error}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titel</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Autor</TableHead>
          <TableHead>Kategorie</TableHead>
          <TableHead>Schwierigkeit</TableHead>
          <TableHead>Erstellt</TableHead>
          <TableHead>Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recipes.map(recipe => (
          <TableRow key={recipe.id}>
            <TableCell className="font-medium">{recipe.title}</TableCell>
            <TableCell>
              <Button
                size="sm"
                variant={recipe.status === "veröffentlicht" ? "default" : "outline"}
                onClick={() => onToggleStatus(recipe.id, recipe.status)}
              >
                {recipe.status === "veröffentlicht" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {recipe.status}
              </Button>
            </TableCell>
            <TableCell>{recipe.author}</TableCell>
            <TableCell>{recipe.category || "-"}</TableCell>
            <TableCell>{recipe.difficulty || "-"}</TableCell>
            <TableCell>{new Date(recipe.created_at).toLocaleDate'('de-DE')}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(recipe)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(recipe.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RecipesView;
