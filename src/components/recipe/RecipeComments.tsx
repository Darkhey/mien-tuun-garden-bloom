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
  parent_id: string | null;
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
      .order("created_at", { ascending: true });
    if (!error) setComments((data as Comment[]) || []);
  }

  async function handleDelete(id: string) {
    if (!userId) return;
    const { error } = await supabase
      .from("recipe_comments")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) {
      toast({ title: "Fehler", description: "Kommentar konnte nicht gelöscht werden." });
      return;
    }
    toast({ title: "Kommentar gelöscht!" });
    fetchComments();
  }

  type CommentTree = Comment & { children: CommentTree[] };

  const buildTree = (list: Comment[]): CommentTree[] => {
    const map = new Map<string, CommentTree>();
    const roots: CommentTree[] = [];
    list.forEach((c) => map.set(c.id, { ...c, children: [] }));
    list.forEach((c) => {
      const node = map.get(c.id)!;
      if (c.parent_id) {
        const parent = map.get(c.parent_id);
        if (parent) parent.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  };

  const CommentItem: React.FC<{ comment: CommentTree; depth: number }> = ({ comment, depth }) => {
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState("");

    async function submitReply(e: React.FormEvent) {
      e.preventDefault();
      if (!userId) {
        toast({ title: "Bitte einloggen", description: "Nur eingeloggte Nutzer können kommentieren." });
        return;
      }
      if (!replyText.trim()) return;
      const { error } = await supabase.from("recipe_comments").insert({
        recipe_id: recipeId,
        user_id: userId,
        content: replyText.trim(),
        parent_id: comment.id
      });
      if (error) {
        toast({ title: "Fehler", description: "Kommentar konnte nicht gespeichert werden." });
        return;
      }
      setReplyText("");
      setShowReply(false);
      fetchComments();
    }

    return (
      <div className={depth ? `ml-${depth * 4}` : undefined}>
        <div className="bg-sage-50 rounded p-3 text-sm text-earth-700 border border-sage-100">
          <div className="mb-1 text-xs text-sage-600 flex justify-between">
            <span>{new Date(comment.created_at).toLocaleString("de-DE")}</span>
            {userId === comment.user_id && (
              <button onClick={() => handleDelete(comment.id)} className="text-xs text-destructive hover:underline ml-2" type="button">
                Löschen
              </button>
            )}
          </div>
          {comment.content}
          <div className="mt-2">
            <button onClick={() => setShowReply(!showReply)} className="text-xs text-sage-600 hover:underline" type="button">
              Antworten
            </button>
          </div>
          {showReply && (
            <form onSubmit={submitReply} className="mt-2 flex gap-2">
              <textarea
                placeholder="Antwort..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 border border-sage-200 rounded p-2"
                rows={2}
              />
              <button type="submit" className="bg-sage-600 text-white px-5 py-2 rounded hover:bg-sage-700" disabled={!replyText.trim()}>Senden</button>
            </form>
          )}
        </div>
        {comment.children.map((child) => (
          <CommentItem key={child.id} comment={child} depth={depth + 1} />
        ))}
      </div>
    );
  };

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
      content: comment.trim(),
      parent_id: null
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
        {buildTree(comments).length ? (
          buildTree(comments).map((c) => (
            <CommentItem key={c.id} comment={c} depth={0} />
          ))
        ) : (
          <div className="text-sage-400">Noch keine Kommentare.</div>
        )}
      </div>
    </section>
  );
};

export default RecipeComments;
