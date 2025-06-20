import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Sparkles } from "lucide-react";
import ImageUploadField from "./ImageUploadField";
import SEOOptimizationPanel from './SEOOptimizationPanel';
import type { SEOMetadata } from '@/services/SEOService';

interface EditBlogPostModalProps {
  post: any;
  onClose: () => void;
  onSaved: () => void;
}

const EditBlogPostModal: React.FC<EditBlogPostModalProps> = ({ post, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    featured_image: "",
    status: "entwurf",
  });
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [seoData, setSeoData] = useState<SEOMetadata | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        content: post.content || "",
        excerpt: post.excerpt || "",
        category: post.category || "",
        featured_image: post.featured_image || "",
        status: post.status || "entwurf",
      });
    }
  }, [post]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateImageFromContent = async () => {
    if (!formData.title && !formData.content) {
      toast({
        title: "Fehler",
        description: "Titel oder Inhalt sind erforderlich für die Bildgenerierung",
        variant: "destructive"
      });
      return;
    }

    setGeneratingImage(true);
    try {
      console.log("Starte KI-Bildgenerierung für Blog-Artikel:", formData.title);
      
      // Erstelle einen aussagekräftigen Prompt basierend auf Titel und Inhalt
      const contentPreview = formData.content.slice(0, 200);
      const imagePrompt = `Hyperrealistisches, stimmungsvolles Garten- oder Küchenbild passend zum Thema "${formData.title}". Basierend auf: ${contentPreview}. Natürliches Licht, viel Atmosphäre, hochwertiger Fotografie-Stil. Ohne Text.`;

      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { prompt: imagePrompt }
      });

      if (error) {
        console.error("Fehler bei Supabase function invoke:", error);
        throw error;
      }

      console.log("KI-Bildgenerierung Antwort:", data);

      if (data.imageUrl) {
        setFormData(prev => ({ ...prev, featured_image: data.imageUrl }));
        toast({
          title: "Erfolg",
          description: "Bild wurde erfolgreich generiert!"
        });
      } else {
        throw new Error("Keine Bild-URL in der Antwort erhalten");
      }
    } catch (error: any) {
      console.error("Fehler bei der Bildgenerierung:", error);
      toast({
        title: "Fehler",
        description: "Bildgenerierung fehlgeschlagen: " + (error.message || "Unbekannter Fehler"),
        variant: "destructive"
      });
    }
    setGeneratingImage(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: current, error: fetchError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", post.id)
        .single<any>();

      if (fetchError) throw fetchError;

      if (current) {
        const user = await supabase.auth.getUser();
        const versionData = {
          blog_post_id: current.id,
          user_id: user.data.user?.id || "",
          title: current.title,
          slug: current.slug,
          content: current.content,
          excerpt: current.excerpt,
          category: current.category,
          tags: current.tags,
          content_types: current.content_types,
          season: (current as any).season || null,
          audiences: current.audiences,
          featured_image: current.featured_image,
          og_image: current.og_image,
          seo_title: current.seo_title,
          seo_description: current.seo_description,
          seo_keywords: current.seo_keywords,
          status: current.status,
          published: current.published,
          featured: current.featured,
          reading_time: current.reading_time,
          author: current.author,
        };
        await supabase.from("blog_post_versions").insert([versionData]);
      }

      // Erweiterte Daten mit SEO-Informationen
      const updateData = {
        ...formData,
        // SEO-Daten hinzufügen wenn verfügbar
        ...(seoData && {
          seo_title: seoData.title,
          seo_description: seoData.description,
          seo_keywords: seoData.keywords,
          structured_data: JSON.stringify(seoData.structuredData)
        })
      };

      const { error } = await supabase
        .from("blog_posts")
        .update(updateData)
        .eq("id", post.id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Blog-Artikel wurde mit SEO-Optimierungen aktualisiert"
      });
      onSaved();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Blog-Artikel bearbeiten</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Artikel-Titel"
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Kurzbeschreibung</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleInputChange("excerpt", e.target.value)}
                placeholder="Kurze Beschreibung des Artikels"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">Inhalt</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="Artikel-Inhalt (Markdown möglich)"
                rows={12}
              />
            </div>

            <div>
              <Label htmlFor="category">Kategorie</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                placeholder="Kategorie"
              />
            </div>

            <div>
              <Label>Artikel-Bild</Label>
              <div className="space-y-3">
                <ImageUploadField
                  value={formData.featured_image}
                  onChange={(imageUrl) => handleInputChange("featured_image", imageUrl)}
                  bucket="blog-images"
                  disabled={loading || generatingImage}
                />
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">oder</span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateImageFromContent}
                    disabled={generatingImage || (!formData.title && !formData.content)}
                    className="flex items-center gap-2"
                  >
                    {generatingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {generatingImage ? "Generiere Bild..." : "KI-Bild generieren"}
                  </Button>
                </div>
                
                {formData.featured_image && (
                  <div className="mt-3">
                    <img
                      src={formData.featured_image}
                      alt="Artikel-Bild Vorschau"
                      className="w-full max-w-md h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="entwurf">Entwurf</option>
                <option value="veröffentlicht">Veröffentlicht</option>
              </select>
            </div>
          </div>

          {/* Neue SEO-Spalte */}
          <div>
            <SEOOptimizationPanel
              title={formData.title}
              content={formData.content}
              excerpt={formData.excerpt}
              category={formData.category}
              featuredImage={formData.featured_image}
              onSEODataChange={setSeoData}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBlogPostModal;
