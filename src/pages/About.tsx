
import React from 'react';
import { siteConfig } from '@/config/site.config';
import { Heart, Flower, Leaf, Sun, Sprout } from 'lucide-react';

const marianneImage =
  "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&h=600&fit=crop"; // Authentisches, freundliches Gärtnerinnen-Bild

const About = () => {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-sage-50 to-accent-50 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          <img
            src={marianneImage}
            alt="Marianne – Ostfriesische Gärtnerin"
            className="w-28 h-28 object-cover rounded-full border-4 border-sage-200 mb-6 shadow-lg"
          />
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-4 animate-fade-in">
            Über Marianne
          </h1>
          <p className="text-xl text-earth-600 max-w-xl mx-auto">
            <span className="font-semibold">
              Ostfriesische Gärtnerin, Naturfreundin & Genießerin.
            </span>{" "}
            Hier teile ich meine Liebe für den Garten, die ostfriesische Natur
            und selbstgemachte, saisonale Rezepte.
          </p>
        </div>
      </section>

      {/* Vorstellung & Autorinnenkarte */}
      <section className="py-10 px-4 bg-cream">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 animate-fade-in">
          <div className="col-span-1 flex flex-col items-center justify-center bg-sage-100 rounded-2xl p-6 shadow h-full">
            <img
              src={marianneImage}
              alt="Marianne Portrait"
              className="w-24 h-24 rounded-full object-cover border-2 border-earth-200 mb-3 shadow"
            />
            <div className="font-serif text-xl text-earth-800 mb-1">
              Marianne
            </div>
            <div className="text-sage-700 text-sm mb-2">Gärtnerin aus Ostfriesland</div>
            <Heart className="w-6 h-6 text-sage-500 mb-2" />
            <div className="italic text-sage-700 text-center text-sm">
              „Mit Herz & Erde – Gärtnern ist für mich Lebensfreude, Erdverbundenheit und Genuss!“
            </div>
          </div>
          <div className="col-span-2 flex flex-col justify-center">
            <h2 className="text-2xl font-serif font-bold text-earth-800 mb-3">
              Meine Geschichte
            </h2>
            <p className="text-earth-700 mb-3 leading-relaxed">
              Moin! Ich bin Marianne – geboren und aufgewachsen zwischen Deichen, Schafen und wilden Gärten in Ostfriesland.
              Mit den Händen in der Erde habe ich schon als Kind Samen gelegt und das Wunder der Natur bestaunt.
            </p>
            <p className="text-earth-700 mb-3 leading-relaxed">
              Heute pflege ich mit Freude meinen Bauerngarten, ziehe Gemüse, Kräuter und Blumen, koche regional-saisonal und teile 
              meine Erfahrungen, Tipps und Rezepte hier mit dir. Mein Herz schlägt für echte, natürliche Lebensmittel aus dem eigenen Garten 
              und für kleine, nachhaltige Schritte im Alltag.
            </p>
            <p className="text-earth-700 mb-3 leading-relaxed">
              Diese Seite ist ein liebevolles Sammelsurium meiner Gartenglück-Momente – vielleicht findest du hier auch ein Stückchen Inspiration
              und Freude für deine grüne Oase!
            </p>
          </div>
        </div>
      </section>

      {/* Werte */}
      <section className="py-14 px-4 bg-sage-50">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-7">
          <div className="text-center flex flex-col items-center bg-white/60 p-5 rounded-xl shadow">
            <div className="w-14 h-14 bg-sage-100 rounded-full flex items-center justify-center mb-3 shadow-md">
              <Leaf className="h-7 w-7 text-sage-600" />
            </div>
            <div className="text-lg font-serif font-bold text-earth-800 mb-2">
              Nachhaltigkeit
            </div>
            <div className="text-earth-600 text-sm">
              Natürliches Gärtnern ohne Chemie, regionale Produkte & Respekt vor der Natur.
            </div>
          </div>
          <div className="text-center flex flex-col items-center bg-white/60 p-5 rounded-xl shadow">
            <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center mb-3 shadow-md">
              <Sun className="h-7 w-7 text-accent-600" />
            </div>
            <div className="text-lg font-serif font-bold text-earth-800 mb-2">
              Saisonalität
            </div>
            <div className="text-earth-600 text-sm">
              Leben im Rhythmus der Jahreszeiten – vom ersten Krokus bis zur letzten Kartoffelernte.
            </div>
          </div>
          <div className="text-center flex flex-col items-center bg-white/60 p-5 rounded-xl shadow">
            <div className="w-14 h-14 bg-sage-100 rounded-full flex items-center justify-center mb-3 shadow-md">
              <Flower className="h-7 w-7 text-sage-600" />
            </div>
            <div className="text-lg font-serif font-bold text-earth-800 mb-2">
              Natürlichkeit
            </div>
            <div className="text-earth-600 text-sm">
              Einfache, ehrliche Rezepte, bodenständige Gartentricks und viel Freude an kleinen Wundern.
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-gradient-to-r from-sage-50 to-accent-50 rounded-2xl max-w-3xl mx-auto mt-12 mb-14 p-8 md:p-12 text-center shadow animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-4">
          Meine Mission
        </h2>
        <p className="text-lg text-earth-700 mb-5 leading-relaxed">
          Ich möchte dich inspirieren, das große Glück im kleinen Garten zu finden.
          Denn Gärtnern ist mehr als Arbeit – es ist Auszeit, Naturerlebnis, Achtsamkeit und Belohnung zugleich.
        </p>
        <p className="text-earth-600 italic mb-1">
          "Große Gärten entstehen aus kleinen Träumen – und einem Herz, das mitwächst."
        </p>
        <div className="flex justify-center mt-4">
          <Sprout className="w-8 h-8 text-sage-500" />
        </div>
      </section>
    </>
  );
};

export default About;
