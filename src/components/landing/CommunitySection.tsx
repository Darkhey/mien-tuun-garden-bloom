
import React from 'react';
import { Instagram } from 'lucide-react';
import { siteConfig } from '@/config/site.config';
import NewsletterSignup from "@/components/NewsletterSignup";

const CommunitySection: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-sage-600 to-earth-600">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
          Lass uns zusammen gärtnern!
        </h2>
        <p className="text-xl mb-8 text-sage-100">
          Tausch dich mit mir und anderen Garten-Begeisterten aus. Zeig mir deine Erfolge mit #mientuun - 
          ich freue mich über jedes Foto aus eurem Garten!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <NewsletterSignup />
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-gradient-to-r from-pink-400 via-red-400 to-yellow-400 text-white px-8 py-4 rounded-full font-medium hover:scale-105 transition-all"
          >
            <Instagram className="w-5 h-5 mr-2" />
            Folge @mientuun
          </a>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
