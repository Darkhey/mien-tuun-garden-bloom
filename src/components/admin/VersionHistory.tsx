
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type VersionType = "recipe" | "blog";

interface VersionHistoryProps {
  type: VersionType;
  itemId: string;
}

/**
 * Mapping für Table- und Column-Namen,
 * explizit als Literal-Typen, damit TypeScript keine Fehlermeldung wirft.
 */
const TABLE_MAP = {
  recipe: "recipe_versions",
  blog: "blog_post_versions",
} as const;

const COLUMN_ID_MAP = {
  recipe: "recipe_id",
  blog: "blog_post_id",
} as const;

const VersionHistory: React.FC<VersionHistoryProps> = ({ type, itemId }) => {
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchVersions() {
      // Wir casten table und idColumn als Literal-Typen
      const table = TABLE_MAP[type]; // "recipe_versions" | "blog_post_versions"
      const idColumn = COLUMN_ID_MAP[type]; // "recipe_id" | "blog_post_id"

      // table als Literal-Typen übergeben
      const { data } = await supabase
        .from(table)
        .select("*")
        .eq(idColumn, itemId)
        .order("created_at", { ascending: false });

      setVersions(data || []);
    }
    if (itemId) fetchVersions();
  }, [type, itemId]);

  if (!itemId) return null;

  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="font-bold mb-2">Versionen</h4>
      <div className="space-y-1 text-xs">
        {versions.map((v) => (
          <div key={v.id} className="border-b last:border-none py-1">
            <span className="font-mono">
              {v.created_at && new Date(v.created_at).toLocaleString()}
            </span>
            {type === "recipe" ? (
              <div>
                Titel: <b>{v.title}</b> | Status: <b>{v.status}</b>
              </div>
            ) : (
              <div>
                Titel: <b>{v.title}</b> | Status: <b>{v.status}</b> | Slug: {v.slug}
              </div>
            )}
          </div>
        ))}
        {versions.length === 0 && (
          <div className="text-muted-foreground">Keine Versionen gefunden.</div>
        )}
      </div>
    </div>
  );
};

export default VersionHistory;

