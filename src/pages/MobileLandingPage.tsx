
import React from "react";
import { ArrowRight, Instagram } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";
import { siteConfig } from '@/config/site.config';

const mainHeroImage =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=480&fit=crop";

const seasonTips = [
  "Jetzt Kräuter aussäen!",
  "Juni: Rosenzeit 🌸",
  "🍓 Erdbeerzeit nutzen!",
  "Wildkräutersalat sammeln",
  "🦋 Blumenwiese für Insekten"
];

const MobileLandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-sage-50">
      {/* HERO */}
      <section className="pt-10 px-4 text-center flex flex-col gap-6">
        <img
          src={mainHeroImage}
          alt="Gartenfrische auf dem Handy"
          className="w-full max-w-[360px] aspect-[4/3] rounded-2xl shadow-lg mx-auto object-cover border-2 border-sage-100"
        />
        <h1 className="text-2xl font-bold font-serif text-earth-800">
          Natürlich Gärtnern.<br /> Bewusst Genießen.
        </h1>
        <p className="text-base text-sage-700">
          Inspiration für deine Gartensaison und saisonale Küche – jetzt mobil entdecken!
        </p>
      </section>
      {/* Call-To-Action Buttons */}
      <div className="flex flex-col gap-3 mt-6 px-4">
        <a
          href={siteConfig.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex justify-center items-center bg-gradient-to-r from-pink-400 via-red-400 to-yellow-400 text-white py-3 rounded-full font-medium text-lg shadow hover:scale-105 transition"
        >
          <Instagram className="w-5 h-5 mr-2" />
          Folge uns auf Instagram
        </a>
        <div>
          <NewsletterSignup />
        </div>
      </div>
      {/* Saisonale Highlights */}
      <section className="mt-10 px-4">
        <h2 className="text-lg font-semibold text-earth-700 mb-3">Jetzt im Garten</h2>
        <ul className="flex flex-col gap-2">
          {seasonTips.map((tip, idx) => (
            <li
              key={idx}
              className="bg-white border border-sage-100 rounded-lg px-4 py-3 text-sage-800 text-base shadow animate-fade-in"
            >
              {tip}
            </li>
          ))}
        </ul>
      </section>
      {/* Community CTA */}
      <section className="mt-10 px-4 flex-1 flex flex-col justify-end mb-10">
        <h3 className="text-base font-semibold text-sage-700 mb-2">
          Teile deine Tipps mit #mientuun
        </h3>
        <a
          href={siteConfig.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex justify-center items-center bg-sage-700 text-white py-3 rounded-full font-medium text-base shadow hover:bg-sage-800 transition"
        >
          <ArrowRight className="w-5 h-5 mr-2" />
          Inspiration holen
        </a>
      </section>
    </div>
  );
};

export default MobileLandingPage;
