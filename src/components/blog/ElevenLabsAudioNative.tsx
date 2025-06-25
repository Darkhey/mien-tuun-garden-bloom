
import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ElevenLabsAudioNativeProps {
  text: string;
  title: string;
  voiceId?: string;
  className?: string;
}

const ElevenLabsAudioNative: React.FC<ElevenLabsAudioNativeProps> = ({
  text,
  title,
  voiceId = '21m00Tcm4TlvDq8ikWAM', // Default German voice
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const generateAudio = async () => {
    if (audioUrl) return audioUrl;

    setIsLoading(true);
    try {
      const response = await fetch('/api/elevenlabs-audio-native', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice_id: voiceId,
          model_id: 'eleven_multilingual_v2'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      return url;
    } catch (error) {
      console.error('Error generating audio:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audioUrl) {
      const url = await generateAudio();
      if (!url) return;
      audio.src = url;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      await audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, []);

  return (
    <Card className={`bg-gradient-to-r from-sage-50 to-accent-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sage-600 rounded-full flex items-center justify-center">
            <Volume2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-earth-800 text-sm">Audio von Marianne</h4>
            <p className="text-xs text-earth-600">Höre dir den Artikel vor</p>
          </div>
          <Button
            onClick={togglePlayPause}
            disabled={isLoading}
            size="sm"
            className="bg-sage-600 hover:bg-sage-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
        </div>
        <audio ref={audioRef} preload="none" />
      </CardContent>
    </Card>
  );
};

export default ElevenLabsAudioNative;
