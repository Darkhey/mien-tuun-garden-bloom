
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BlogContentExtenderProps {
  currentContent: string;
  title: string;
  category?: string;
  onContentExtended: (extendedContent: string) => void;
}

const BlogContentExtender: React.FC<BlogContentExtenderProps> = ({
  currentContent,
  title,
  category,
  onContentExtended
}) => {
  const [extending, setExtending] = useState(false);
  const [extensionType, setExtensionType] = useState<'conclusion' | 'tips' | 'examples' | 'faq'>('tips');
  const [customPrompt, setCustomPrompt] = useState('');
  const { toast } = useToast();

  const extensionTypes = {
    conclusion: {
      label: 'Fazit hinzufügen',
      icon: FileText,
      prompt: 'Schreibe ein überzeugendes Fazit für diesen Artikel, das die wichtigsten Punkte zusammenfasst und zum Handeln motiviert.'
    },
    tips: {
      label: 'Praktische Tipps',
      icon: Plus,
      prompt: 'Füge 5-7 praktische Tipps hinzu, die den Lesern helfen, das Gelernte umzusetzen.'
    },
    examples: {
      label: 'Beispiele ergänzen',
      icon: Sparkles,
      prompt: 'Ergänze konkrete Beispiele und Anwendungsfälle, die das Thema veranschaulichen.'
    },
    faq: {
      label: 'FAQ-Sektion',
      icon: FileText,
      prompt: 'Erstelle eine FAQ-Sektion mit den 5 häufigsten Fragen zu diesem Thema und deren Antworten.'
    }
  };

  const extendContent = async () => {
    setExtending(true);
    try {
      const extensionConfig = extensionTypes[extensionType];
      const extendPrompt = customPrompt || extensionConfig.prompt;
      
      const fullPrompt = `
        Basierend auf dem folgenden Artikel-Titel und -Inhalt:
        
        Titel: ${title}
        Kategorie: ${category || 'Allgemein'}
        
        Aktueller Inhalt:
        ${currentContent}
        
        Aufgabe: ${extendPrompt}
        
        Wichtig:
        - Schreibe im gleichen Stil und Ton wie der bestehende Content
        - Verwende Markdown-Formatierung
        - Stelle sicher, dass der neue Inhalt nahtlos zum bestehenden passt
        - Fokussiere auf Mehrwert für den Leser
        - Verwende deutsche Sprache
      `;

      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: {
          prompt: fullPrompt,
          context: {
            category,
            contentType: ['extension'],
            tone: 'informative'
          }
        }
      });

      if (error) throw error;
      if (!data?.content) throw new Error('Keine Erweiterung generiert');

      // Entferne Titel-Markierungen aus der Erweiterung
      const cleanExtension = data.content.replace(/^#+\s+.*$/gm, '').trim();
      
      // Füge Erweiterung zum bestehenden Content hinzu
      const extendedContent = `${currentContent}\n\n${cleanExtension}`;
      
      onContentExtended(extendedContent);
      
      toast({
        title: 'Erfolg',
        description: 'Content wurde erfolgreich erweitert!'
      });

    } catch (error: any) {
      console.error('Content-Erweiterung fehlgeschlagen:', error);
      toast({
        title: 'Fehler',
        description: `Content-Erweiterung fehlgeschlagen: ${error.message}`,
        variant: 'destructive'
      });
    }
    setExtending(false);
  };

  const wordCount = currentContent.split(/\s+/).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Content verlängern
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="h-4 w-4" />
          Aktuelle Länge: <Badge variant="outline">{wordCount} Wörter</Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Object.entries(extensionTypes).map(([key, config]) => {
            const IconComponent = config.icon;
            return (
              <Button
                key={key}
                variant={extensionType === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExtensionType(key as any)}
                className="flex items-center gap-2 h-auto p-3"
              >
                <IconComponent className="h-4 w-4" />
                <span className="text-xs">{config.label}</span>
              </Button>
            );
          })}
        </div>

        <div>
          <label className="text-sm font-medium">Custom Prompt (optional)</label>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Eigene Anweisungen für die Content-Erweiterung..."
            rows={3}
            className="mt-1"
          />
        </div>

        <Button
          onClick={extendContent}
          disabled={extending || !currentContent || !title}
          className="w-full"
        >
          {extending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Erweitere Content...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Content verlängern
            </>
          )}
        </Button>

        {extending && (
          <div className="text-xs text-gray-500 text-center">
            Dies kann 15-30 Sekunden dauern...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlogContentExtender;
