import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import KIRecipeCreator from "@/components/admin/KIRecipeCreator";
import KIBlogCreator from "@/components/admin/KIBlogCreator";
import { supabase } from "@/integrations/supabase/client";
import EditRecipeModal from "@/components/admin/EditRecipeModal";
import EditBlogPostModal from "@/components/admin/EditBlogPostModal";

interface AdminUser {
  id: string;
  display_name: string;
  email?: string;
  is_premium: boolean;
  custom_role?: string | null;
}

const tabs = [
  { key: "users", label: "Nutzer" },
  { key: "ki-recipe", label: "KI-Rezept erstellen" },
  { key: "ki-blog", label: "KI-Artikel erstellen" },
];

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<"users" | "ki-recipe" | "ki-blog">("users");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editRecipe, setEditRecipe] = useState<any | null>(null);
  const [editBlogPost, setEditBlogPost] = useState<any | null>(null);

  // Lade Nutzer für Tab "users"
  useEffect(() => {
    if (tab !== "users") return;
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setUsers(data || []);
        setLoading(false);
      });
  }, [tab]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-2">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
      {/* Tab Navigation */}
      <div className="flex gap-3 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded ${tab === t.key ? "bg-sage-500 text-white" : "bg-sage-100 text-sage-800 hover:bg-sage-200"} font-medium`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Inhalt */}
      {tab === "users" && (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin mr-2" /> Nutzer werden geladen ...
            </div>
          ) : error ? (
            <div className="text-red-600 p-4">{error}</div>
          ) : (
            <table className="w-full bg-white rounded-lg shadow overflow-hidden">
              <thead>
                <tr className="bg-sage-100 text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">Custom-Rolle</th>
                  <th className="p-2">Premium</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b last:border-none">
                    <td className="p-2">{u.display_name}</td>
                    <td className="p-2">{u.custom_role || "-"}</td>
                    <td className="p-2">{u.is_premium ? "Ja" : "Nein"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
      {tab === "ki-recipe" && <KIRecipeCreator />}
      {tab === "ki-blog" && <KIBlogCreator />}

      {/* Rezept & Blog Bearbeiten Modals */}
      {editRecipe && (
        <EditRecipeModal
          recipe={editRecipe}
          onClose={() => setEditRecipe(null)}
          onSaved={() => setEditRecipe(null)}
        />
      )}
      {editBlogPost && (
        <EditBlogPostModal
          post={editBlogPost}
          onClose={() => setEditBlogPost(null)}
          onSaved={() => setEditBlogPost(null)}
        />
      )}

      {/* Rezepte & Blogartikel Listen (kurzes Beispiel, ggf. aktualisieren nach deinem Aufbau) */}
      {tab === "ki-recipe" && (
        <div>
          {/* Rezepte-Liste editieren */}
          {/* Beispiel: */}
          {/* Mappe über Rezepte und biete "Bearbeiten"-Button an */}
          {/* <button onClick={() => setEditRecipe(recipe)}>Bearbeiten</button> */}
        </div>
      )}
      {tab === "ki-blog" && (
        <div>
          {/* Blogartikel-Liste editieren */}
          {/* Beispiel: */}
          {/* <button onClick={() => setEditBlogPost(post)}>Bearbeiten</button> */}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
