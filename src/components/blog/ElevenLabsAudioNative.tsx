import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { debounce } from 'lodash';
import { supabase } from '@/integrations/supabase/client';

interface ElevenLabsAudioNativeProps {
  text: string;
  title: string;
  voiceId?: string;
  className?: string;
}

const ElevenLabsAudioNative: React.FC<ElevenLabsAudioNativeProps> = ({
  text,
  title,
  voiceId = '21m00Tcm4TlvDq8ikWAM',
  className = "",
}) => {
  const [htmlSnippet, setHtmlSnippet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedCreateProject = useCallback(
    debounce(async (t: string, ti: string, v: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.functions.invoke('elevenlabs-audio-native', {
          body: {
            text: t,
            voice_id: v,
            model_id: 'eleven_multilingual_v2',
            name: ti,
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        setHtmlSnippet((data as any).html_snippet);
      } catch (err: any) {
        console.error('Error creating audio native project:', err);
        setError(err.message ?? 'Unbekannter Fehler');
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedCreateProject(text, title, voiceId);
  }, [text, title, voiceId, debouncedCreateProject]);

  return (
    <Card className={`bg-gradient-to-r from-sage-50 to-accent-50 ${className}`}>
      <CardContent className="p-4">
        {isLoading && !htmlSnippet ? (
          <div className="flex items-center gap-2 text-sm text-earth-700">
            <Loader2 className="h-4 w-4 animate-spin" /> Projekt wird vorbereitet
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlSnippet ?? '') }} />
        )}
      </CardContent>
    </Card>
  );
};

export default ElevenLabsAudioNative;
