import React, { useEffect } from 'react';
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, Sprout, Info } from 'lucide-react';
import ModularSowingCalendar from '@/components/sowing/ModularSowingCalendar';

const AussaatkalenderPage: React.FC = () => {
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Interaktiver Aussaatkalender | Mien Tuun</title>
        <meta name="description" content="Unser interaktiver Aussaatkalender hilft dir, den perfekten Zeitpunkt für Aussaat, Pflanzung und Ernte zu finden. Mit Beetnachbar-Finder und Pflanzenfilter." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sage-50 to-accent-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center bg-white/50 p-3 rounded-full mb-6">
            <Calendar className="h-8 w-8 text-sage-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6">
            Interaktiver Aussaatkalender
          </h1>
          <p className="text-xl text-earth-600 max-w-2xl mx-auto mb-8">
            Finde den perfekten Zeitpunkt für Aussaat, Pflanzung und Ernte deiner Lieblingsgemüse, Kräuter und Obst.
          </p>
          <div className="inline-flex items-center bg-accent-100 text-accent-800 px-3 py-1 rounded-full text-sm font-medium">
            <Info className="h-4 w-4 mr-1" />
            Datenbank-gestützt
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Alert className="mb-8 bg-sage-50 border-sage-200">
            <Sprout className="h-4 w-4" />
            <AlertTitle>Moderner Aussaatkalender</AlertTitle>
            <AlertDescription>
              Unser interaktiver Aussaatkalender ist jetzt mit einer Datenbank verbunden und bietet erweiterte Funktionen wie Beetnachbarn-Finder und detaillierte Anbautipps.
            </AlertDescription>
          </Alert>

          <ModularSowingCalendar />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 bg-gradient-to-r from-sage-50 to-accent-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-4">
            Plane deinen Garten mit unserem Aussaatkalender
          </h2>
          <p className="text-lg text-earth-600 mb-6">
            Entdecke noch mehr Gartentipps und saisonale Rezepte in unserem Blog.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-sage-600 hover:bg-sage-700">
              <a href="/blog?category=aussaat-pflanzung">Aussaat & Pflanzung Tipps</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/blog?category=saisonale-kueche">Saisonale Rezepte</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default AussaatkalenderPage;