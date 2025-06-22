
import React from "react";
import { ArrowRight, Instagram, Star, Calendar, User } from "lucide-react";
import { Link } from 'react-router-dom';
import NewsletterSignup from "@/components/NewsletterSignup";
import { siteConfig } from '@/config/site.config';

const mariannePortrait =
  'https://images.unsplash.com/photo-1594736797933-d0401ba4e7ba?auto=format&fit=crop&w=400&q=80';
const mainHeroImage =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=480&fit=crop";

const seasonTips = [
  "🌱 Jetzt aussäen: Radieschen und Spinat vertragen noch Kälte - mein Geheimtipp für frühe Ernte!",
  "🌸 Rosen schneiden: In Ostfriesland warte ich bis nach den Eisheiligen - sicher ist sicher!",
  "🍓 Erdbeer-Zeit: Stroh unterlegen gegen Schnecken und für saubere Früchte - alte Gärtnerweisheit!",
  "🌿 Wildkräuter sammeln: Giersch und Brennnessel sind jetzt perfekt für grüne Smoothies",
  "🦋 Blumenwiese anlegen: Kornblumen und Mohn - so wird dein Garten zum Paradies für Insekten"
];

const testimonials = [
  {
    text: "Mariannes Tipps haben meinen Garten verwandelt! Ihre ostfriesische Art ist so herzlich und ehrlich.",
    author: "Petra aus Hamburg",
    rating: 5
  },
  {
    text: "Endlich jemand, der wirklich weiß wovon sie spricht. Die Rezepte sind köstlich und die Gartentipps funktionieren!",
    author: "Klaus aus Bremen",
    rating: 5
  }
];

const MobileLandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-sage-50">
      {/* HERO */}
      <section className="pt-8 px-4 text-center flex flex-col gap-4">
        <div className="flex items-center gap-3 justify-center mb-2">
          <img
            src={mariannePortrait}
            alt="Marianne, Gärtnerin aus Ostfriesland"
            className="w-12 h-12 rounded-full border-2 border-sage-200 shadow-lg"
          />
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
        </div>
        <img
          src={mainHeroImage}
          alt="Mariannes Garten in Ostfriesland"
          className="w-full max-w-[360px] aspect-[4/3] rounded-2xl shadow-lg mx-auto object-cover border-2 border-sage-100"
        />
        <h1 className="text-2xl font-bold font-serif text-earth-800">
          Moin! Ich bin Marianne<br />aus Ostfriesland.
        </h1>
        <p className="text-base text-sage-700">
          Seit über 20 Jahren gärtnere ich hier an der Nordseeküste und teile meine Erfahrungen mit allen, die naturnah leben möchten.
        </p>
        
        {/* Newsletter Signup */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-sage-100 mt-2">
          <h3 className="text-base font-semibold text-earth-800 mb-2">
            🌱 Hol dir meine besten Gartentipps!
          </h3>
          <p className="text-sage-600 mb-3 text-sm">
            Jeden Monat die passenden Tipps zur Saison - kostenlos.
          </p>
          <NewsletterSignup />
          <p className="text-xs text-sage-500 mt-2">
            ✅ Bereits über 2.500 Garten-Freunde dabei!
          </p>
        </div>
      </section>

      {/* Call-To-Action Buttons */}
      <div className="flex flex-col gap-3 mt-4 px-4">
        <a
          href={siteConfig.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex justify-center items-center bg-gradient-to-r from-pink-400 via-red-400 to-yellow-400 text-white py-3 rounded-full font-medium text-base shadow hover:scale-105 transition"
        >
          <Instagram className="w-5 h-5 mr-2" />
          Folge mir auf Instagram
        </a>
        <Link
          to="/blog"
          className="inline-flex justify-center items-center bg-sage-600 text-white py-3 rounded-full font-medium text-base shadow hover:bg-sage-700 transition"
        >
          Gartentipps entdecken
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      {/* Testimonials */}
      <section className="mt-8 px-4">
        <h2 className="text-lg font-semibold text-earth-700 mb-3 text-center">
          Was meine Garten-Freunde sagen:
        </h2>
        <div className="space-y-3">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 border border-sage-100 shadow-sm"
            >
              <div className="flex text-yellow-400 mb-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <p className="text-earth-700 mb-2 italic text-sm">"{testimonial.text}"</p>
              <p className="text-sage-600 font-medium text-xs">- {testimonial.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Saisonale Highlights */}
      <section className="mt-8 px-4">
        <h2 className="text-lg font-semibold text-earth-700 mb-3">Mariannes aktuelle Gartentipps</h2>
        <p className="text-sm text-sage-700 mb-4 text-center">
          Frisch aus meinem Garten in Ostfriesland - das mache ich gerade:
        </p>
        <ul className="flex flex-col gap-3">
          {seasonTips.map((tip, idx) => (
            <li
              key={idx}
              className="bg-white border border-sage-100 rounded-xl p-4 text-sage-800 text-sm shadow animate-fade-in flex items-start gap-3"
            >
              <span className="text-xl">{tip.match(/^[^\w\s]+/)?.[0] || "🌿"}</span>
              <span className="text-earth-700 font-medium">{tip.replace(/^[^\w\s]+/, "")}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Recipe Spotlight */}
      <section className="mt-8 px-4">
        <h2 className="text-lg font-semibold text-earth-700 mb-3">Mariannes Küchentipp</h2>
        <div className="bg-gradient-to-r from-accent-50 to-sage-50 rounded-xl p-4">
          <h3 className="text-xl font-serif font-bold text-earth-800 mb-2">
            Ostfriesischer Kräuterquark
          </h3>
          <p className="text-earth-600 mb-4 text-sm">
            Mit allem, was der Garten hergibt: Schnittlauch, Petersilie, Dill und ein Hauch Liebstöckel. 
            Dazu frisches Bauernbrot - so schmeckt der Sommer bei uns!
          </p>
          <div className="flex flex-wrap gap-4 mb-4 text-xs">
            <div className="flex items-center text-earth-600">
              <Calendar className="h-3 w-3 mr-1" />
              15 Min
            </div>
            <div className="flex items-center text-earth-600">
              <User className="h-3 w-3 mr-1" />
              4 Portionen
            </div>
            <div className="px-2 py-1 bg-sage-100 text-sage-700 rounded-full text-xs font-medium">
              kinderleicht
            </div>
          </div>
          <Link
            to="/rezepte"
            className="inline-flex items-center bg-earth-600 text-white px-4 py-2 rounded-full font-medium text-sm hover:bg-earth-700 transition-colors"
          >
            Mariannes Rezepte entdecken
            <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* About Marianne */}
      <section className="mt-8 px-4">
        <h2 className="text-lg font-semibold text-earth-700 mb-3">Über mich</h2>
        <div className="bg-white rounded-xl p-4 border border-sage-100 shadow-sm">
          <p className="text-sage-700 mb-3 text-sm">
            Hier in Ostfriesland, wo der Wind mal rau werden kann und die Böden ihre eigenen Launen haben, 
            gärtnere ich seit über 20 Jahren. Was ich dabei gelernt habe? 
          </p>
          <p className="text-sage-700 mb-4 text-sm">
            Dass Gärtnern kein Hexenwerk ist - man braucht nur die richtigen Tipps zur richtigen Zeit. 
            Und genau die teile ich mit dir: ehrlich, praktisch und immer aus eigener Erfahrung.
          </p>
          <Link
            to="/about"
            className="inline-flex items-center bg-sage-700 text-white px-4 py-2 rounded-full font-medium text-sm hover:bg-sage-800 transition-colors"
          >
            Mehr über mich
            <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* Community CTA */}
      <section className="mt-8 px-4 flex-1 flex flex-col justify-end mb-8">
        <div className="bg-gradient-to-r from-sage-600 to-earth-600 rounded-xl p-6 text-center text-white">
          <h3 className="text-lg font-semibold mb-2">
            Lass uns zusammen gärtnern!
          </h3>
          <p className="text-sage-100 mb-4 text-sm">
            Tausch dich mit mir und anderen Garten-Begeisterten aus. Zeig mir deine Erfolge mit #mientuun!
          </p>
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center items-center bg-gradient-to-r from-pink-400 via-red-400 to-yellow-400 text-white py-3 px-6 rounded-full font-medium text-sm shadow hover:scale-105 transition-all"
          >
            <Instagram className="w-4 h-4 mr-2" />
            Folge @mientuun
          </a>
        </div>
      </section>
    </div>
  );
};

export default MobileLandingPage;
