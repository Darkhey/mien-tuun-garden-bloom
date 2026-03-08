import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import recipeImg from '@/assets/recipe-spotlight.jpg';

const RecipeSpotlightSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Mariannes Küchentipp der Woche
          </h2>
          <p className="text-muted-foreground text-lg">
            Frisch aus dem Garten auf den Teller
          </p>
        </div>
        <div className="garden-card p-0 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Ostfriesischer Kräuterquark
              </h3>
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                Mit allem, was der Garten hergibt: Schnittlauch, Petersilie, Dill und 
                ein Hauch Liebstöckel. Dazu frisches Bauernbrot – so schmeckt der Sommer!
              </p>
              <div className="flex flex-wrap gap-4 mb-8 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  15 Min
                </div>
                <div className="flex items-center text-muted-foreground">
                  <User className="h-4 w-4 mr-2 text-primary" />
                  4 Portionen
                </div>
                <span className="garden-badge">kinderleicht</span>
              </div>
              <Link
                to="/rezepte"
                className="inline-flex items-center bg-accent text-accent-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all duration-300 shadow-md self-start"
              >
                Rezepte entdecken
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="relative min-h-[320px]">
              <img
                src={recipeImg}
                alt="Kräuterquark mit frischen Gartenkräutern und Bauernbrot"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecipeSpotlightSection;
