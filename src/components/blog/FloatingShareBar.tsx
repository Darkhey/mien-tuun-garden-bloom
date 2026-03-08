import React from 'react';
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton, EmailShareButton } from 'react-share';
import { Facebook, Twitter, Phone as Whatsapp, Mail, Link as LinkIcon, Pin } from 'lucide-react';
import { toast } from 'sonner';

interface FloatingShareBarProps {
  url: string;
  title: string;
  media?: string;
}

export const FloatingShareBar: React.FC<FloatingShareBarProps> = ({ url, title, media }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link in die Zwischenablage kopiert');
  };

  // Construct Pinterest share URL manually
  const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(media || '')}&description=${encodeURIComponent(title)}`;

  return (
    <div className="fixed bottom-0 left-0 w-full md:w-auto md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:left-4 z-40 bg-white/95 backdrop-blur shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] md:shadow-xl md:rounded-2xl border-t md:border border-sage-200 p-2 md:p-3 flex md:flex-col items-center justify-center gap-4 transition-all duration-300">
      <FacebookShareButton url={url} title={title} className="hover:scale-110 transition-transform">
        <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center">
          <Facebook className="w-5 h-5" />
        </div>
      </FacebookShareButton>
      
      <TwitterShareButton url={url} title={title} className="hover:scale-110 transition-transform hidden sm:block">
        <div className="w-10 h-10 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center">
          <Twitter className="w-5 h-5" />
        </div>
      </TwitterShareButton>

      {media && (
        <a href={pinterestUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="Auf Pinterest teilen">
          <div className="w-10 h-10 rounded-full bg-[#E60023]/10 text-[#E60023] flex items-center justify-center">
            <Pin className="w-5 h-5" />
          </div>
        </a>
      )}
      
      <WhatsappShareButton url={url} title={title} separator=" - " className="hover:scale-110 transition-transform">
        <div className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
          <Whatsapp className="w-5 h-5" />
        </div>
      </WhatsappShareButton>

      <EmailShareButton url={url} subject={title} body="Schau dir diesen Artikel an:" className="hover:scale-110 transition-transform hidden md:block">
        <div className="w-10 h-10 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center">
          <Mail className="w-5 h-5" />
        </div>
      </EmailShareButton>
      
      <button onClick={copyToClipboard} className="hover:scale-110 transition-transform" aria-label="Link kopieren">
        <div className="w-10 h-10 rounded-full bg-earth-100 text-earth-600 flex items-center justify-center">
          <LinkIcon className="w-5 h-5" />
        </div>
      </button>
    </div>
  );
};
