
import React from 'react';
import Layout from '@/components/Layout';
import { siteConfig } from '@/config/site.config';
import { Heart, Flower, Leaf, Sun } from 'lucide-react';

const About = () => {
  return (
    <Layout title={`Über mich - ${siteConfig.title}`}>
      {/* Hero */}
      <section className="bg-gradient-to-br from-sage-50 to-accent-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6">
            Über {siteConfig.name}
          </h1>
          <p className="text-xl text-earth-600">
            Eine Liebeserklärung an Garten, Küche und nachhaltiges Leben
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <img
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop"
                alt="Garten"
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-earth-800 mb-6">
                Meine Geschichte
              </h2>
              <p className="text-earth-600 mb-4 leading-relaxed">
                Willkommen in meinem kleinen digitalen Garten! Ich bin Anna und teile hier meine Leidenschaft 
                für nachhaltiges Gärtnern, saisonales Kochen und ein bewusstes Leben im Einklang mit der Natur.
              </p>
              <p className="text-earth-600 mb-6 leading-relaxed">
                Was als kleiner Balkonkräutergarten begann, ist zu einer tiefen Verbindung mit der Erde und 
                ihren Zyklen geworden. Hier findest du erprobte Rezepte, praktische Gartentipps und Inspiration 
                für ein nachhaltigeres Leben.
              </p>
              <div className="flex items-center text-sage-600">
                <Heart className="h-5 w-5 mr-2" />
                <span className="font-medium">Gemacht mit Liebe für die Natur</span>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-sage-600" />
              </div>
              <h3 className="text-xl font-serif font-bold text-earth-800 mb-3">
                Nachhaltigkeit
              </h3>
              <p className="text-earth-600">
                Umweltbewusstes Gärtnern ohne Chemie, Ressourcenschonung und natürliche Kreisläufe.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sun className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-serif font-bold text-earth-800 mb-3">
                Saisonalität
              </h3>
              <p className="text-earth-600">
                Leben im Rhythmus der Jahreszeiten mit frischen, regionalen Zutaten.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flower className="h-8 w-8 text-sage-600" />
              </div>
              <h3 className="text-xl font-serif font-bold text-earth-800 mb-3">
                Natürlichkeit
              </h3>
              <p className="text-earth-600">
                Einfache, natürliche Lösungen für Garten und Küche ohne komplizierte Prozesse.
              </p>
            </div>
          </div>

          {/* Mission */}
          <div className="bg-gradient-to-r from-sage-50 to-accent-50 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-serif font-bold text-earth-800 mb-6">
              Meine Mission
            </h2>
            <p className="text-xl text-earth-600 mb-6 leading-relaxed">
              Ich möchte zeigen, dass nachhaltiges Leben nicht kompliziert sein muss. 
              Mit einfachen Mitteln, viel Liebe zur Natur und ein bisschen Geduld 
              können wir alle einen Beitrag zu einer grüneren Welt leisten.
            </p>
            <p className="text-earth-600 italic">
              "Ein Garten ist ein Ort, wo man lernt, dass Wachstum Zeit braucht und Geduld belohnt wird."
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
