
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SaveRecipeButtonProps {
  recipeSlug: string;
  userId: string | null;
}

const checkIsSaved = async (recipeSlug: string, userId: string | null) => {
  if (!userId) return false;
  const { data, error } = await supabase
    .from('saved_recipes')
    .select('id')
    .eq('recipe_slug', recipeSlug)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
};

const saveRecipe = async ({ recipeSlug, userId }: { recipeSlug: string, userId: string }) => {
  const { error } = await supabase
    .from('saved_recipes')
    .insert({ recipe_slug: recipeSlug, user_id: userId });
  if (error) throw error;
};

const unsaveRecipe = async ({ recipeSlug, userId }: { recipeSlug: string, userId: string }) => {
  const { error } = await supabase
    .from('saved_recipes')
    .delete()
    .eq('recipe_slug', recipeSlug)
    .eq('user_id', userId);
  if (error) throw error;
};

const SaveRecipeButton: React.FC<SaveRecipeButtonProps> = ({ recipeSlug, userId }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: isSaved, isLoading } = useQuery({
    queryKey: ['isRecipeSaved', recipeSlug, userId],
    queryFn: () => checkIsSaved(recipeSlug, userId),
    enabled: !!userId,
  });

  const saveMutation = useMutation({
    mutationFn: saveRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isRecipeSaved', recipeSlug, userId] });
      queryClient.invalidateQueries({ queryKey: ['saved-recipes', userId] });
      toast({ title: 'Gespeichert!', description: 'Das Rezept wurde in deinem Rezeptbuch gespeichert.' });
    },
    onError: () => {
      toast({ title: 'Fehler', description: 'Das Rezept konnte nicht gespeichert werden.', variant: 'destructive' });
    }
  });

  const unsaveMutation = useMutation({
    mutationFn: unsaveRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isRecipeSaved', recipeSlug, userId] });
      queryClient.invalidateQueries({ queryKey: ['saved-recipes', userId] });
      toast({ title: 'Entfernt', description: 'Das Rezept wurde aus deinem Rezeptbuch entfernt.' });
    },
    onError: () => {
      toast({ title: 'Fehler', description: 'Das Rezept konnte nicht entfernt werden.', variant: 'destructive' });
    }
  });

  const handleToggleSave = () => {
    if (!userId) {
      toast({ title: 'Anmelden', description: 'Bitte melde dich an, um Rezepte zu speichern.' });
      return;
    }
    if (isSaved) {
      unsaveMutation.mutate({ recipeSlug, userId });
    } else {
      saveMutation.mutate({ recipeSlug, userId });
    }
  };

  const isMutating = saveMutation.isPending || unsaveMutation.isPending;

  if (!userId) {
      return (
          <Button variant="outline" disabled title="Zum Speichern anmelden">
              <Heart className="mr-2 h-4 w-4" />
              Merken
          </Button>
      )
  }

  return (
    <Button variant="outline" onClick={handleToggleSave} disabled={isLoading || isMutating}>
      <Heart className={`mr-2 h-4 w-4 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
      {isSaved ? 'Gemerkt' : 'Merken'}
    </Button>
  );
};

export default SaveRecipeButton;
