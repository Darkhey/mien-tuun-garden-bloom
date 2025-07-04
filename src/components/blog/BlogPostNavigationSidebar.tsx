import React, { useState } from "react";
import { Mic, Volume2, ChevronDown, ChevronUp, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import AdPlaceholder from "@/components/AdPlaceholder";

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
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [openSections, setOpenSections] = useState({
    navigation: true,
    audio: false,
    related: false,
    ads: false
  });

  // Lade verwandte Artikel
  React.useEffect(() => {
    const fetchRelatedPosts = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('title, slug, category')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(5);
      
      if (data) {
        setRelatedPosts(data);
      }
    };
    
    fetchRelatedPosts();
  }, []);

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
      setOpenSections(prev => ({ ...prev, audio: true }));
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className="hidden xl:block fixed top-32 right-8 w-64 text-sm">
      <ScrollArea className="h-[calc(100vh-160px)]">
        <div className="sticky top-32 bg-white border border-sage-200 rounded-xl shadow-sm p-4 transition-all duration-300 hover:shadow-md">
          {/* Navigation Section */}
          <Collapsible open={openSections.navigation} onOpenChange={() => toggleSection('navigation')}>
            <CollapsibleTrigger className="flex w-full items-center justify-between text-lg font-serif font-bold mb-2 text-earth-800 border-b border-sage-100 pb-2">
              Inhalt
              {openSections.navigation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              {headings.length > 0 ? (
                <ul className="space-y-2 mt-2">
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
              ) : (
                <p className="text-sage-500 italic text-sm">Keine Überschriften gefunden</p>
              )}
            </CollapsibleContent>
          </Collapsible>
          
          {/* Audio Section */}
          <Collapsible open={openSections.audio} onOpenChange={() => toggleSection('audio')} className="mt-4 pt-2 border-t border-sage-100">
            <CollapsibleTrigger className="flex w-full items-center justify-between text-lg font-serif font-bold mb-2 text-earth-800 pb-2">
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-sage-500" />
                <span>Vorlesen lassen</span>
              </div>
              {openSections.audio ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
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
            </CollapsibleContent>
          </Collapsible>
          
          {/* Related Posts Section */}
          <Collapsible open={openSections.related} onOpenChange={() => toggleSection('related')} className="mt-4 pt-2 border-t border-sage-100">
            <CollapsibleTrigger className="flex w-full items-center justify-between text-lg font-serif font-bold mb-2 text-earth-800 pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-sage-500" />
                <span>Weitere Artikel</span>
              </div>
              {openSections.related ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="space-y-3 mt-2">
                {relatedPosts.map((post) => (
                  <li key={post.slug} className="border-b border-sage-100 pb-2 last:border-0">
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="text-sage-700 hover:text-sage-900 transition-colors duration-200 flex items-start gap-1"
                    >
                      <ExternalLink className="h-3 w-3 mt-1 flex-shrink-0" />
                      <span>{post.title}</span>
                    </Link>
                    <span className="text-xs text-sage-500 ml-4 mt-1 block">{post.category}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Advertisement Section */}
          <Collapsible open={openSections.ads} onOpenChange={() => toggleSection('ads')} className="mt-4 pt-2 border-t border-sage-100">
            <CollapsibleTrigger className="flex w-full items-center justify-between text-lg font-serif font-bold mb-2 text-earth-800 pb-2">
              <span>Werbung</span>
              {openSections.ads ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <AdPlaceholder className="h-48" />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default BlogPostNavigationSidebar;