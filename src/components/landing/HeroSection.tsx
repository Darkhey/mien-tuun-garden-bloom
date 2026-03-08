import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Sprout } from 'lucide-react';
import NewsletterSignup from "@/components/NewsletterSignup";
import heroImage from '@/assets/hero-garden.jpg';
import marianneImg from '@/assets/marianne-portrait.jpg';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Idyllischer Bauerngarten in Ostfriesland bei Sonnenaufgang"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-2xl space-y-8">
          {/* Author badge */}
          <div className="flex items-center gap-4">
            <img
              src={marianneImg}
              alt="Marianne – Gärtnerin aus Ostfriesland"
              className="w-14 h-14 rounded-full ring-3 ring-primary/20 object-cover"
            />
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground/70">Garten-Blog aus Ostfriesland</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground tracking-tight">
            Moin! Willkommen in
            <span className="garden-gradient-text block">Mariannes Garten</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg">
            Seit über 20 Jahren gärtnere ich an der Nordseeküste. 
            Hier teile ich erprobte Tipps, saisonale Rezepte und alles, 
            was naturnah leben schöner macht.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/blog"
              className="inline-flex items-center px-7 py-3.5 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-primary text-primary-foreground hover:scale-[1.03]"
            >
              <Sprout className="w-5 h-5 mr-2" />
              Gartentipps entdecken
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/aussaatkalender"
              className="inline-flex items-center px-7 py-3.5 rounded-full font-semibold border-2 border-primary/20 bg-background/60 backdrop-blur-sm text-foreground hover:bg-primary/5 transition-all duration-300"
            >
              Aussaatkalender
            </Link>
          </div>

          {/* Newsletter inline */}
          <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 border border-border max-w-md" style={{ boxShadow: 'var(--shadow-card)' }}>
            <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <span className="text-lg">🌱</span> Gartentipps direkt ins Postfach
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Jeden Monat saisonale Tipps – kostenlos & jederzeit abbestellbar.
            </p>
            <NewsletterSignup />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
