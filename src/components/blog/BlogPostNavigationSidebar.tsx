import React, { useState } from "react";
import { Mic, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export type Heading = {
  id: string;
  text: string;
  level: number;
};

interface BlogPostNavigationSidebarProps {
  headings: Heading[];
}

const BlogPostNavigationSidebar: React.FC<BlogPostNavigationSidebarProps> = ({
  headings,
}) => {
  const [audioHtml, setAudioHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAudio, setShowAudio] = useState(false);

  const generateAudio = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      // Get current page content
      const pageTitle = document.title;
      const mainContent = document.querySelector('article')?.textContent || '';
      const text = `${pageTitle}. ${mainContent.substring(0, 2000)}`;
      
      const { data, error } = await supabase.functions.invoke('elevenlabs-audio-native', {
        body: {
          text: text.substring(0, 5000), // Limit text length
          voice_id: '21m00Tcm4TlvDq8ikWAM', // Marianne's voice
          model_id: 'eleven_multilingual_v2',
          name: pageTitle
        }
      });

      if (error) throw error;
      
      setAudioHtml(data.audio_native_player_html || null);
      setShowAudio(true);
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (headings.length === 0) return null;

  return (
    <aside className="hidden xl:block fixed top-32 right-8 w-64 text-sm">
      <nav className="sticky top-32 bg-white border border-sage-200 rounded-xl shadow-sm p-4 transition-all duration-300 hover:shadow-md" aria-label="Article navigation">
        <h2 className="text-lg font-serif font-bold mb-4 text-earth-800 border-b border-sage-100 pb-2">
          Inhalt
        </h2>
        <ul className="space-y-2">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
              <a
                href={`#${h.id}`}
                className="text-sage-700 hover:text-sage-900 transition-colors duration-200 block py-1 px-2 rounded-md hover:bg-sage-50"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
        
        <div className="mt-6 pt-4 border-t border-sage-100">
          {!showAudio ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center justify-center gap-2 text-sage-700"
              onClick={generateAudio}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-sage-500 rounded-full border-t-transparent"></span>
                  <span>Generiere Audio...</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  <span>Artikel vorlesen</span>
                </>
              )}
            </Button>
          ) : (
            <div className="mt-2">
              <div className="text-xs font-medium text-sage-700 mb-2 flex items-center gap-1">
                <Volume2 className="h-3 w-3" />
                <span>Vorlesen mit Marianne</span>
              </div>
              <div 
                className="audio-player-container bg-sage-50 rounded-lg p-2 border border-sage-200"
                dangerouslySetInnerHTML={{ __html: audioHtml || '' }}
              />
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default BlogPostNavigationSidebar;