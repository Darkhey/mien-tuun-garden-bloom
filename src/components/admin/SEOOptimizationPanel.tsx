import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, RefreshCw, Eye, Copy, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import SEOScoreIndicator from '../seo/SEOScoreIndicator';
import SEOService, { type SEOMetadata, type SEOAnalysis } from '@/services/SEOService';
import EnhancedSEOService, { type EnhancedSEOAnalysis } from '@/services/EnhancedSEOService';
import { generateSlug } from '@/utils/blogSeo';

interface SEOOptimizationPanelProps {
  title: string;
  content: string;
  excerpt: string;
  category?: string;
  tags?: string[];
  featuredImage?: string;
  onSEODataChange: (seoData: Partial<SEOMetadata>) => void;
  className?: string;
}

const SEOOptimizationPanel: React.FC<SEOOptimizationPanelProps> = ({
  title,
  content,
  excerpt,
  category,
  tags,
  featuredImage,
  onSEODataChange,
  className
}) => {
  const [seoData, setSeoData] = useState<SEOMetadata | null>(null);
  const [enhancedAnalysis, setEnhancedAnalysis] = useState<EnhancedSEOAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [customSeoTitle, setCustomSeoTitle] = useState('');
  const [customSeoDescription, setCustomSeoDescription] = useState('');
  const [previewMode, setPreviewMode] = useState<'google' | 'facebook' | 'twitter'>('google');

  const seoService = SEOService.getInstance();
  const enhancedSeoService = EnhancedSEOService.getInstance();

  // Automatische SEO-Generierung bei Änderungen
  useEffect(() => {
    if (title && content) {
      generateSEOData();
    }
  }, [title, content, excerpt, category, tags, featuredImage]);

  const generateSEOData = async () => {
    setLoading(true);
    try {
      // Generiere Standard SEO-Daten
      const generated = await seoService.generateBlogPostSEO({
        title,
        content,
        excerpt,
        category,
        tags,
        slug: customSlug || generateSlug(title),
        featuredImage
      });

      // Führe erweiterte SEO-Analyse durch
      const enhanced = await enhancedSeoService.analyzeContentSEO({
        title,
        content,
        excerpt,
        category,
        featuredImage,
        keywords: tags
      });

      setSeoData(generated);
      setEnhancedAnalysis(enhanced);
      
      // Nur setzen wenn noch nicht manuell bearbeitet
      if (!customSeoTitle) setCustomSeoTitle(generated.title);
      if (!customSeoDescription) setCustomSeoDescription(generated.description);
      if (!customSlug) setCustomSlug(generated.canonicalUrl.split('/').pop() || '');

      onSEODataChange(generated);
    } catch (error) {
      console.error('SEO-Generierung fehlgeschlagen:', error);
    }
    setLoading(false);
  };

  const handleCustomChange = (field: keyof SEOMetadata, value: string) => {
    if (!seoData) return;

    const updated = { ...seoData, [field]: value };
    setSeoData(updated);
    onSEODataChange(updated);

    // Custom values merken
    if (field === 'title') setCustomSeoTitle(value);
    if (field === 'description') setCustomSeoDescription(value);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const renderPreview = () => {
    if (!seoData) return null;

    switch (previewMode) {
      case 'google':
        return (
          <div className="p-3 bg-white border rounded">
            <div className="text-lg text-blue-600 hover:underline cursor-pointer line-clamp-1">
              {seoData.title}
            </div>
            <div className="text-sm text-green-700">{seoData.canonicalUrl}</div>
            <div className="text-sm text-gray-600 mt-1 line-clamp-2">
              {seoData.description}
            </div>
          </div>
        );
      
      case 'facebook':
        return (
          <div className="border rounded overflow-hidden bg-white max-w-sm">
            {seoData.ogImage && (
              <img src={seoData.ogImage} alt="" className="w-full h-32 object-cover" />
            )}
            <div className="p-3">
              <div className="text-sm text-gray-500 uppercase">{seoData.canonicalUrl}</div>
              <div className="font-medium text-gray-900 line-clamp-2">{seoData.ogTitle}</div>
              <div className="text-sm text-gray-600 line-clamp-2">{seoData.ogDescription}</div>
            </div>
          </div>
        );
      
      case 'twitter':
        return (
          <div className="border rounded overflow-hidden bg-white max-w-sm">
            {seoData.ogImage && (
              <img src={seoData.ogImage} alt="" className="w-full h-32 object-cover" />
            )}
            <div className="p-3">
              <div className="font-medium text-gray-900 line-clamp-2">{seoData.title}</div>
              <div className="text-sm text-gray-600 line-clamp-2">{seoData.description}</div>
              <div className="text-sm text-gray-500 mt-2">{seoData.canonicalUrl}</div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* SEO Score Overview */}
      {enhancedAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getScoreIcon(enhancedAnalysis.overallScore)}
              SEO-Analyse
              <Badge className={getScoreColor(enhancedAnalysis.overallScore)}>
                {enhancedAnalysis.overallScore}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Progress value={enhancedAnalysis.overallScore} className="h-2" />
            
            {/* Detaillierte Faktoren */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Object.entries(enhancedAnalysis.factors).map(([key, factor]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                  <div className="flex items-center gap-2">
                    <span className={getScoreColor(factor.score)}>{factor.score}</span>
                    <div className="w-16 h-1 bg-gray-200 rounded">
                      <div 
                        className={`h-full rounded ${
                          factor.score >= 80 ? 'bg-green-500' : 
                          factor.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Empfehlungen */}
            {enhancedAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Prioritäre Verbesserungen:</h4>
                <ul className="space-y-1">
                  {enhancedAnalysis.recommendations.slice(0, 5).map((rec, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Keywords */}
            {enhancedAnalysis.keywords.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Erkannte Keywords:</h4>
                <div className="flex flex-wrap gap-1">
                  {enhancedAnalysis.keywords.slice(0, 10).map((keyword, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Standard SEO Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO-Konfiguration
            <Button
              variant="outline"
              size="sm"
              onClick={generateSEOData}
              disabled={loading}
              className="ml-auto"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Aktualisieren
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="seo-slug">URL-Slug</Label>
              <div className="flex gap-2">
                <Input
                  id="seo-slug"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="artikel-url-slug"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(customSlug)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="seo-title">SEO-Titel</Label>
              <div className="space-y-1">
                <Input
                  id="seo-title"
                  value={customSeoTitle}
                  onChange={(e) => handleCustomChange('title', e.target.value)}
                  placeholder="SEO-optimierter Titel"
                />
                <div className="text-xs text-gray-500">
                  {customSeoTitle.length}/60 Zeichen
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="seo-description">Meta-Description</Label>
              <div className="space-y-1">
                <Textarea
                  id="seo-description"
                  value={customSeoDescription}
                  onChange={(e) => handleCustomChange('description', e.target.value)}
                  placeholder="SEO-optimierte Beschreibung"
                  rows={3}
                />
                <div className="text-xs text-gray-500">
                  {customSeoDescription.length}/160 Zeichen
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4" />
              <Label>Vorschau</Label>
              <div className="flex gap-1 ml-auto">
                {(['google', 'facebook', 'twitter'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={previewMode === mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode(mode)}
                    className="capitalize"
                  >
                    {mode}
                  </Button>
                ))}
              </div>
            </div>
            {renderPreview()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOOptimizationPanel;
