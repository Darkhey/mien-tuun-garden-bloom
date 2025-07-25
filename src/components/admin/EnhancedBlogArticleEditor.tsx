
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, Save, Sparkles, CheckCircle, AlertCircle, Image as ImageIcon, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOService, type SEOMetadata } from '@/services/SEOService';
import { WeatherContentService } from '@/services/WeatherContentService';
import DOMPurify from 'dompurify';

interface QualityMetrics {
  generationTime: number;
  model: string;
  wordCount: number;
  readingTime: number;
  qualityScore: number;
  seoScore: number;
  weatherTags?: string[];
}

interface EnhancedBlogArticleEditorProps {
  initialPrompt?: string;
  onSave: (
    content: string,
    title: string,
    quality: QualityMetrics,
    featuredImage?: string,
    seoData?: SEOMetadata,
    weatherTags?: string[]
  ) => void;
  category?: string;
  season?: string;
  audiences?: string[];
  contentType?: string[];
  tags?: string[];
  excerpt?: string;
  imageUrl?: string;
  toast: any;
}

const EnhancedBlogArticleEditor: React.FC<EnhancedBlogArticleEditorProps> = ({
  initialPrompt = "",
  onSave,
  category,
  season,
  audiences,
  contentType,
  tags,
  excerpt,
  imageUrl: propImageUrl,
  toast
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<QualityMetrics | null>(null);
  const [seoMetadata, setSeoMetadata] = useState<SEOMetadata | null>(null);
  const [featuredImage, setFeaturedImage] = useState("");

  const generateArticle = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Prompt ein",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");
    setGeneratedTitle("");
    setCurrentQuality(null);
    setSeoMetadata(null);
    setFeaturedImage("");

    const startTime = Date.now();

    try {
      console.log('[EnhancedBlogEditor] Starte Artikel-Generierung mit Prompt:', prompt);

      // Generiere Artikel über Supabase Function
      const { data: articleData, error: articleError } = await supabase.functions.invoke('generate-blog-post', {
        body: {
          prompt,
          context: {
            category: category || 'Allgemein',
            season: season || 'ganzjährig',
            audiences: audiences || ['anfaenger'],
            contentType: contentType || ['blog'],
            tags: tags || [],
            excerpt: excerpt || ''
          }
        }
      });

      if (articleError) {
        console.error('[EnhancedBlogEditor] Artikel-Generierung Fehler:', articleError);
        throw new Error(`Artikel-Generierung fehlgeschlagen: ${articleError.message}`);
      }

      if (!articleData?.content) {
        throw new Error('Kein Artikel-Content generiert');
      }

      console.log('[EnhancedBlogEditor] Artikel erfolgreich generiert');

      // Titel aus Content extrahieren oder verwenden
      const newTitle = articleData.title || prompt;
      const newContent = articleData.content;

      setGeneratedContent(newContent);
      setGeneratedTitle(newTitle);

      // SEO-Daten generieren
      const seoService = SEOService.getInstance();
      const seoData = await seoService.generateBlogPostSEO({
        title: newTitle,
        content: newContent,
        category: category || '',
        tags: tags || [],
        excerpt: excerpt,
      });

      setSeoMetadata(seoData);

      // Versuche Bild zu generieren - mit besserer Fehlerbehandlung
      let selectedImageUrl = propImageUrl || "";
      
      if (!selectedImageUrl) {
        try {
          console.log('[EnhancedBlogEditor] Starte Bildgenerierung...');
          
          // Erstelle einen fokussierten Bildprompt
          const imagePrompt = `Realistisches Gartenbild passend zu: "${newTitle}". ${category ? `Kategorie: ${category}.` : ''} Natürliches Licht, ohne Text.`;
          
          const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-blog-image', {
            body: { 
              prompt: imagePrompt,
              context: {
                title: newTitle,
                category: category || 'Garten',
                season: season || 'ganzjährig'
              }
            }
          });

          if (imageError) {
            console.warn('[EnhancedBlogEditor] Bildgenerierung fehlgeschlagen:', imageError);
            // Verwende Fallback-Bild statt Fehler zu werfen
            selectedImageUrl = "/lovable-uploads/2a3ad273-430b-4675-b1c4-33dbaac0b6cf.png";
          } else if (imageData?.imageUrl) {
            selectedImageUrl = imageData.imageUrl;
            console.log('[EnhancedBlogEditor] Bild erfolgreich generiert:', selectedImageUrl);
          } else {
            console.warn('[EnhancedBlogEditor] Keine Bild-URL erhalten, verwende Fallback');
            selectedImageUrl = "/lovable-uploads/2a3ad273-430b-4675-b1c4-33dbaac0b6cf.png";
          }
        } catch (imageGenError) {
          console.error('[EnhancedBlogEditor] Fehler bei der Bildgenerierung:', imageGenError);
          // Verwende Fallback-Bild
          selectedImageUrl = "/lovable-uploads/2a3ad273-430b-4675-b1c4-33dbaac0b6cf.png";
          
          toast({
            title: "Bildgenerierung fehlgeschlagen",
            description: "Verwende Standard-Bild. Artikel wird trotzdem erstellt.",
            variant: "default",
          });
        }
      }

      setFeaturedImage(selectedImageUrl);

      // Generate weather tags from content
      const weatherTags = WeatherContentService.extractWeatherTags(
        newTitle,
        newContent,
        category || ''
      );

      const quality: QualityMetrics = {
        generationTime: Date.now() - startTime,
        model: "Enhanced GPT-4o",
        wordCount: newContent.split(/\s+/).length,
        readingTime: Math.ceil(newContent.split(/\s+/).length / 160),
        qualityScore: calculateQualityScore(newContent, newTitle),
        seoScore: seoService.analyzeSEO({ title: newTitle, content: newContent, excerpt }).score,
        weatherTags
      };

      setCurrentQuality(quality);

      toast({
        title: "Enhanced Artikel generiert!",
        description: `Quality Score: ${quality.qualityScore}, SEO Score: ${quality.seoScore}${weatherTags.length > 0 ? `, Weather Tags: ${weatherTags.join(', ')}` : ''}`,
      });
    } catch (error: any) {
      console.error("Enhanced Generation Error:", error);
      
      const quality: QualityMetrics = {
        generationTime: Date.now() - startTime,
        model: "Enhanced GPT-4o (Fallback)",
        wordCount: 0,
        readingTime: 0,
        qualityScore: 0,
        seoScore: 0,
        weatherTags: []
      };

      setCurrentQuality(quality);
      
      toast({
        title: "Generierung fehlgeschlagen",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedContent || !generatedTitle || !currentQuality) {
      toast({
        title: "Fehler",
        description: "Kein Artikel zum Speichern vorhanden",
        variant: "destructive",
      });
      return;
    }

    onSave(
      generatedContent,
      generatedTitle,
      currentQuality,
      featuredImage,
      seoMetadata,
      currentQuality.weatherTags
    );
  };

  const calculateQualityScore = (content: string, title: string): number => {
    let score = 50;

    if (content.length > 500) score += 10;
    if (title.length > 5) score += 10;
    if (category) score += 5;
    if (season) score += 5;
    if (audiences?.length) score += 5;
    if (contentType?.length) score += 5;
    if (tags?.length) score += 10;

    return Math.min(score, 100);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Prompt Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Enhanced Artikel Generator mit SEO & Wetter-Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prompt">Artikel-Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Beschreibe den gewünschten Artikel..."
              className="mt-1"
              rows={3}
            />
          </div>
          
          <Button 
            onClick={generateArticle}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generiere Enhanced Artikel...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Enhanced Artikel mit SEO & Weather Tags generieren
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quality Metrics & Weather Tags */}
      {currentQuality && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Enhanced Quality Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentQuality.qualityScore}</div>
                <div className="text-sm text-gray-600">Quality Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentQuality.seoScore}</div>
                <div className="text-sm text-gray-600">SEO Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{currentQuality.wordCount}</div>
                <div className="text-sm text-gray-600">Wörter</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{currentQuality.readingTime}min</div>
                <div className="text-sm text-gray-600">Lesezeit</div>
              </div>
            </div>
            
            {currentQuality.weatherTags && currentQuality.weatherTags.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm font-medium">Wetter-Tags:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentQuality.weatherTags.map(tag => (
                    <Badge key={tag} className="bg-blue-100 text-blue-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SEO Metadata Preview */}
      {seoMetadata && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-sky-600" />
              SEO Metadata Vorschau
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Titel</Label>
              <Input type="text" value={seoMetadata.title} readOnly />
            </div>
            <div className="space-y-1">
              <Label>Beschreibung</Label>
              <Textarea value={seoMetadata.description} readOnly rows={2} />
            </div>
            <div className="space-y-1">
              <Label>Keywords</Label>
              <Input type="text" value={seoMetadata.keywords.join(', ')} readOnly />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured Image Preview */}
      {featuredImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-orange-600" />
              Featured Image Vorschau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <img src={featuredImage} alt="Featured" className="rounded-md shadow-md max-w-full h-auto" />
          </CardContent>
        </Card>
      )}

      {/* Content Preview & Save */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-green-600" />
              Artikel Vorschau
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-xl font-semibold">{generatedTitle}</h3>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generatedContent) }} />
            <Button
              onClick={handleSave}
              disabled={isGenerating}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              Artikel Speichern
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedBlogArticleEditor;
