
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';

const RecipeSpotlightSection: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-earth-800 mb-4">
            Mariannes Küchentipp der Woche
          </h2>
          <p className="text-earth-600 text-lg">
            Frisch aus dem Garten auf den Teller - so koche ich gerne
          </p>
        </div>
        <div className="bg-gradient-to-r from-accent-50 to-sage-50 rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-4">
                Ostfriesischer Kräuterquark
              </h3>
              <p className="text-earth-600 mb-6 text-lg">
                Mit allem, was der Garten hergibt: Schnittlauch, Petersilie, Dill und ein Hauch Liebstöckel. 
                Dazu frisches Bauernbrot - so schmeckt der Sommer bei uns!
              </p>
              <div className="flex flex-wrap gap-6 mb-8 text-sm">
                <div className="flex items-center text-earth-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  15 Min
                </div>
                <div className="flex items-center text-earth-600">
                  <User className="h-4 w-4 mr-2" />
                  4 Portionen
                </div>
                <div className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-xs font-medium">
                  kinderleicht
                </div>
              </div>
              <Link
                to="/rezepte"
                className="inline-flex items-center bg-earth-600 text-white px-6 py-3 rounded-full font-medium hover:bg-earth-700 transition-colors"
              >
                Mariannes Rezepte entdecken
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=800&q=80"
                alt="Kräuterquark mit frischen Gartenkräutern"
                className="w-full h-80 object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecipeSpotlightSection;
