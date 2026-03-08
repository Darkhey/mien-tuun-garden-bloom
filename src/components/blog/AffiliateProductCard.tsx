import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AffiliateProductCardProps {
  title: string;
  description: string;
  price?: string;
  imageUrl: string;
  link: string;
  provider?: string;
  rating?: number;
}

export const AffiliateProductCard: React.FC<AffiliateProductCardProps> = ({
  title,
  description,
  price,
  imageUrl,
  link,
  provider = "Amazon",
  rating = 5
}) => {
  return (
    <div className="my-8 rounded-xl border border-sage-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row max-w-3xl not-prose">
      <div className="sm:w-1/3 bg-sage-50 p-4 flex items-center justify-center relative">
        <img 
          src={imageUrl} 
          alt={title} 
          className="max-h-48 object-contain mix-blend-multiply" 
          loading="lazy" 
        />
        <div className="absolute top-2 left-2 bg-white/90 text-xs font-semibold px-2 py-1 rounded-md text-sage-700 uppercase tracking-wide border border-sage-100">
          Empfehlung
        </div>
      </div>
      <div className="p-6 flex flex-col justify-between sm:w-2/3">
        <div>
          <h4 className="text-xl font-serif font-bold text-earth-800 mb-2 leading-tight">
            {title}
          </h4>
          <p className="text-earth-600 text-sm mb-4 line-clamp-3">
            {description}
          </p>
          {rating > 0 && (
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
              <span className="text-xs text-earth-500 ml-1">({rating}/5)</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-sage-100">
          <div className="font-medium text-lg text-earth-800">
            {price || 'Preis auf Anfrage'}
          </div>
          <Button 
            asChild
            className="bg-primary hover:bg-primary-hover text-white gap-2"
          >
            <a href={link} target="_blank" rel="noopener noreferrer nofollow">
              <ShoppingCart className="w-4 h-4" />
              Bei {provider} ansehen
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
