import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  PinterestShareButton, 
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  PinterestIcon,
  WhatsappIcon,
  EmailIcon
} from 'react-share';

interface BlogPostShareSectionProps {
  title: string;
  imageUrl?: string;
  excerpt?: string;
}

const BlogPostShareSection: React.FC<BlogPostShareSectionProps> = ({ 
  title, 
  imageUrl = '', 
  excerpt = ''
}) => {
  const location = useLocation();
  const url = `https://mien-tuun.de${location.pathname}`;
  
  const iconSize = 32;
  const roundedIconStyle = { borderRadius: '50%' };

  return (
    <div className="mt-12 pt-8 border-t border-sage-200">
      <div className="bg-sage-50 rounded-xl p-6">
        <h3 className="text-xl font-serif font-bold text-earth-800 mb-4 text-center">
          Hat dir dieser Artikel gefallen?
        </h3>
        <p className="text-earth-600 mb-6 text-center">
          Teile ihn mit deinen Freunden und lass dich von weiteren Gartentipps inspirieren!
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <FacebookShareButton url={url} quote={title} className="hover:scale-110 transition-transform">
            <FacebookIcon size={iconSize} round style={roundedIconStyle} />
          </FacebookShareButton>
          
          <TwitterShareButton url={url} title={title} className="hover:scale-110 transition-transform">
            <TwitterIcon size={iconSize} round style={roundedIconStyle} />
          </TwitterShareButton>
          
          <PinterestShareButton 
            url={url} 
            media={imageUrl} 
            description={title}
            className="hover:scale-110 transition-transform"
          >
            <PinterestIcon size={iconSize} round style={roundedIconStyle} />
          </PinterestShareButton>
          
          <WhatsappShareButton 
            url={url} 
            title={title}
            className="hover:scale-110 transition-transform"
          >
            <WhatsappIcon size={iconSize} round style={roundedIconStyle} />
          </WhatsappShareButton>
          
          <EmailShareButton 
            url={url} 
            subject={`Mien Tuun: ${title}`}
            body={`${excerpt}\n\nLies den ganzen Artikel hier: ${url}`}
            className="hover:scale-110 transition-transform"
          >
            <EmailIcon size={iconSize} round style={roundedIconStyle} />
          </EmailShareButton>
        </div>
        
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(url);
              alert('Link in die Zwischenablage kopiert!');
            }}
            className="bg-earth-600 text-white px-6 py-2 rounded-full hover:bg-earth-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Link kopieren
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPostShareSection;