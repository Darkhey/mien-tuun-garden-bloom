
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type VersionType = "recipe" | "blog";

interface VersionHistoryProps {
  type: VersionType;
  itemId: string;
}

// Use a mapping to enforce valid table names for type safety
const TABLE_MAP = {
  recipe: "recipe_versions",
  blog: "blog_post_versions",
} as const;

const COLUMN_ID_MAP = {
  recipe: "recipe_id",
  blog: "blog_post_id",
} as const;

type TableKey = keyof typeof TABLE_MAP;

const VersionHistory: React.FC<VersionHistoryProps> = ({ type, itemId }) => {
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchVersions() {
      // Column to filter on
      const col = COLUMN_ID_MAP[type as TableKey];
      // Table to read from (ensure type safety for Supabase client)
      const table = TABLE_MAP[type as TableKey];

      // Typescript checks that table is a valid relation
      const { data } = await supabase
        .from<typeof table>(table)
        .select("*")
        .eq(col, itemId)
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
        {versions.map(v => (
          <div key={v.id} className="border-b last:border-none py-1">
            <span className="font-mono">{v.created_at && new Date(v.created_at).toLocaleString()}</span>
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
