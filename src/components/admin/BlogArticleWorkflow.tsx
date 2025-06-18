import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import BlogPromptEditor from "./BlogPromptEditor";
import EnhancedBlogArticleEditor from "./EnhancedBlogArticleEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { generateUniqueSlug, sanitizeContent, validateBlogPostData } from "@/utils/slugHelpers";

interface BlogArticleWorkflowProps {
  suggestionSelections: string[];
  loading: boolean;
  setLoading: (l: boolean) => void;
  prompt: string;
  setPrompt: (p: string) => void;
  input: string;
  setInput: (v: string) => void;
  isPromptImproved: boolean;
  setIsPromptImproved: (b: boolean) => void;
  handleImprovePrompt: () => void;
  canGenerate: boolean;
  editing: string;
  setEditing: (e: string) => void;
  generated: string | null;
  setGenerated: (g: string | null) => void;
  category: string;
  season: string;
  audiences: string[];
  contentType: string[];
  tags: string[];
  excerpt: string;
  imageUrl: string;
  setDebugLogs: React.Dispatch<React.SetStateAction<string[]>>;
  toast: ReturnType<typeof import("@/hooks/use-toast").useToast>["toast"];
}

const BlogArticleWorkflow: React.FC<BlogArticleWorkflowProps> = ({
  suggestionSelections, loading, setLoading,
  prompt, setPrompt, input, setInput,
  isPromptImproved, setIsPromptImproved, handleImprovePrompt,
  canGenerate, editing, setEditing,
  generated, setGenerated,
  category, season, audiences, contentType, tags, excerpt, imageUrl,
  setDebugLogs, toast,
}) => {
  const [enhancedArticles, setEnhancedArticles] = useState<
    { suggestion: string; status: "loading" | "editing" | "saved" }[]
  >([]);

  const handleSaveArticle = async (content: string, title: string, quality: any, suggestion: string) => {
    console.log('[BlogWorkflow] Starte Artikel-Speicherung:', { title, suggestion, quality });
    setDebugLogs(prev => [...prev, `[SAVE] Beginne Speicherung: "${title}"`]);
    
    try {
      // Validierung der Eingabedaten
      const articleData = {
        title: title || suggestion,
        content,
        excerpt,
        category: category || "Allgemein",
        season: season || "ganzjährig"
      };

      const validation = validateBlogPostData(articleData);
      if (!validation.isValid) {
        throw new Error(`Validierungsfehler: ${validation.errors.join(', ')}`);
      }

      // Sichere Content-Sanitization
      const sanitizedContent = sanitizeContent(content);
      const sanitizedTitle = title.replace(/<[^>]*>/g, ''); // HTML-Tags aus Titel entfernen

      // Generiere einen eindeutigen Slug
      const slug = await generateUniqueSlug(sanitizedTitle || suggestion);
      console.log('[BlogWorkflow] Generierter eindeutiger Slug:', slug);

      // User Authentication mit verbesserter Behandlung
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.warn('[BlogWorkflow] Auth-Fehler:', authError);
      }

      const currentUserId = user?.id || null; // NULL statt leerer String
      
      // Bereite Artikel-Daten vor
      const article = {
        slug,
        title: sanitizedTitle || suggestion,
        content: sanitizedContent,
        excerpt: excerpt || sanitizedContent.slice(0, 200).replace(/<[^>]*>/g, ''),
        description: excerpt || sanitizedContent.slice(0, 300).replace(/<[^>]*>/g, ''),
        category: category || "Allgemein",
        season: season || "ganzjährig",
        tags: tags.length ? tags : [],
        content_types: contentType.length ? contentType : ["blog"],
        audiences: audiences.length ? audiences : ["anfaenger"],
        featured_image: imageUrl || "",
        og_image: imageUrl || "",
        original_title: sanitizedTitle || suggestion,
        seo_description: excerpt || sanitizedContent.slice(0, 156).replace(/<[^>]*>/g, ''),
        seo_title: sanitizedTitle || suggestion,
        seo_keywords: tags.length ? tags : [],
        published: false,
        featured: quality?.score > 90,
        reading_time: Math.ceil(sanitizedContent.split(/\s+/).length / 160),
        author: "KI-Enhanced Pipeline",
        status: "entwurf",
        user_id: currentUserId
      };

      console.log('[BlogWorkflow] Artikel-Daten vorbereitet:', article);
      setDebugLogs(prev => [...prev, `[SAVE] Daten vorbereitet für Slug: ${slug}`]);

      // Blog-Post in Haupttabelle anlegen
      console.log('[BlogWorkflow] Sende Insert-Request an Supabase (Post)...');
      const { data: blogPost, error: blogPostError } = await supabase
        .from('blog_posts')
        .insert([article])
        .select()
        .single();

      if (blogPostError) {
        console.error('[BlogWorkflow] Supabase Insert Fehler (Post):', blogPostError);
        setDebugLogs(prev => [...prev, `[ERROR] Supabase Fehler: ${blogPostError.message}`]);
        throw new Error(`Blog-Post Speicher-Fehler: ${blogPostError.message}`);
      }

      // Version für Tracking speichern - mit updated_at Trigger
      console.log('[BlogWorkflow] Sende Insert-Request an Supabase (Version)...');
      const version = {
        blog_post_id: blogPost.id,
        user_id: currentUserId,
        ...article
      };
      
      const { data, error } = await supabase
        .from('blog_post_versions')
        .insert([version])
        .select()
        .single();

      if (error) {
        console.error('[BlogWorkflow] Supabase Insert Fehler (Version):', error);
        setDebugLogs(prev => [...prev, `[ERROR] Version Speicher-Fehler: ${error.message}`]);
        // Version-Fehler ist nicht kritisch, Post wurde bereits gespeichert
        console.warn('[BlogWorkflow] Version konnte nicht gespeichert werden, Post ist aber verfügbar');
      } else {
        console.log('[BlogWorkflow] Version erfolgreich gespeichert:', data);
        setDebugLogs(prev => [...prev, `[SUCCESS] Version gespeichert mit ID: ${data.id}`]);
      }

      // Sicherheitsereignis protokollieren
      try {
        await supabase.rpc('log_security_event', {
          _event_type: 'blog_post_created',
          _target_user_id: null,
          _details: { 
            blog_post_id: blogPost.id, 
            title: sanitizedTitle,
            slug: slug,
            created_via: 'ki_workflow'
          },
          _severity: 'low'
        });
        console.log('[BlogWorkflow] Sicherheitsereignis protokolliert');
      } catch (securityError) {
        console.warn('[BlogWorkflow] Sicherheitsereignis konnte nicht protokolliert werden:', securityError);
      }
      
      // Update Status in Enhanced Articles
      setEnhancedArticles(prev => 
        prev.map(item => 
          item.suggestion === suggestion 
            ? { ...item, status: "saved" }
            : item
        )
      );
      
      toast({
        title: "✅ Enhanced Artikel gespeichert!",
        description: `"${sanitizedTitle}" wurde als Entwurf gespeichert (ID: ${blogPost.id})`,
        variant: "default",
      });
      
      setDebugLogs(prev => [...prev, `[COMPLETE] Artikel-Speicherung abgeschlossen für "${sanitizedTitle}"`]);

    } catch (err: any) {
      console.error('[BlogWorkflow] Fehler beim Speichern:', err);
      setDebugLogs(prev => [...prev, `[ERROR] Speicher-Fehler: ${err.message}`]);
      
      toast({
        title: "❌ Fehler beim Speichern",
        description: `Artikel konnte nicht gespeichert werden: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  // Enhanced Multi-Artikel Handler
  const handleGenerateEnhancedMultiple = async () => {
    if (!suggestionSelections.length) return;
    setLoading(true);
    
    setEnhancedArticles(
      suggestionSelections.map(s => ({
        suggestion: s,
        status: "loading"
      }))
    );
    
    setDebugLogs(prev => [...prev, `Starte Enhanced Multi-Artikel-Generation für ${suggestionSelections.length} Vorschläge.`]);
    
    // Nach kurzer Delay auf "editing" setzen (simuliert Generierung)
    setTimeout(() => {
      setEnhancedArticles(prev => 
        prev.map(item => ({ ...item, status: "editing" }))
      );
      setLoading(false);
      setDebugLogs(prev => [...prev, "Enhanced Artikel-Editoren bereit"]);
    }, 2000);
  };

  return (
    <div>
      {suggestionSelections.length > 0 && (
        <Button className="mb-4" onClick={handleGenerateEnhancedMultiple} disabled={loading}>
          {loading && <span className="mr-2"><Skeleton className="w-4 h-4 rounded-full inline-block" /></span>}
          Enhanced Artikel für {suggestionSelections.length} Vorschlag{suggestionSelections.length > 1 ? "e" : ""} generieren
        </Button>
      )}

      <BlogPromptEditor
        input={input}
        setInput={setInput}
        prompt={prompt}
        setPrompt={setPrompt}
        handleImprovePrompt={handleImprovePrompt}
        isPromptImproved={isPromptImproved}
        loading={loading}
        isSuggesting={false}
      />

      {/* Enhanced Multi-Artikel-Editoren */}
      {enhancedArticles.length > 0 && (
        <div className="grid gap-6 mt-6">
          {enhancedArticles.map((item, idx) => (
            <div key={idx} className="border rounded-xl p-4 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{item.suggestion}</h3>
                {item.status === "saved" && (
                  <span className="text-green-600 text-sm">✅ Gespeichert</span>
                )}
              </div>
              
              {item.status === "loading" && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Skeleton className="w-full h-6 rounded mb-3" />
                  <Skeleton className="w-3/4 h-4 rounded mb-3" />
                  <Skeleton className="w-1/2 h-4 rounded" />
                  <div className="animate-pulse mt-4 text-blue-600 font-medium">
                    Enhanced Content wird generiert...
                  </div>
                </div>
              )}
              
              {item.status === "editing" && (
                <EnhancedBlogArticleEditor
                  initialPrompt={item.suggestion}
                  onSave={(content, title, quality) => handleSaveArticle(content, title, quality, item.suggestion)}
                  category={category}
                  season={season}
                  audiences={audiences}
                  contentType={contentType}
                  tags={tags}
                  excerpt={excerpt}
                  imageUrl={imageUrl}
                  toast={toast}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Einzelartikel Editor (wenn keine Multi-Auswahl) */}
      {enhancedArticles.length === 0 && canGenerate && (
        <div className="mt-6 p-4 border rounded-xl bg-gradient-to-r from-green-50 to-blue-50">
          <h3 className="font-semibold mb-3">Enhanced Einzelartikel Generator</h3>
          <EnhancedBlogArticleEditor
            initialPrompt={prompt || input}
            onSave={(content, title, quality) => handleSaveArticle(content, title, quality, "Einzelartikel")}
            category={category}
            season={season}
            audiences={audiences}
            contentType={contentType}
            tags={tags}
            excerpt={excerpt}
            imageUrl={imageUrl}
            toast={toast}
          />
        </div>
      )}
    </div>
  );
};

export default BlogArticleWorkflow;