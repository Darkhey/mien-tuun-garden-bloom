
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type RecipeRatingProps = {
  recipeId: string;
  userId: string | null;
};

const stars = [1, 2, 3, 4, 5];

const RecipeRating: React.FC<RecipeRatingProps> = ({ recipeId, userId }) => {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lade durchschnittliche Bewertung & User-Bewertung
    async function fetchRating() {
      // Durchschnitt
      const { data: avgData } = await supabase
        .from("recipe_ratings")
        .select("rating", { count: "exact" })
        .eq("recipe_id", recipeId);
      if (avgData && avgData.length > 0) {
        const ratings = avgData.map((r) => r.rating);
        setAverageRating(
          Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        );
        setRatingCount(ratings.length);
      } else {
        setAverageRating(null);
        setRatingCount(0);
      }
      // User-Rating (wenn eingeloggt)
      if (userId) {
        const { data: ur } = await supabase
          .from("recipe_ratings")
          .select("rating")
          .eq("recipe_id", recipeId)
          .eq("user_id", userId)
          .maybeSingle();
        setUserRating(ur?.rating ?? null);
      }
    }
    fetchRating();
  }, [recipeId, userId]);

  async function handleRate(star: number) {
    if (!userId) {
      toast({ title: "Bitte einloggen", description: "Du musst eingeloggt sein, um zu bewerten." });
      return;
    }
    setLoading(true);
    // Upsert Bewertung
    const { error } = await supabase.from("recipe_ratings").upsert([
      { recipe_id: recipeId, user_id: userId, rating: star }
    ]);
    setUserRating(star);
    setLoading(false);
    if (error) {
      toast({ title: "Fehler", description: "Bewertung konnte nicht gespeichert werden." });
    } else {
      toast({ title: "Danke für deine Bewertung!" });
      // Nachladen für neuen average
      const { data: avgData } = await supabase
        .from("recipe_ratings")
        .select("rating", { count: "exact" })
        .eq("recipe_id", recipeId);
      if (avgData && avgData.length > 0) {
        const ratings = avgData.map((r) => r.rating);
        setAverageRating(
          Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        );
        setRatingCount(ratings.length);
      }
    }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-xl">
        {stars.map((star) => (
          <button
            key={star}
            disabled={loading}
            onClick={() => handleRate(star)}
            className={`transition text-yellow-400 ${userRating && star <= userRating ? "opacity-100" : "opacity-40"}`}
            aria-label={`${star} Stern${star > 1 ? "e" : ""}`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm text-sage-700">
          {averageRating ? `${averageRating} von 5` : "Noch keine Bewertungen"}
          {ratingCount ? ` (${ratingCount})` : ""}
        </span>
      </div>
      {userRating && <div className="text-xs text-sage-600 mt-1">Deine Bewertung: {userRating} Sterne</div>}
    </div>
  );
};

export default RecipeRating;
