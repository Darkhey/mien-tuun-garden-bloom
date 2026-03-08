import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import gardenAbout from '@/assets/garden-about.jpg';
import marianneImg from '@/assets/marianne-portrait.jpg';

const AboutMarianneSection: React.FC = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={gardenAbout} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/50" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Moin, ich bin Marianne!
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Hier in Ostfriesland, wo der Wind mal rau werden kann und die Böden 
            ihre eigenen Launen haben, gärtnere ich seit über 20 Jahren.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Was ich dabei gelernt habe? Dass Gärtnern kein Hexenwerk ist – man braucht 
            nur die richtigen Tipps zur richtigen Zeit. Und genau die teile ich mit dir: 
            ehrlich, praktisch und immer aus eigener Erfahrung.
          </p>
          <Link
            to="/about"
            className="inline-flex items-center bg-primary text-primary-foreground px-7 py-3 rounded-full font-semibold hover:opacity-90 transition-all duration-300 shadow-lg"
          >
            Mehr über mich
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="flex justify-center">
          <img
            src={marianneImg}
            alt="Marianne im Garten"
            className="rounded-2xl w-full max-w-sm h-96 object-cover border-4 border-background/80"
            style={{ boxShadow: 'var(--shadow-elevated)' }}
          />
        </div>
      </div>
    </section>
  );
};

export default AboutMarianneSection;
