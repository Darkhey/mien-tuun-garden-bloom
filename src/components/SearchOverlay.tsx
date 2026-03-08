import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk";
import { supabase } from "@/integrations/supabase/client";
import { Search, FileText, ChefHat } from "lucide-react";

interface SearchResult {
  type: "blog" | "recipe";
  title: string;
  slug: string;
  category?: string;
}

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const [blogRes, recipeRes] = await Promise.all([
        supabase.from("blog_posts").select("title, slug, category").eq("published", true).ilike("title", `%${q}%`).limit(5),
        supabase.from("recipes").select("title, slug, category").ilike("title", `%${q}%`).limit(5),
      ]);
      const blogs: SearchResult[] = (blogRes.data || []).map(r => ({ type: "blog", title: r.title, slug: r.slug, category: r.category }));
      const recipes: SearchResult[] = (recipeRes.data || []).map(r => ({ type: "recipe", title: r.title, slug: r.slug, category: r.category || "" }));
      setResults([...blogs, ...recipes]);
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false);
    setQuery("");
    navigate(result.type === "blog" ? `/blog/${result.slug}` : `/rezepte/${result.slug}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border border-border shadow-md">
        <CommandInput
          placeholder="Blog-Artikel oder Rezepte suchen..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading && <div className="py-6 text-center text-sm text-muted-foreground">Suche läuft...</div>}
          <CommandEmpty>{query.length >= 2 ? "Keine Ergebnisse gefunden." : "Mindestens 2 Zeichen eingeben..."}</CommandEmpty>
          {results.filter(r => r.type === "blog").length > 0 && (
            <CommandGroup heading="Blog-Artikel">
              {results.filter(r => r.type === "blog").map(r => (
                <CommandItem key={`blog-${r.slug}`} onSelect={() => handleSelect(r)} className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4 text-primary" />
                  <span>{r.title}</span>
                  {r.category && <span className="ml-auto text-xs text-muted-foreground">{r.category}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {results.filter(r => r.type === "recipe").length > 0 && (
            <CommandGroup heading="Rezepte">
              {results.filter(r => r.type === "recipe").map(r => (
                <CommandItem key={`recipe-${r.slug}`} onSelect={() => handleSelect(r)} className="cursor-pointer">
                  <ChefHat className="mr-2 h-4 w-4 text-accent" />
                  <span>{r.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
        <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
          <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">⌘K</kbd> zum Öffnen
          <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">ESC</kbd> zum Schließen
        </div>
      </Command>
    </CommandDialog>
  );
};

export default SearchOverlay;
