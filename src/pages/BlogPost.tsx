import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Calendar, User, ArrowLeft, Tag, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Hilfsfunktion zum Slugifizieren eines Strings (einfache deutsche Variante)
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

const BlogPost = () => {
  const { slug } = useParams();

  // Mock Blogdaten (in Echt aus CMS/API)
  const post = {
    slug: slug || "kraeutergarten-anlegen",
    title: 'Den perfekten Kräutergarten anlegen',
    content: `
      <p>Ein eigener Kräutergarten ist der Traum vieler Hobby-Köche und Gartenliebhaber. Frische Kräuter direkt vor der Haustür zu haben, bedeutet nicht nur aromatischere Gerichte, sondern auch die Gewissheit, was man zu sich nimmt.</p>
      <h2>Planung ist alles</h2>
      <p>Bevor Sie mit dem Anlegen beginnen, sollten Sie sich Gedanken über den Standort machen. Die meisten Kräuter bevorzugen einen sonnigen bis halbschattigen Platz mit durchlässigem Boden.</p>
      <h3>Die wichtigsten Faktoren:</h3>
      <ul>
        <li>Sonneneinstrahlung (mindestens 4-6 Stunden täglich)</li>
        <li>Windschutz</li>
        <li>Wasserzugang</li>
        <li>Qualität des Bodens</li>
      </ul>
      <h2>Die richtigen Kräuter wählen</h2>
      <p>Für Anfänger eignen sich besonders robuste und pflegeleichte Kräuter wie Basilikum, Petersilie, Schnittlauch und Rosmarin.</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=600&fit=crop',
    author: 'Anna',
    publishedAt: '2024-06-10',
    readingTime: 8,
    category: 'Garten & Pflanzen',
    tags: ['Kräuter', 'Garten', 'Anfänger', 'DIY']
  };

  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<any | null>(null); // Vorschau für Rezept-KI-Response
  const { toast } = useToast();

  // Hilfsfunktion: Rezept als Preview holen (aber nicht speichern)
  const handlePreviewRecipe = async () => {
    setSaving(true);
    setPreview(null);
    try {
      const resp = await fetch(
        `https://ublbxvpmoccmegtwaslh.functions.supabase.co/blog-to-recipe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: post.title,
            content: post.content,
            image: post.featuredImage,
          }),
        }
      );
      if (!resp.ok) throw new Error("Fehler bei der KI-Antwort");
      const { recipe } = await resp.json();
      setPreview(recipe);
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: String(err.message || err),
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  // Handlespeichern (wirklich in DB übernehmen)
  const handleSaveRecipe = async () => {
    setSaving(true);
    try {
      // Hole KI-Extrakt
      let recipe = preview;
      if (!recipe) {
        const resp = await fetch(
          `https://ublbxvpmoccmegtwaslh.functions.supabase.co/blog-to-recipe`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: post.title,
              content: post.content,
              image: post.featuredImage,
            }),
          }
        );
        if (!resp.ok) throw new Error("Fehler bei der KI-Antwort");
        const data = await resp.json();
        recipe = data.recipe;
      }

      // Slug generieren: zuerst bevorzugt KI-Response nutzen, sonst aus Titel generieren
      const recipeSlug =
        (recipe && typeof recipe.slug === 'string' && recipe.slug.length > 0)
          ? recipe.slug
          : slugify(recipe?.title || post.title);

      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Nicht eingeloggt!");

      // ingredients und instructions robust als JSON speichern
      const insertObj = {
        user_id: user.data.user.id,
        title: recipe.title,
        slug: recipeSlug,
        image_url: recipe.image || post.featuredImage,
        description: recipe.description || "",
        ingredients: recipe.ingredients ?? null,
        instructions: recipe.instructions ?? null,
        source_blog_slug: post.slug,
      };

      const { error } = await supabase.from("recipes").insert([insertObj]);
      if (error) throw error;

      toast({
        title: "Rezept gespeichert!",
        description: "Das Rezept wurde in dein Rezeptbuch übernommen.",
      });
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: String(err.message || err),
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  // Zutaten und Anweisungen robust extrahieren
  function parseArray(val: any): any[] {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try { const arr = JSON.parse(val); if(Array.isArray(arr)) return arr;} catch {}
    }
    return [];
  }

  return (
    <Layout title={`${post.title} - Blog`}>
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link
          to="/blog"
          className="inline-flex items-center text-sage-600 hover:text-sage-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Blog
        </Link>
      </div>

      <article className="max-w-4xl mx-auto px-4 pb-16">
        <header className="mb-8">
          <div className="mb-4">
            <span className="bg-sage-100 text-sage-700 px-3 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-earth-500 mb-8">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              {post.author}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(post.publishedAt).toLocaleDateString('de-DE')}
            </div>
            <span>{post.readingTime} Min Lesezeit</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-sage-50 text-sage-700 px-3 py-1 rounded-full text-sm"
              >
                <Tag className="h-3 w-3 inline mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-12">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-earth prose-headings:font-serif prose-headings:text-earth-800 prose-p:text-earth-600 prose-li:text-earth-600 prose-strong:text-earth-800"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* KI-Vorschau & Buttons */}
        <div className="max-w-4xl mx-auto px-4 mt-8 flex gap-4">
          <button
            onClick={handlePreviewRecipe}
            disabled={saving}
            className="bg-sage-500 text-white px-6 py-2 rounded-full hover:bg-sage-600 transition-colors flex items-center gap-2"
          >
            {saving && <Loader className="animate-spin h-4 w-4" />}
            Vorschau KI-Rezept
          </button>
          <button
            onClick={handleSaveRecipe}
            disabled={saving}
            className="bg-sage-600 text-white px-6 py-2 rounded-full hover:bg-sage-700 transition-colors flex items-center gap-2"
          >
            {saving && <Loader className="animate-spin h-4 w-4" />}
            Als Rezept speichern
          </button>
        </div>

        {/* Vorschau (alles dynamisch) */}
        {preview && (
          <div className="mt-8 bg-white rounded-xl shadow p-6">
            <h3 className="font-serif text-2xl font-bold text-earth-800 mb-4 flex gap-2 items-center">
              <span>🎉</span> Vorschau auf das extrahierte Rezept
            </h3>
            <div className="mb-2">
              <div className="text-sage-800 text-lg font-bold">{preview.title}</div>
              {preview.image && (
                <img src={preview.image} className="my-3 w-full max-h-64 object-cover rounded-md" />
              )}
              <div className="mb-2 text-sage-700">{preview.description}</div>
            </div>
            {/* Zutaten (dynamisch) */}
            {preview.ingredients && parseArray(preview.ingredients).length > 0 && (
              <div className="mb-3">
                <div className="font-semibold">Zutaten:</div>
                <ul className="pl-4 list-disc">
                  {parseArray(preview.ingredients).map((ing: any, idx: number) =>
                    <li key={idx}>{typeof ing === "string" ? ing : ing.name + (ing.amount ? ` (${ing.amount} ${ing.unit || ""})` : "")}</li>
                  )}
                </ul>
              </div>
            )}
            {/* Schritte (dynamisch) */}
            {preview.instructions && parseArray(preview.instructions).length > 0 && (
              <div className="mb-3">
                <div className="font-semibold">Schritte:</div>
                <ol className="list-decimal pl-6">
                  {parseArray(preview.instructions).map((step: any, idx: number) =>
                    <li key={idx}>{typeof step === "string" ? step : (step.text || JSON.stringify(step))}</li>
                  )}
                </ol>
              </div>
            )}
            {/* Tipps wenn aus KI */}
            {preview.tips && parseArray(preview.tips).length > 0 && (
              <div>
                <div className="font-semibold">Tipps:</div>
                <ul className="pl-4 list-disc">
                  {parseArray(preview.tips).map((tip: any, idx: number) =>
                    <li key={idx}>{typeof tip === "string" ? tip : JSON.stringify(tip)}</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Share Section */}
        <div className="mt-12 pt-8 border-t border-sage-200">
          <div className="bg-sage-50 rounded-xl p-6 text-center">
            <h3 className="text-xl font-serif font-bold text-earth-800 mb-4">
              Hat dir dieser Artikel gefallen?
            </h3>
            <p className="text-earth-600 mb-6">
              Teile ihn mit deinen Freunden und lass dich von weiteren Gartentipps inspirieren!
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-sage-600 text-white px-6 py-2 rounded-full hover:bg-sage-700 transition-colors">
                Bei Pinterest merken
              </button>
              <button className="bg-earth-600 text-white px-6 py-2 rounded-full hover:bg-earth-700 transition-colors">
                Auf Facebook teilen
              </button>
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default BlogPost;
