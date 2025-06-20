import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Image, Send, X } from 'lucide-react';
import { AdminBlogPost } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InstagramPostModalProps {
  post: AdminBlogPost;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const InstagramPostModal: React.FC<InstagramPostModalProps> = ({
  post,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [caption, setCaption] = useState('');
  const [customHashtags, setCustomHashtags] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Generate automatic caption when modal opens
  React.useEffect(() => {
    if (isOpen && post) {
      generateAutoCaption();
    }
  }, [isOpen, post]);

  const generateAutoCaption = () => {
    const baseHashtags = ['#MienTuun', '#Garten', '#Gartenliebe'];
    const categoryHashtags = getCategoryHashtags(post.category);
    const allHashtags = [...baseHashtags, ...categoryHashtags].join(' ');
    
    const autoCaption = `🌱 ${post.title}

${post.excerpt || 'Entdecke neue Gartentipps und Inspiration!'}

📖 Den vollständigen Artikel liest du auf unserer Website (Link in Bio)

${allHashtags}`;
    
    setCaption(autoCaption);
  };

  const getCategoryHashtags = (category: string): string[] => {
    const categoryMap: { [key: string]: string[] } = {
      'gartentipps': ['#Gartentipps', '#GreenThumb'],
      'pflanzen': ['#Pflanzen', '#PlantLove', '#Botanik'],
      'kochen': ['#Kochen', '#Rezepte', '#GartenKüche'],
      'gemüse': ['#Gemüse', '#Vegetables', '#VegetableGarden'],
      'obst': ['#Obst', '#Fruits', '#Obstgarten'],
      'kräuter': ['#Kräuter', '#Herbs', '#Kräutergarten'],
      'blumen': ['#Blumen', '#Flowers', '#Blütenpracht'],
      'aussaat': ['#Aussaat', '#Sowing', '#GardenPlanning']
    };
    
    return categoryMap[category.toLowerCase()] || [`#${category}`];
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      toast({
        title: "Fehler",
        description: "Caption darf nicht leer sein",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const finalCaption = customHashtags 
        ? `${caption}\n\n${customHashtags}` 
        : caption;

      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Nicht authentifiziert');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/instagram-post`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blogPostId: post.id,
          caption: finalCaption,
          imageUrl: post.featured_image
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Edge Function returned a non-2xx status code: ${errorText}`);
      }

      const data = await response.json();

      toast({
        title: "Erfolg!",
        description: "Post wurde erfolgreich auf Instagram geteilt"
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Instagram post error:', error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Posten auf Instagram",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Instagram Post erstellen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Post Preview */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">Post Preview</h3>
            <div className="flex gap-4">
              {post.featured_image && (
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <img 
                    src={post.featured_image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-medium text-sm">{post.title}</h4>
                <p className="text-gray-600 text-xs mt-1">
                  Kategorie: <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Caption Editor */}
          <div className="space-y-2">
            <Label htmlFor="caption">Instagram Caption</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption für Instagram..."
              rows={8}
              className="resize-none"
            />
            <p className="text-sm text-gray-500">
              {caption.length}/2200 Zeichen
            </p>
          </div>

          {/* Custom Hashtags */}
          <div className="space-y-2">
            <Label htmlFor="hashtags">Zusätzliche Hashtags (optional)</Label>
            <Input
              id="hashtags"
              value={customHashtags}
              onChange={(e) => setCustomHashtags(e.target.value)}
              placeholder="#zusätzliche #hashtags"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={generateAutoCaption}
              variant="outline"
              className="flex-1"
            >
              Caption neu generieren
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !caption.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gepostet...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Auf Instagram posten
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstagramPostModal;