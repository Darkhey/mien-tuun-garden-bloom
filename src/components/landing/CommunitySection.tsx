import React from 'react';
import { Instagram, Mail } from 'lucide-react';
import { siteConfig } from '@/config/site.config';
import NewsletterSignup from "@/components/NewsletterSignup";

const CommunitySection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-primary text-primary-foreground">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-3xl sm:text-4xl font-bold">
          Lass uns zusammen gärtnern!
        </h2>
        <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
          Tausch dich mit mir und anderen Garten-Begeisterten aus. 
          Zeig mir deine Erfolge mit #mientuun – ich freue mich über jedes Foto!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20 max-w-md w-full">
            <div className="flex items-center gap-2 justify-center mb-3">
              <Mail className="w-5 h-5" />
              <span className="font-semibold">Newsletter abonnieren</span>
            </div>
            <NewsletterSignup />
          </div>
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-primary-foreground text-primary px-8 py-4 rounded-full font-semibold hover:scale-[1.03] transition-all duration-300 shadow-lg"
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
