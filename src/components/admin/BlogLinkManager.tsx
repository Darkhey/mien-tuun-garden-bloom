import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link, ExternalLink, Plus, Trash2, Loader2, Search, Sparkles, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
}

interface BlogLinkManagerProps {
  currentContent: string;
  postId: string;
  onContentUpdate: (updatedContent: string) => void;
}

const BlogLinkManager: React.FC<BlogLinkManagerProps> = ({
  currentContent,
  postId,
  onContentUpdate
}) => {
  const [availablePosts, setAvailablePosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedLinks, setSuggestedLinks] = useState<Array<{
    post: BlogPost;
    anchorText: string;
    context: string;
    position: number;
  }>>([]);
  const [aiProcessing, setAiProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAvailablePosts();
  }, [postId]);

  useEffect(() => {
    const filtered = availablePosts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [searchTerm, availablePosts]);

  const loadAvailablePosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, category, excerpt')
        .eq('status', 'veröffentlicht')
        .neq('id', postId)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setAvailablePosts(data || []);
      setFilteredPosts(data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Fehler beim Laden der Blog-Posts:', message, error);
    }
  };

  const analyzeLinkOpportunities = async () => {
    setLoading(true);
    try {
      // Extrahiere Keywords aus dem aktuellen Content
      const contentKeywords = extractKeywords(currentContent);
      
      // Finde passende Blog-Posts basierend auf Keywords
      const opportunities = [];
      
      for (const post of availablePosts.slice(0, 20)) { // Limitiere für Performance
        const postKeywords = extractKeywords(`${post.title} ${post.excerpt}`);
        const commonKeywords = contentKeywords.filter(keyword => 
          postKeywords.some(pk => pk.toLowerCase().includes(keyword.toLowerCase()))
        );
        
        if (commonKeywords.length > 0) {
          // Finde passende Textstellen für Links
          const anchorText = findBestAnchorText(currentContent, post.title, commonKeywords);
          if (anchorText) {
            const context = findContext(currentContent, anchorText);
            opportunities.push({
              post,
              anchorText,
              context,
              position: currentContent.indexOf(anchorText)
            });
          }
        }
      }

      setSuggestedLinks(opportunities.slice(0, 8)); // Top 8 Vorschläge
      
      toast({
        title: 'Link-Analyse abgeschlossen',
        description: `${opportunities.length} Verlinkungsmöglichkeiten gefunden`
      });

    } catch (error) {
      console.error('Link-Analyse fehlgeschlagen:', error);
      toast({
        title: 'Fehler',
        description: 'Link-Analyse fehlgeschlagen',
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  const addLink = (post: BlogPost, anchorText: string) => {
    const linkMarkdown = `[${anchorText}](/blog/${post.slug})`;
    const updatedContent = currentContent.replace(anchorText, linkMarkdown);
    onContentUpdate(updatedContent);
    
    // Entferne den Link aus den Vorschlägen
    setSuggestedLinks(prev => prev.filter(link => 
      link.post.id !== post.id || link.anchorText !== anchorText
    ));
    
    toast({
      title: 'Link hinzugefügt',
      description: `Verweis auf "${post.title}" wurde eingefügt`
    });
  };

  const addManualLink = (post: BlogPost) => {
    const linkMarkdown = `[${post.title}](/blog/${post.slug})`;
    const updatedContent = `${currentContent}\n\n**Mehr dazu:** ${linkMarkdown}`;
    onContentUpdate(updatedContent);
    
    toast({
      title: 'Link hinzugefügt',
      description: `Manueller Link zu "${post.title}" wurde am Ende eingefügt`
    });
  };

  const removeExistingLinks = () => {
    const linkPattern = /\[([^\]]+)\]\(\/blog\/[^)]+\)/g;
    const updatedContent = currentContent.replace(linkPattern, '$1');
    onContentUpdate(updatedContent);
    
    toast({
      title: 'Links entfernt',
      description: 'Alle internen Blog-Links wurden entfernt'
    });
  };

  const integrateLinksWithAI = async () => {
    if (suggestedLinks.length === 0) {
      toast({
        title: 'Keine Vorschläge',
        description: 'Führen Sie zuerst eine Link-Analyse durch',
        variant: 'destructive'
      });
      return;
    }

    setAiProcessing(true);
    try {
      // Wähle bis zu 3 beste Link-Vorschläge basierend auf Relevanz
      const topLinks = suggestedLinks
        .slice(0, 3)
        .map(link => ({
          title: link.post.title,
          slug: link.post.slug,
          category: link.post.category,
          anchorText: link.anchorText,
          context: link.context
        }));

      console.log('[BlogLinkManager] Integrating links with AI:', topLinks);

      const { data, error } = await supabase.functions.invoke('ai-content-insights', {
        body: {
          action: 'integrate_internal_links',
          data: {
            content: currentContent,
            suggestedLinks: topLinks,
            instructions: `
              Integriere die vorgeschlagenen internen Links natürlich in den Text:
              1. Schreibe den Text so um, dass die Links organisch eingebaut werden
              2. Verwende passende Anchor-Texte die zum Kontext passen
              3. Stelle sicher, dass die Links den Lesefluss nicht unterbrechen
              4. Maximal 3 Links pro Text
              5. Links sollten thematisch relevant sein
              6. Verwende das Format [Anchor Text](/blog/slug)
            `
          }
        }
      });

      if (error) {
        throw new Error(`KI-Integration fehlgeschlagen: ${error.message}`);
      }

      if (data?.success && data?.optimizedContent) {
        onContentUpdate(data.optimizedContent);
        
        // Entferne erfolgreich integrierte Links aus den Vorschlägen
        setSuggestedLinks([]);
        
        toast({
          title: 'Links erfolgreich integriert!',
          description: `${topLinks.length} interne Links wurden natürlich in den Text eingebaut`
        });

        console.log('[BlogLinkManager] AI integration successful');
      } else {
        throw new Error('Keine optimierten Inhalte erhalten');
      }

    } catch (error: any) {
      console.error('[BlogLinkManager] AI integration failed:', error);
      toast({
        title: 'KI-Integration fehlgeschlagen',
        description: error.message || 'Unbekannter Fehler bei der Link-Integration',
        variant: 'destructive'
      });
    }
    setAiProcessing(false);
  };

  const extractKeywords = (text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 20);
  };

  const findBestAnchorText = (content: string, postTitle: string, keywords: string[]): string | null => {
    // Suche nach relevanten Phrasen im Content
    const sentences = content.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      for (const keyword of keywords) {
        if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
          // Extrahiere relevante Phrase (3-8 Wörter)
          const words = sentence.trim().split(/\s+/);
          const keywordIndex = words.findIndex(word => 
            word.toLowerCase().includes(keyword.toLowerCase())
          );
          
          if (keywordIndex >= 0) {
            const start = Math.max(0, keywordIndex - 2);
            const end = Math.min(words.length, keywordIndex + 4);
            const phrase = words.slice(start, end).join(' ').replace(/[^\w\s]/g, '');
            
            if (phrase.length > 10 && phrase.length < 60) {
              return phrase;
            }
          }
        }
      }
    }
    
    return null;
  };

  const findContext = (content: string, anchorText: string): string => {
    const index = content.indexOf(anchorText);
    if (index === -1) return '';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + anchorText.length + 50);
    
    return '...' + content.slice(start, end) + '...';
  };

  const existingLinks = currentContent.match(/\[([^\]]+)\]\(\/blog\/[^)]+\)/g) || [];

  return (
    <div className="space-y-6">
      {/* Aktuelle Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Aktuelle interne Links
            </span>
            <Badge variant="outline">{existingLinks.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {existingLinks.length > 0 ? (
            <div className="space-y-2">
              {existingLinks.map((link, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <code className="text-sm">{link}</code>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={removeExistingLinks}
                className="mt-2"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Alle Links entfernen
              </Button>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Keine internen Links vorhanden</p>
          )}
        </CardContent>
      </Card>

      {/* Smart Link Suggestions with AI Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              KI-gestützte Link-Integration
            </span>
            <div className="flex gap-2">
              <Button 
                onClick={analyzeLinkOpportunities} 
                disabled={loading}
                size="sm"
                variant="outline"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Analysieren
              </Button>
              {suggestedLinks.length > 0 && (
                <Button 
                  onClick={integrateLinksWithAI}
                  disabled={aiProcessing || suggestedLinks.length === 0}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                >
                  {aiProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  {aiProcessing ? 'KI integriert...' : 'KI-Integration (max. 3 Links)'}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suggestedLinks.length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-4">
                {suggestedLinks.length} Verlinkungsmöglichkeiten gefunden. 
                Die KI wird die besten 3 auswählen und natürlich in den Text einbauen.
              </div>
              {suggestedLinks.slice(0, 3).map((suggestion, idx) => (
                <div key={idx} className="border rounded p-3 space-y-2 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{suggestion.post.title}</h4>
                    <Badge variant="secondary">{suggestion.post.category}</Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    <strong>Vorgeschlagener Anchor:</strong> "{suggestion.anchorText}"
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>Kontext:</strong> {suggestion.context}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addLink(suggestion.post, suggestion.anchorText)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Manuell einfügen
                  </Button>
                </div>
              ))}
              
              {suggestedLinks.length > 3 && (
                <div className="text-xs text-gray-500 text-center mt-2">
                  + {suggestedLinks.length - 3} weitere Vorschläge verfügbar
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Klicken Sie auf "Analysieren" um Verlinkungsmöglichkeiten zu finden. 
              Anschließend können Sie mit einem Klick bis zu 3 Links automatisch integrieren lassen.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Manueller Link-Browser */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Manuell verlinken
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Blog-Posts durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredPosts.slice(0, 10).map(post => (
              <div key={post.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{post.title}</p>
                  <p className="text-xs text-gray-500 truncate">{post.excerpt}</p>
                  <Badge variant="outline" className="text-xs mt-1">{post.category}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addManualLink(post)}
                  className="ml-2 flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogLinkManager;
