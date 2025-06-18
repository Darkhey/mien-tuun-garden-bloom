import React from 'react';
import { Link } from 'react-router-dom';
import NewsletterSignup from '@/components/NewsletterSignup';

interface CallToActionSectionProps {
  category?: string;
}

const CallToActionSection: React.FC<CallToActionSectionProps> = ({ category }) => {
  return (
    <div className="mt-12 pt-8 border-t border-sage-200">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-sage-50 rounded-xl p-6 flex flex-col items-center text-center">
          <h3 className="text-xl font-serif font-bold text-earth-800 mb-3">
            Mehr {category || 'Garten'}-Tipps entdecken
          </h3>
          <p className="text-earth-600 mb-4">
            Entdecke weitere Artikel und Tipps rund um {category || 'Garten und Küche'} in unserem Blog.
          </p>
          <Link 
            to={category ? `/blog?category=${encodeURIComponent(category)}` : "/blog"}
            className="bg-sage-600 text-white px-6 py-2 rounded-full hover:bg-sage-700 transition-colors"
          >
            Mehr Artikel entdecken
          </Link>
        </div>
        
        <div className="bg-accent-50 rounded-xl p-6 flex flex-col items-center text-center">
          <h3 className="text-xl font-serif font-bold text-earth-800 mb-3">
            Nie wieder Tipps verpassen
          </h3>
          <p className="text-earth-600 mb-4">
            Melde dich für unseren Newsletter an und erhalte regelmäßig saisonale Tipps und Inspirationen.
          </p>
          <div className="w-full max-w-xs">
            <NewsletterSignup compact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToActionSection;