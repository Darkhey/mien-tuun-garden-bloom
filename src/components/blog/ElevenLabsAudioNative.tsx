import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { debounce } from 'lodash';
import { supabase } from '@/integrations/supabase/client';
import ElevenLabsAudioPlayer from './ElevenLabsAudioPlayer';

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
  const [audioData, setAudioData] = useState<any | null>(null);
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

        setAudioData(data);
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
    <Card className={`bg-white border border-sage-200 shadow-sm ${className}`}>
      <CardContent className="p-4">
        {isLoading && !audioData ? (
          <div className="flex items-center gap-2 text-sm text-earth-700">
            <Loader2 className="h-4 w-4 animate-spin" /> Audiodatei wird vorbereitet
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : audioData?.audio_urls && audioData.audio_urls.length > 0 ? (
          <ElevenLabsAudioPlayer 
            audioUrl={audioData.audio_urls[0].audio_url} 
            title={title || audioData.name} 
          />
        ) : (
          <div className="text-sm text-earth-700">Audio wird geladen...</div>
        )}
      </CardContent>
    </Card>
  );
};

export default ElevenLabsAudioNative;