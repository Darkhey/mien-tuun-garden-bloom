import React from 'react';
import Layout from '@/components/Layout';
import { siteConfig } from '@/config/site.config';
import { Link } from 'react-router-dom';
import { ArrowRight, Flower, Calendar, User, Instagram } from 'lucide-react';
import NewsletterSignup from "@/components/NewsletterSignup";

// Foto-Quellen und zentrale Werte aus siteConfig für maximale Flexibilität:
const mainHeroImage =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1280&h=720&fit=crop';
const aboutImage =
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=900&q=80';

// Zentrale Text-Abschnitte inhaltlich dem Stil von mien-tuun.de nachempfunden:
const welcome = {
  headline: 'Natürlich Gärtnern. Bewusst Genießen.',
  subheadline:
    'Inspiration für alle, die naturnah ihren Garten gestalten und die Ernte mit Freude in der Küche veredeln wollen.'
};

const about = {
  text: `Mien Tuun ist deine digitale Gartenbank: Hier treffen sich Pflanzenliebe, Saisonalität, nachhaltiges Leben und kulinarische Entdeckerlust! 
Ob Beetplanung, Rezepte oder grüne DIY-Ideen – finde alles, was dein Gartenherz höherschlagen lässt und teile die Freude an bewusstem Leben.`,
  cta: "Mehr über uns"
}

const seasonal = {
  title: "Gerade Aktuell im Garten & der Küche",
  subtitle: "Ob Aussaat, Pflege oder Genuss: Lass dich von saisonalen Highlights inspirieren!",
  tips: [
    "🌱 Jetzt Kräuter vorziehen oder direkt aussäen – Frische für die Küche das ganze Jahr!",
    "🌸 Juni: Rosenzeit – verwöhne deine Lieblingsblumen mit selbstgemachtem Kompost.",
    "🍓 Erdbeerzeit! Unser Tipp: Bio-Mulch gegen Schnecken und feine Rezepte für Erdbeer-Törtchen.",
    "🌿 Wiesenkräuter erkennen und als Wildkräutersalat nutzen – so holst du dir die Natur auf den Teller.",
    "🦋 Lebensraum schaffen: Mit Wildblumenwiesen und Insektenhotels tust du Gutes für die Biodiversität."
  ]
};

const socialLinks = [
  {
    label: "Instagram",
    icon: <Instagram className="w-5 h-5 mr-2" />,
    url: siteConfig.social.instagram,
    color: "bg-gradient-to-r from-pink-400 via-red-400 to-yellow-400",
  },
  {
    label: "Newsletter",
    icon: <ArrowRight className="w-5 h-5 mr-2" />,
    url: siteConfig.social.newsletter,
    color: "bg-sage-600",
  },
  {
    label: "Pinterest",
    icon: (
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12,2C6.5,2,2,6.6,2,12.1c0,4.1,2.5,7.7,6,9V17.2c-1.3-1.7-1.4-4.5-0.1-6.2c1.1-1.6,2.8-2,4.4-2c2,0,4.1,0.5,4.1,2.5   c0,1.6-1.6,2.3-2.6,2.4c-0.6,0-1-0.2-1.1,0.5c-0.2,1.2-0.8,2.6-0.3,2.6c0.9,0,1.7-1.1,3.7-1.1c2.5,0,3.7,1.8,3.7,3.6   c0,2.2-2.3,3.3-4.6,3.3c-5.9,0-7.1-5.2-7.1-9.2c0-5,4.5-9.1,9.7-9.1c5.2,0,9.4,4.1,9.4,9.3C22,17.9,20.1,20,15.4,20c-1.2,0-2.6-0.2-3.5-0.7C13,19.9,14.7,20,16.5,20C21,20,22,17.3,22,13.4C22,8.4,17.5,4,12,4z"/>
      </svg>
    ),
    url: siteConfig.social.pinterest,
    color: "bg-rose-200 text-rose-800",
  },
];

const Index = () => {
  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sage-50 via-cream to-accent-50 py-20 px-4">
        <div className="absolute -z-10 inset-0 opacity-15 pointer-events-none">
          <Flower className="absolute top-12 left-10 w-20 h-20 text-sage-200 rotate-12" />
          <Flower className="absolute top-32 right-24 w-24 h-24 text-accent-200 -rotate-45" />
        </div>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 text-center md:text-left space-y-4 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-earth-800">
              {welcome.headline}
            </h1>
            <p className="text-xl md:text-2xl font-sans text-sage-700">
              {welcome.subheadline}
            </p>
            <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
              {socialLinks.map(link => (
                <a
                  href={link.url}
                  key={link.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center px-6 py-3 rounded-full font-medium shadow hover:scale-105 transition-all duration-200 ${link.color} text-white`}
                >
                  {link.icon}
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <img
              src={mainHeroImage}
              alt="Grüner Garten"
              className="rounded-xl shadow-2xl w-full max-w-md h-72 object-cover border-4 border-sage-100"
            />
          </div>
        </div>
      </section>

      {/* AKTUELL IM GARTEN */}
      <section className="py-16 px-4 bg-sage-25">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-3 text-center">
            {seasonal.title}
          </h2>
          <p className="text-center text-sage-700 mb-8">
            {seasonal.subtitle}
          </p>
          <ul className="grid md:grid-cols-2 gap-6">
            {seasonal.tips.map((tip, idx) => (
              <li
                key={idx}
                className="bg-white border border-sage-100 rounded-xl p-6 flex items-start gap-4 shadow-sm animate-fade-in"
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
              Aktuelle Gartentipps im Blog <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT & COMMUNITY */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <img
              src={aboutImage}
              alt="Über uns"
              className="rounded-2xl shadow-xl w-full h-72 object-cover mb-6 md:mb-0"
            />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-4">
              Willkommen bei Mien Tuun!
            </h2>
            <p className="text-sage-700 mb-6 text-lg whitespace-pre-line">{about.text}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/about"
                className="inline-flex items-center bg-sage-700 text-white px-7 py-3 rounded-full font-medium hover:bg-sage-800 transition-colors"
              >
                {about.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SEASONAL RECIPE + BLOG PREVIEW (EXISTIERENDES BEIBEHALTEN, INHALT AN NICKELEN STYLE ANGEPASST) */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-earth-800 mb-4">
              Rezept der Woche
            </h2>
            <p className="text-earth-600 text-lg">
              Saisonale Gartenküche – unser Lieblingsrezept im Juni
            </p>
          </div>
          <div className="bg-gradient-to-r from-accent-50 to-sage-50 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-4">
                  Frischer Erdbeer-Kräuter-Salat
                </h3>
                <p className="text-earth-600 mb-6 text-lg">
                  Fruchtig, bunt und voller Vitamine: Erdbeeren, Wildkräuter, Käse und geröstete Nüsse,
                  verfeinert mit Holunderblütensirup-Dressing – so schmeckt der Sommer!
                </p>
                <div className="flex flex-wrap gap-6 mb-8 text-sm">
                  <div className="flex items-center text-earth-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    20 Min
                  </div>
                  <div className="flex items-center text-earth-600">
                    <User className="h-4 w-4 mr-2" />
                    2 Portionen
                  </div>
                  <div className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-xs font-medium">
                    einfach
                  </div>
                </div>
                <Link
                  to="/rezepte"
                  className="inline-flex items-center bg-earth-600 text-white px-6 py-3 rounded-full font-medium hover:bg-earth-700 transition-colors"
                >
                  Mehr saisonale Rezepte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=800&q=80"
                  alt="Erdbeer-Salat"
                  className="w-full h-80 object-cover rounded-xl shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-sage-600 to-earth-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Mach mit & werde Teil unserer Garten-Community!
          </h2>
          <p className="text-xl mb-8 text-sage-100">
            Teile deine Gartentipps & Rezepterlebnisse mit @mientuun auf Instagram – oder melde dich zu unserem Newsletter an.
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
              @mientuun auf Instagram
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
