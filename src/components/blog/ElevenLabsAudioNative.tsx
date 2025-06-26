import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

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

  useEffect(() => {
    const createProject = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/elevenlabs-audio-native', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            voice_id: voiceId,
            model_id: 'eleven_multilingual_v2',
            name: title,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create audio native project');
        }

        const data = await response.json();
        setHtmlSnippet(data.html_snippet);
      } catch (error) {
        console.error('Error creating audio native project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    createProject();
  }, [text, title, voiceId]);

  return (
    <Card className={`bg-gradient-to-r from-sage-50 to-accent-50 ${className}`}>
      <CardContent className="p-4">
        {isLoading && !htmlSnippet ? (
          <div className="flex items-center gap-2 text-sm text-earth-700">
            <Loader2 className="h-4 w-4 animate-spin" /> Projekt wird vorbereitet
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: htmlSnippet ?? '' }} />
        )}
      </CardContent>
    </Card>
  );
};

export default ElevenLabsAudioNative;
