import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Mic, Play, Volume2, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ElevenLabsAudioPlayer from '@/components/blog/ElevenLabsAudioPlayer';

const AudioSidebarView: React.FC = () => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [voiceId, setVoiceId] = useState('21m00Tcm4TlvDq8ikWAM'); // Default to Marianne's voice
  const [loading, setLoading] = useState(false);
  const [audioProject, setAudioProject] = useState<any>(null);
  const { toast } = useToast();

  const voices = [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Marianne (Deutsch)' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (English)' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (English)' },
    { id: 'XB0fDUnXU5powFXDhCwa', name: 'Thomas (Deutsch)' }
  ];

  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Text ein",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-audio-native', {
        body: {
          text,
          voice_id: voiceId,
          model_id: 'eleven_multilingual_v2',
          name: title || 'Audio Projekt'
        }
      });

      if (error) {
        throw new Error(`ElevenLabs API Fehler: ${error.message}`);
      }

      setAudioProject(data);
      toast({
        title: "Erfolg",
        description: "Audio wurde erfolgreich generiert"
      });
    } catch (error: any) {
      console.error('Error generating audio:', error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler bei der Audio-Generierung",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = (audioUrl: string) => {
    window.open(audioUrl, '_blank');
  };

  const handleDownloadAudio = (audioUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = fileName || 'audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Volume2 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ElevenLabs Audio Generator</h1>
          <p className="text-gray-600">Generiere natürlich klingende Audioinhalte mit KI-Stimmen</p>
        </div>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-blue-600" />
            Text zu Sprache
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Projekttitel</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mein Audioprojekt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stimme auswählen</label>
            <Select value={voiceId} onValueChange={setVoiceId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {voices.map(voice => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Text</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Geben Sie hier den Text ein, der in Sprache umgewandelt werden soll..."
              rows={8}
            />
          </div>

          <Button 
            onClick={handleGenerateAudio} 
            disabled={loading || !text.trim()} 
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Audio wird generiert...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Audio generieren
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {audioProject && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              Generiertes Audio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">{audioProject.name || 'Audio Projekt'}</h3>
              
              {audioProject.audio_urls?.map((audio: any, index: number) => (
                <div key={index} className="mb-4">
                  <ElevenLabsAudioPlayer 
                    audioUrl={audio.audio_url}
                    title={audio.audio_name || `Audio ${index + 1}`}
                  />
                  
                  <div className="flex justify-end mt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDownloadAudio(audio.audio_url, audio.audio_name || 'audio.mp3')}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setText('');
                setTitle('');
                setAudioProject(null);
              }}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Neues Audio erstellen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AudioSidebarView;