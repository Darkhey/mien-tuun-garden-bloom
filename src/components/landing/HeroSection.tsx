
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Instagram } from 'lucide-react';
import { siteConfig } from '@/config/site.config';
import NewsletterSignup from "@/components/NewsletterSignup";

const mariannePortrait =
  'https://images.unsplash.com/photo-1594736797933-d0401ba4e7ba?auto=format&fit=crop&w=400&q=80';
const mainHeroImage =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1280&h=720&fit=crop';

const welcome = {
  headline: 'Moin! Ich bin Marianne aus Ostfriesland.',
  subheadline: 'Seit über 20 Jahren gärtnere ich hier an der Nordseeküste und teile meine Erfahrungen mit allen, die naturnah leben möchten.',
  cta: 'Lass uns gemeinsam gärtnern!'
};

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sage-50 via-cream to-accent-50 py-20 px-4">
      <div className="absolute -z-10 inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-12 left-10 w-20 h-20 text-sage-200 rotate-12">🌸</div>
        <div className="absolute top-32 right-24 w-24 h-24 text-accent-200 -rotate-45">🌻</div>
      </div>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
              <img
                src={mariannePortrait}
                alt="Marianne, Gärtnerin aus Ostfriesland"
                className="w-16 h-16 rounded-full border-3 border-sage-200 shadow-lg"
              />
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-earth-800">
              {welcome.headline}
            </h1>
            <p className="text-xl md:text-2xl font-sans text-sage-700">
              {welcome.subheadline}
            </p>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sage-100">
              <h3 className="text-lg font-semibold text-earth-800 mb-3">
                🌱 Hol dir meine besten Gartentipps direkt ins Postfach!
              </h3>
              <p className="text-sage-600 mb-4 text-sm">
                Jeden Monat die passenden Tipps zur Saison - kostenlos und jederzeit abbestellbar.
              </p>
              <NewsletterSignup />
              <p className="text-xs text-sage-500 mt-2">
                ✅ Bereits über 2.500 Garten-Freunde dabei!
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-full font-medium shadow hover:scale-105 transition-all duration-200 bg-gradient-to-r from-pink-400 via-red-400 to-yellow-400 text-white"
              >
                <Instagram className="w-5 h-5 mr-2" />
                Folge mir auf Instagram
              </a>
              <Link
                to="/blog"
                className="inline-flex items-center px-6 py-3 rounded-full font-medium shadow hover:scale-105 transition-all duration-200 bg-sage-600 text-white hover:bg-sage-700"
              >
                Gartentipps entdecken
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img
              src={mainHeroImage}
              alt="Mariannes Garten in Ostfriesland"
              className="rounded-xl shadow-2xl w-full max-w-md h-80 object-cover border-4 border-sage-100"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
