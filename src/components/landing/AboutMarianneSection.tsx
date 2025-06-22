
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const AboutMarianneSection: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-sage-50 to-accent-50">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-in">
          <img
            src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=900&q=80"
            alt="Mariannes Garten"
            className="rounded-2xl shadow-xl w-full h-72 object-cover"
          />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-4">
            Moin, ich bin Marianne!
          </h2>
          <p className="text-sage-700 mb-4 text-lg">
            Hier in Ostfriesland, wo der Wind mal rau werden kann und die Böden ihre eigenen Launen haben, 
            gärtnere ich seit über 20 Jahren. Was ich dabei gelernt habe? 
          </p>
          <p className="text-sage-700 mb-6 text-lg">
            Dass Gärtnern kein Hexenwerk ist - man braucht nur die richtigen Tipps zur richtigen Zeit. 
            Und genau die teile ich mit dir: ehrlich, praktisch und immer aus eigener Erfahrung.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/about"
              className="inline-flex items-center bg-sage-700 text-white px-7 py-3 rounded-full font-medium hover:bg-sage-800 transition-colors"
            >
              Mehr über mich
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMarianneSection;
