import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Sparkles, X, Link, FileText } from "lucide-react";
import { aiImageGenerationService } from '@/services/AIImageGenerationService';
import ImageUploadField from "./ImageUploadField";
import SEOOptimizationPanel from './SEOOptimizationPanel';
import BlogLinkManager from './BlogLinkManager';
import BlogContentExtender from './BlogContentExtender';
import EditableBlogPreview from './EditableBlogPreview';
import type { SEOMetadata } from '@/services/SEOService';
import type { Database } from '@/integrations/supabase/types';

type BlogPostRow = Database['public']['Tables']['blog_posts']['Row'];

interface BlogPostFormState {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  featured_image: string;
  status: string;
}

interface EditBlogPostModalProps {
  post: Partial<BlogPostRow> | null;
  onClose: () => void;
  onSaved: () => void;
}

const extractExcerpt = (content?: string, fallback = ""): string => {
  if (!content) return fallback;
  const firstLine = content
    .split(/\n+/)
    .map((l) => l.replace(/^#+\s*/, "").trim())
    .find((l) => l.length > 0);
  return firstLine ? firstLine.slice(0, 200) : fallback;
};

const EditBlogPostModal: React.FC<EditBlogPostModalProps> = ({ post, onClose, onSaved }) => {
  const initData = (p: Partial<BlogPostRow> | null): BlogPostFormState => {
    const content = p?.content || "";
    return {
      title: p?.title || "",
      content,
      excerpt: p?.excerpt?.trim() || extractExcerpt(content, ""),
      category: p?.category || "",
      featured_image: p?.featured_image || "",
      status: p?.status || "entwurf",
    };
  };

  const [formData, setFormData] = useState(initData(post));
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [seoData, setSeoData] = useState<SEOMetadata | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'preview' | 'seo' | 'links'>('content');
  const { toast } = useToast();

  // Lade die Blog-Post Daten beim Öffnen
  useEffect(() => {
    console.log('[EditBlogModal] Loading post data:', post);
    setFormData(initData(post));
  }, [post]);

  const handleInputChange = (field: keyof BlogPostFormState, value: string) => {
    console.log(`[EditBlogModal] Updating ${field}:`, value);

    if (field === 'content') {
      const newExcerpt = formData.excerpt || extractExcerpt(value);
      setFormData(prev => ({
        ...prev,
        content: value,
        excerpt: newExcerpt
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const generateImageFromContent = async () => {
    if (!formData.title && !formData.content) {
      toast({
        title: "Fehler",
        description: "Titel oder Inhalt sind erforderlich für die Bildgenerierung",
        variant: "destructive",
      });
      return;
    }

    setGeneratingImage(true);
    try {
      const { url } = await aiImageGenerationService.generateBlogImage({
        title: formData.title || "Blog Bild",
        content: formData.content || "",
        category: formData.category,
      });

      setFormData((prev) => ({ ...prev, featured_image: url }));
      toast({ title: "Erfolg", description: "Bild wurde erfolgreich generiert!" });
    } catch (error: any) {
      console.error("Fehler bei der Bildgenerierung:", error);
      toast({
        title: "Fehler",
        description: "Bildgenerierung fehlgeschlagen: " + (error.message || "Unbekannter Fehler"),
        variant: "destructive",
      });
    } finally {
      setGeneratingImage(false);
    }
  };

  const removeCurrentImage = () => {
    setFormData(prev => ({ ...prev, featured_image: "" }));
    toast({
      title: "Bild entfernt",
      description: "Das Artikel-Bild wurde entfernt"
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Erstelle Backup der aktuellen Version - use maybeSingle() instead of single()
      const { data: current, error: fetchError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", post.id)
        .maybeSingle();

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

      console.log('[EditBlogModal] Saving blog post with data:', updateData);

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
      console.error('[EditBlogModal] Save error:', error);
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
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Blog-Artikel bearbeiten</DialogTitle>
        </DialogHeader>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4 border-b">
          <Button
            variant={activeTab === 'content' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('content')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Inhalt
          </Button>
          <Button
            variant={activeTab === 'preview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('preview')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Bearbeitbare Vorschau
          </Button>
          <Button
            variant={activeTab === 'seo' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('seo')}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            SEO
          </Button>
          <Button
            variant={activeTab === 'links' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('links')}
            className="flex items-center gap-2"
          >
            <Link className="h-4 w-4" />
            Verlinkungen
          </Button>
        </div>

        {activeTab === 'content' && (
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
                  placeholder="Kurze Beschreibung des Artikels (wird automatisch aus dem ersten Absatz generiert)"
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
                <Label>Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="entwurf">Entwurf</option>
                  <option value="veröffentlicht">Veröffentlicht</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Artikel-Bild</Label>
                <div className="space-y-3">
                  {formData.featured_image && (
                    <div className="relative">
                      <img
                        src={formData.featured_image}
                        alt="Aktuelles Artikel-Bild"
                        className="w-full max-w-md h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeCurrentImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
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
                </div>
              </div>

              <BlogContentExtender
                currentContent={formData.content}
                title={formData.title}
                category={formData.category}
                onContentExtended={(extendedContent) => 
                  handleInputChange("content", extendedContent)
                }
              />
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div>
            <EditableBlogPreview
              content={formData.content}
              onContentChange={(content) => handleInputChange("content", content)}
              title={formData.title}
            />
          </div>
        )}

        {activeTab === 'seo' && (
          <div>
            {formData.title && formData.content ? (
              <SEOOptimizationPanel
                title={formData.title}
                content={formData.content}
                excerpt={formData.excerpt}
                category={formData.category}
                featuredImage={formData.featured_image}
                onSEODataChange={(data) => {
                  console.log('[EditBlogModal] SEO data received:', data);
                  setSeoData(data as SEOMetadata);
                }}
              />
            ) : (
              <div className="p-4 border rounded-lg bg-gray-50 text-center text-gray-500">
                Füllen Sie Titel und Inhalt aus, um die SEO-Optimierung zu aktivieren
              </div>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <BlogLinkManager
            currentContent={formData.content}
            postId={post.id}
            onContentUpdate={(updatedContent) => 
              handleInputChange("content", updatedContent)
            }
          />
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
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
