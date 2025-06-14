
import React, { useState } from "react";
import { Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const KIBlogCreator: React.FC = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Blogartikel mit KI generieren (Edge Function statt direktem API-Call)
  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(
        "https://ublbxvpmoccmegtwaslh.functions.supabase.co/generate-blog-post",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: input }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.content) throw new Error(data?.error ?? "Fehler bei der KI");
      setResult(data.content);
    } catch (err: any) {
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setLoading(false);
  };

  // Als Blogpost speichern (wie gehabt)
  const handleSave = async () => {
    setLoading(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Nicht eingeloggt!");
      const slug = "blog-" + Date.now();
      const { error } = await supabase.from("blog_posts").insert([{
        slug,
        title: input,
        excerpt: "",
        content: result,
        author: user.data.user.email,
        published: true,
        featured: false,
        featured_image: "",
        seo_title: "",
        seo_description: "",
        seo_keywords: [],
        tags: [],
        category: "Sonstiges",
        published_at: new Date().toISOString(),
        reading_time: 5
      }]);
      if (error) throw error;
      toast({ title: "Erstellt!", description: "Der Blogartikel wurde angelegt." });
    } catch (err: any) {
      toast({ title: "Fehler", description: String(err.message || err), variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow max-w-xl mx-auto">
      <h2 className="font-bold text-lg mb-2">KI Blogartikel erstellen</h2>
      <textarea
        className="w-full border rounded p-2 mb-2"
        rows={3}
        placeholder="Artikelthema (z.B. 'So wird dein Hochbeet im Sommer grün')"
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={loading}
      />
      <button
        className="bg-sage-500 hover:bg-sage-600 text-white px-4 py-2 rounded mb-2 flex items-center gap-2"
        onClick={handleGenerate}
        disabled={loading || !input}
      >
        {loading && <Loader className="h-4 w-4 animate-spin" />} Artikel generieren
      </button>
      {result && (
        <div className="mt-4 border-t pt-4">
          <code className="block whitespace-pre-wrap bg-sage-50 p-2 rounded text-[14px]">{result}</code>
          <button
            className="mt-3 bg-sage-700 hover:bg-sage-800 text-white px-4 py-2 rounded"
            onClick={handleSave}
            disabled={loading}
          >
            Als Blogartikel speichern
          </button>
        </div>
      )}
    </div>
  );
};

export default KIBlogCreator;
