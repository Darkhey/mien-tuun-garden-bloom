import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type RecipeCommentsProps = {
  recipeId: string;
  userId: string | null;
};

type Comment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

const RecipeComments: React.FC<RecipeCommentsProps> = ({ recipeId, userId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function fetchComments() {
    const { data, error } = await supabase
      .from("recipe_comments")
      .select("*")
      .eq("recipe_id", recipeId)
      .order("created_at", { ascending: false });
    if (!error) setComments(data || []);
  }

  useEffect(() => {
    fetchComments();
    // Optional: live updates (könnte mit supabase.channel realisiert werden)
  }, [recipeId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      toast({ title: "Bitte einloggen", description: "Nur eingeloggte Nutzer können kommentieren." });
      return;
    }
    if (!comment.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("recipe_comments").insert({
      recipe_id: recipeId,
      user_id: userId,
      content: comment.trim()
    });
    setLoading(false);
    if (error) {
      toast({ title: "Fehler", description: "Kommentar konnte nicht gespeichert werden." });
      return;
    }
    setComment("");
    toast({ title: "Kommentar wurde gespeichert!" });
    fetchComments();
  }

  return (
    <section className="mt-10">
      <h3 className="text-lg font-serif font-bold text-earth-800 mb-4">Kommentare</h3>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <textarea
          placeholder="Dein Kommentar..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="flex-1 border border-sage-200 rounded p-2"
          rows={2}
          disabled={!userId}
        />
        <button
          type="submit"
          className="bg-sage-600 text-white px-5 py-2 rounded hover:bg-sage-700"
          disabled={loading || !comment.trim()}
        >
          Abschicken
        </button>
      </form>
      <div className="space-y-5">
        {comments.length ? comments.map((c) => (
          <div
            key={c.id}
            className="bg-sage-50 rounded p-3 text-sm text-earth-700 border border-sage-100"
          >
            <div className="mb-1 text-xs text-sage-600">{new Date(c.created_at).toLocaleString("de-DE")}</div>
            {c.content}
          </div>
        )) : <div className="text-sage-400">Noch keine Kommentare.</div>}
      </div>
    </section>
  );
};

export default RecipeComments;
