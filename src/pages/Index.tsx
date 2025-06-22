
import React from 'react';
import { siteConfig } from '@/config/site.config';
import { Link } from 'react-router-dom';
import { ArrowRight, Flower, Calendar, User, Instagram, Star, CheckCircle, Heart } from 'lucide-react';
import NewsletterSignup from "@/components/NewsletterSignup";
import NewsletterInlineCard from "@/components/NewsletterInlineCard";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLandingPage from "./MobileLandingPage";

// Mariannes authentische Bilder aus Ostfriesland
const mainHeroImage =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1280&h=720&fit=crop';
const mariannePortrait =
  'https://images.unsplash.com/photo-1594736797933-d0401ba4e7ba?auto=format&fit=crop&w=400&q=80';

// Mariannes herzliche Begrüßung
const welcome = {
  headline: 'Moin! Ich bin Marianne aus Ostfriesland.',
  subheadline: 'Seit über 20 Jahren gärtnere ich hier an der Nordseeküste und teile meine Erfahrungen mit allen, die naturnah leben möchten.',
  cta: 'Lass uns gemeinsam gärtnern!'
};

// Echte Testimonials von Mariannes Community
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
  },
  {
    text: "Marianne macht Gärtnern so einfach verständlich. Meine Tomaten waren noch nie so schön!",
    author: "Sandra aus Leer",
    rating: 5
  }
];

// Mariannes bewährte Garten-Versprechen
const promises = [
  {
    icon: <CheckCircle className="w-6 h-6 text-sage-600" />,
    title: "Erprobte Tipps aus 20+ Jahren",
    description: "Keine Theorie - nur was wirklich funktioniert im norddeutschen Klima"
  },
  {
    icon: <Heart className="w-6 h-6 text-sage-600" />,
    title: "Mit Herz & Verstand",
    description: "Authentische Ratschläge einer echten Gärtnerin, nicht von einem Schreibtisch"
  },
  {
    icon: <Flower className="w-6 h-6 text-sage-600" />,
    title: "Saisonal & Regional",
    description: "Alles abgestimmt auf unser norddeutsches Wetter und unsere Böden"
  }
];

// Aktuelle Gartentipps von Marianne
const seasonalTips = [
  "🌱 Jetzt aussäen: Radieschen und Spinat vertragen noch Kälte - mein Geheimtipp für frühe Ernte!",
  "🌸 Rosen schneiden: In Ostfriesland warte ich bis nach den Eisheiligen - sicher ist sicher!",
  "🍓 Erdbeer-Zeit: Stroh unterlegen gegen Schnecken und für saubere Früchte - alte Gärtnerweisheit!",
  "🌿 Wildkräuter sammeln: Giersch und Brennnessel sind jetzt perfekt für grüne Smoothies",
  "🦋 Blumenwiese anlegen: Kornblumen und Mohn - so wird dein Garten zum Paradies für Insekten"
];

const Index = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileLandingPage />;
  }

  return (
    <div>
      {/* HERO mit Mariannes persönlicher Begrüßung */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sage-50 via-cream to-accent-50 py-20 px-4">
        <div className="absolute -z-10 inset-0 opacity-15 pointer-events-none">
          <Flower className="absolute top-12 left-10 w-20 h-20 text-sage-200 rotate-12" />
          <Flower className="absolute top-32 right-24 w-24 h-24 text-accent-200 -rotate-45" />
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                <img
                  src={mariannePortrait}
                  alt="Marianne, Gärtnerin aus Ostfriesland"
                  className="w-16 h-16 rounded-full border-3 border-sage-200 shadow-lg"
                />
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-earth-800">
                {welcome.headline}
              </h1>
              <p className="text-xl md:text-2xl font-sans text-sage-700">
                {welcome.subheadline}
              </p>
              
              {/* Hauptaktion - Newsletter als primäres Ziel */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sage-100">
                <h3 className="text-lg font-semibold text-earth-800 mb-3">
                  🌱 Hol dir meine besten Gartentipps direkt ins Postfach!
                </h3>
                <p className="text-sage-600 mb-4 text-sm">
                  Jeden Monat die passenden Tipps zur Saison - kostenlos und jederzeit abbestellbar.
                </p>
                <NewsletterSignup />
                <p className="text-xs text-sage-500 mt-2">
                  ✅ Bereits über 2.500 Garten-Freunde dabei!
                </p>
              </div>
              
              {/* Sekundäre CTAs */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-full font-medium shadow hover:scale-105 transition-all duration-200 bg-gradient-to-r from-pink-400 via-red-400 to-yellow-400 text-white"
                >
                  <Instagram className="w-5 h-5 mr-2" />
                  Folge mir auf Instagram
                </a>
                <Link
                  to="/blog"
                  className="inline-flex items-center px-6 py-3 rounded-full font-medium shadow hover:scale-105 transition-all duration-200 bg-sage-600 text-white hover:bg-sage-700"
                >
                  Gartentipps entdecken
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                src={mainHeroImage}
                alt="Mariannes Garten in Ostfriesland"
                className="rounded-xl shadow-2xl w-full max-w-md h-80 object-cover border-4 border-sage-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* VERTRAUEN & SOZIALE BEWEISE */}
      <section className="py-12 px-4 bg-white border-b border-sage-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-earth-700 mb-2">
              Was Mariannes Garten-Freunde sagen:
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-sage-25 rounded-xl p-6 border border-sage-100 shadow-sm"
              >
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-earth-700 mb-3 italic">"{testimonial.text}"</p>
                <p className="text-sage-600 font-medium text-sm">- {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARIANNES VERSPRECHEN */}
      <section className="py-16 px-4 bg-sage-25">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-earth-800 mb-4">
              Warum du mir vertrauen kannst
            </h2>
            <p className="text-sage-700 text-lg">
              Seit über 20 Jahren gärtnere ich hier in Ostfriesland und weiß, was funktioniert.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {promises.map((promise, idx) => (
              <div
                key={idx}
                className="text-center space-y-4"
              >
                <div className="mx-auto w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center">
                  {promise.icon}
                </div>
                <h3 className="text-xl font-semibold text-earth-800">{promise.title}</h3>
                <p className="text-sage-700">{promise.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SAISONALE TIPPS VON MARIANNE */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-3 text-center">
            Mariannes aktuelle Gartentipps
          </h2>
          <p className="text-center text-sage-700 mb-8">
            Frisch aus meinem Garten in Ostfriesland - das mache ich gerade:
          </p>
          <ul className="grid md:grid-cols-2 gap-6">
            {seasonalTips.map((tip, idx) => (
              <li
                key={idx}
                className="bg-sage-50 border border-sage-100 rounded-xl p-6 flex items-start gap-4 shadow-sm animate-fade-in"
                style={{ animationDelay: `${0.05 * idx}s` }}
              >
                <span className="text-2xl">{tip.match(/^[^\w\s]+/)?.[0] || "🌿"}</span>
                <span className="text-earth-700 font-medium">{tip.replace(/^[^\w\s]+/, "")}</span>
              </li>
            ))}
          </ul>
          <div className="text-center mt-10">
            <Link
              to="/blog"
              className="inline-flex items-center bg-accent-600 text-white px-8 py-4 rounded-full font-medium hover:bg-accent-700 transition-all duration-200 shadow hover:scale-105"
            >
              Alle Gartentipps im Blog <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ÜBER MARIANNE */}
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

      {/* REZEPT DER WOCHE - MARIANNES STIL */}
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

      {/* COMMUNITY CTA mit persönlicher Note */}
      <section className="py-16 px-4 bg-gradient-to-r from-sage-600 to-earth-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Lass uns zusammen gärtnern!
          </h2>
          <p className="text-xl mb-8 text-sage-100">
            Tausch dich mit mir und anderen Garten-Begeisterten aus. Zeig mir deine Erfolge mit #mientuun - 
            ich freue mich über jedes Foto aus eurem Garten!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NewsletterSignup />
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-gradient-to-r from-pink-400 via-red-400 to-yellow-400 text-white px-8 py-4 rounded-full font-medium hover:scale-105 transition-all"
            >
              <Instagram className="w-5 h-5 mr-2" />
              Folge @mientuun
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
