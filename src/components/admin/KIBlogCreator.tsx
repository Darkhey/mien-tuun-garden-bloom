import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, TrendingUp, TestTube } from "lucide-react";
import TagSelector from "./TagSelector";
import BlogMetaSection from "./BlogMetaSection";
import MetaDebugTerminal from "./MetaDebugTerminal";
import BlogSuggestionWorkflow from "./BlogSuggestionWorkflow";
import EnhancedBlogArticleEditor from "./EnhancedBlogArticleEditor";
import SmartPromptOptimizer from "./SmartPromptOptimizer";
import PersonalizedContentGenerator from "./PersonalizedContentGenerator";
import BlogSystemTestDashboard from "./BlogSystemTestDashboard";
import { getTrendTags, buildContextFromMeta } from "./blogHelpers";
import { supabase } from "@/integrations/supabase/client";
import type { SEOMetadata } from '@/services/SEOService';
import { blogAnalyticsService } from "@/services/BlogAnalyticsService";

const TAG_OPTIONS = [
  "Schnell", "Kinder", "Tipps", "DIY", "Low Budget", "Bio", "Natur", "Regional", "Saisonal", "Nachhaltig", "Praktisch", "Dekor", "Haushalt",
  "Step-by-Step", "Checkliste", "Inspiration"
];

const KIBlogCreator: React.FC = () => {
  // Meta-Informationen State
  const [category, setCategory] = useState("");
  const [season, setSeason] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [audiences, setAudiences] = useState<string[]>([]);
  const [contentType, setContentType] = useState<string[]>([]);
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [dynamicTags, setDynamicTags] = useState<string[]>([]);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionSelections, setSuggestionSelections] = useState<string[]>([]);
  // Track which suggestions were erfolgreich gespeichert
  const [savedSuggestions, setSavedSuggestions] = useState<string[]>([]);
  // Empfehlungen aus echten Daten
  const [recommendedSuggestions, setRecommendedSuggestions] = useState<string[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  
  // Enhanced Editor State
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    // Enhanced Debug-Informationen
    const initializeSystem = async () => {
      const trendTags = getTrendTags(category, season);
      setDynamicTags(Array.from(new Set([...TAG_OPTIONS, ...trendTags])));
      
      // Test Supabase-Verbindung
      try {
        const { data, error } = await supabase.from('blog_posts').select('count').limit(1);
        if (error) throw error;
        setDebugLogs(prev => [...prev, `✅ Supabase-Verbindung erfolgreich - System bereit`]);
      } catch (error: any) {
        setDebugLogs(prev => [...prev, `❌ Supabase-Verbindung fehlgeschlagen: ${error.message}`]);
      }
      
      setDebugLogs(prev => [...prev, `Enhanced KI Blog Creator geladen - ${trendTags.length} Trend-Tags aktiv`]);
    };

    const loadRecommendations = async () => {
      setRecLoading(true);
      try {
        const posts = await blogAnalyticsService.fetchBlogPosts();
        const existing = blogAnalyticsService.extractKeywords(posts);
        const trends = await blogAnalyticsService.fetchCurrentTrends();
        const gaps = blogAnalyticsService.findKeywordGaps(trends, existing);
        const top = gaps.slice(0, 8).map(g => g.keyword);
        setRecommendedSuggestions(top);
        setDebugLogs(prev => [...prev, `Empfehlungen geladen (${top.length})`]);
      } catch (e: any) {
        setDebugLogs(prev => [...prev, `Empfehlungen fehlgeschlagen: ${e.message}`]);
      } finally {
        setRecLoading(false);
      }
    };
    
    initializeSystem();
    loadRecommendations();
  }, [category, season]);

  const handleSaveArticle = async (
    content: string,
    title: string,
    quality: any,
    featuredImage?: string,
    seoData?: SEOMetadata,
    suggestion?: string,
    weatherTags?: string[]
  ) => {
    try {
      console.log("Speichere Enhanced Artikel mit SEO und Wetter-Tags:", { 
        title, 
        quality: quality.score, 
        featuredImage, 
        hasSEO: !!seoData,
        weatherTags 
      });
      
      // Generiere einen eindeutigen Slug
      const baseSlug = title
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      const slug = `${baseSlug}-${Date.now()}`;

      // User Authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.warn('Auth-Fehler:', authError);
      }
      const currentUserId = user?.id || null;

      // Kombiniere normale Tags mit Wetter-Tags
      const allTags = [...new Set([...(tags || []), ...(weatherTags || [])])];

      // Pipeline-Config für Auto-Publish laden (optional)
      let shouldAutoPublish = false;
      let threshold = 999;
      try {
        const { data: config } = await supabase
          .from('pipeline_config')
          .select('quality_threshold, auto_publish')
          .limit(1)
          .maybeSingle();
        const qualityScore = Math.round(Number(quality?.score) || 0);
        threshold = config?.quality_threshold ?? threshold;
        shouldAutoPublish = !!(config?.auto_publish && qualityScore >= threshold);
      } catch (e) {
        // Kein Admin oder Tabelle nicht erreichbar -> kein Auto-Publish
      }

      const qualityScore = Math.round(Number(quality?.score) || 0);

      // Bereite erweiterte Artikel-Daten mit SEO und Wetter-Tags vor
      const article = {
        slug,
        title,
        content,
        excerpt: excerpt || content.slice(0, 200).replace(/<[^>]*>/g, ''),
        description: excerpt || content.slice(0, 300).replace(/<[^>]*>/g, ''),
        category: category || "Allgemein",
        season: season || "ganzjährig",
        tags: allTags,
        content_types: contentType.length ? contentType : ["blog"],
        audiences: audiences.length ? audiences : ["anfaenger"],
        featured_image: featuredImage || imageUrl || "",
        og_image: seoData?.ogImage || featuredImage || imageUrl || "",
        original_title: title,
        seo_description: seoData?.description || excerpt || content.slice(0, 156).replace(/<[^>]*>/g, ''),
        seo_title: seoData?.title || title,
        seo_keywords: seoData?.keywords || tags,
        structured_data: seoData?.structuredData ? JSON.stringify(seoData.structuredData) : null,
        published: shouldAutoPublish,
        featured: qualityScore > 90,
        reading_time: Math.ceil(content.split(/\s+/).length / 160),
        author: "Marianne",
        status: shouldAutoPublish ? "veröffentlicht" : "entwurf",
        user_id: currentUserId,
        quality_score: qualityScore,
      };

      // Blog-Post in Haupttabelle anlegen
      const { data: blogPost, error: blogPostError } = await supabase
        .from('blog_posts')
        .insert([article])
        .select()
        .maybeSingle();

      if (blogPostError || !blogPost) {
        throw new Error(`Blog-Post Speicher-Fehler: ${blogPostError?.message || 'Kein Blog-Post zurückgegeben'}`);
      }

      // Version für Tracking speichern
      const version = {
        blog_post_id: blogPost.id,
        user_id: currentUserId,
        ...article
      };

      const { error } = await supabase
        .from('blog_post_versions')
        .insert([version]);

      if (error) {
        console.warn('Version konnte nicht gespeichert werden:', error);
      }

      // Versuche, Log zu schreiben (optional, Admin erforderlich)
      try {
        await supabase.from('content_automation_logs').insert([
          {
            action: 'manual_create',
            status: 'success',
            details: { slug, title, category, season, shouldAutoPublish, qualityScore },
          }
        ]);
      } catch (logErr) {
        console.warn('Konnte content_automation_logs nicht schreiben (wahrscheinlich fehlende Berechtigung):', logErr);
      }
      
      toast({
        title: "Enhanced Artikel mit SEO und Wetter-Tags gespeichert!",
        description: `"${title}" wurde mit Quality Score ${quality.score} ${seoData ? 'und SEO-Optimierungen' : ''} ${weatherTags?.length ? `und ${weatherTags.length} Wetter-Tags` : ''} gespeichert.`,
      });
      
      if (suggestion) {
        // Markiere den Vorschlag als gespeichert, lasse ihn aber sichtbar
        setSavedSuggestions(prev =>
          prev.includes(suggestion) ? prev : [...prev, suggestion]
        );

        if (selectedPrompt === suggestion) {
          setSelectedPrompt("");
        }
      } else {
        setSelectedPrompt("");
      }

      setDebugLogs(prev => [
        ...prev,
        `Enhanced Artikel "${title}" erfolgreich gespeichert (Quality: ${quality.score})`
      ]);
    } catch (error: any) {
      console.error("Fehler beim Speichern:", error);
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="font-bold text-2xl">Enhanced KI Blog Creator</h2>
          <p className="text-gray-600">Intelligente Content-Generierung mit KI-Optimierung</p>
        </div>
      </div>
      
      <Tabs defaultValue="creator" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="creator" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Smart Creator
          </TabsTrigger>
          <TabsTrigger value="optimizer" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Prompt Optimizer
          </TabsTrigger>
          <TabsTrigger value="personalized" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Personalisiert
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            System-Tests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="creator" className="mt-6">
          {/* Meta-Informationen */}
          <BlogMetaSection
            category={category}
            setCategory={setCategory}
            season={season}
            setSeason={setSeason}
            audiences={audiences}
            setAudiences={setAudiences}
            contentType={contentType}
            setContentType={setContentType}
            excerpt={excerpt}
            setExcerpt={setExcerpt}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            tags={tags}
            setTags={setTags}
            dynamicTags={dynamicTags}
            loading={loading || isSuggesting}
          />

          {/* Empfehlungen aus echten Daten */}
          {recommendedSuggestions.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Empfehlungen aus echten Daten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {recommendedSuggestions.map((s, i) => {
                    const selected = suggestionSelections.includes(s);
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`border px-3 py-1 rounded-full text-sm transition ${selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}
                        onClick={() => setSuggestionSelections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                        disabled={loading || isSuggesting || recLoading}
                        aria-pressed={selected}
                      >
                        {selected ? '✓ ' : ''}{s}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestion Workflow */}
          <BlogSuggestionWorkflow
            topicInput={topicInput}
            setTopicInput={setTopicInput}
            category={category}
            season={season}
            audiences={audiences}
            contentType={contentType}
            tags={tags}
            excerpt={excerpt}
            imageUrl={imageUrl}
            suggestionSelections={suggestionSelections}
            setSuggestionSelections={setSuggestionSelections}
            setDebugLogs={setDebugLogs}
            loading={loading}
            setLoading={setLoading}
            isSuggesting={isSuggesting}
            setIsSuggesting={setIsSuggesting}
            suggestions={suggestions}
            setSuggestions={setSuggestions}
            toast={toast}
          />

          {/* Enhanced Artikel Editor für ausgewählte Vorschläge */}
          {suggestionSelections.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Enhanced Artikel für ausgewählte Vorschläge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {suggestionSelections.map((suggestion, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                      <h4 className="font-medium mb-3 text-lg">{suggestion}</h4>
                      {savedSuggestions.includes(suggestion) ? (
                        <div className="text-green-600 font-medium">✅ Gespeichert</div>
                      ) : (
                        <EnhancedBlogArticleEditor
                          initialPrompt={suggestion}
                          onSave={(content, title, quality, featuredImage, seoData, weatherTags) =>
                            handleSaveArticle(content, title, quality, featuredImage, seoData, suggestion, weatherTags)
                          }
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
              </CardContent>
            </Card>
          )}

          {/* Enhanced Einzelartikel Editor */}
          {suggestionSelections.length === 0 && selectedPrompt && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Enhanced Einzelartikel Generator</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedBlogArticleEditor
                  initialPrompt={selectedPrompt}
                  onSave={(content, title, quality, featuredImage, seoData, weatherTags) =>
                    handleSaveArticle(content, title, quality, featuredImage, seoData, selectedPrompt, weatherTags)
                  }
                  category={category}
                  season={season}
                  audiences={audiences}
                  contentType={contentType}
                  tags={tags}
                  excerpt={excerpt}
                  imageUrl={imageUrl}
                  toast={toast}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="optimizer" className="mt-6">
          <SmartPromptOptimizer />
        </TabsContent>

        <TabsContent value="personalized" className="mt-6">
          <PersonalizedContentGenerator />
        </TabsContent>

        <TabsContent value="testing" className="mt-6">
          <BlogSystemTestDashboard />
        </TabsContent>
      </Tabs>

      {/* Debug Terminal */}
      <MetaDebugTerminal logs={debugLogs} />
    </div>
  );
};

export default KIBlogCreator;
