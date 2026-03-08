import React, { useEffect } from "react";
import { ArrowRight, Instagram, Sprout, BookOpen, UtensilsCrossed, Leaf } from "lucide-react";
import { Link } from 'react-router-dom';
import NewsletterSignup from "@/components/NewsletterSignup";
import { siteConfig } from '@/config/site.config';
import MobilePostsCarousel from "@/components/landing/MobilePostsCarousel";
import MobileWeatherWidget from "@/components/landing/MobileWeatherWidget";
import LatestCommentsSection from "@/components/landing/LatestCommentsSection";
import { useQueryClient } from '@tanstack/react-query';
import { fetchLatestPosts, fetchLatestComments } from '@/queries/content';
import { motion } from 'framer-motion';
import marianneImg from '@/assets/marianne-portrait.jpg';

const mainHeroImage = "/lovable-uploads/74b7922c-0eef-4cb4-9f0f-f21774dc9768.png";

// Dynamic seasonal tips by month
const MONTHLY_TIPS: Record<number, { emoji: string; text: string }[]> = {
  0: [
    { emoji: "🌱", text: "Saatgut bestellen und Anzuchtpläne machen" },
    { emoji: "🪵", text: "Gartengeräte pflegen und schärfen" },
    { emoji: "📖", text: "Gartenbücher lesen und inspirieren lassen" },
  ],
  1: [
    { emoji: "🌱", text: "Erste Aussaaten auf der Fensterbank: Paprika, Chili" },
    { emoji: "🪴", text: "Zimmerpflanzen umtopfen – jetzt ideal" },
    { emoji: "🐦", text: "Nistkästen aufhängen für die Brutsaison" },
  ],
  2: [
    { emoji: "🌱", text: "Tomaten und Kohlrabi vorziehen" },
    { emoji: "✂️", text: "Rosen und Obstbäume zurückschneiden" },
    { emoji: "🥬", text: "Frühbeet mit Salat und Radieschen bestücken" },
  ],
  3: [
    { emoji: "🌷", text: "Dahlien und Gladiolen pflanzen" },
    { emoji: "🥕", text: "Möhren, Erbsen und Spinat direkt säen" },
    { emoji: "🐝", text: "Bienenfreundliche Blumen aussäen" },
  ],
  4: [
    { emoji: "🍅", text: "Nach den Eisheiligen: Tomaten raus!" },
    { emoji: "🌿", text: "Kräuter ins Beet oder den Balkonkasten" },
    { emoji: "🦋", text: "Blumenwiese anlegen für Insekten" },
  ],
  5: [
    { emoji: "🍓", text: "Erdbeeren ernten – Stroh unterlegen!" },
    { emoji: "🌹", text: "Rosen regelmäßig auf Blattläuse prüfen" },
    { emoji: "💧", text: "Morgens gießen, Mulch gegen Verdunstung" },
  ],
  6: [
    { emoji: "🥒", text: "Zucchini und Gurken ernten" },
    { emoji: "🌻", text: "Sonnenblumen stützen bei Wind" },
    { emoji: "🫗", text: "Regelmäßig und durchdringend wässern" },
  ],
  7: [
    { emoji: "🍅", text: "Tomaten ausgeizen und hochbinden" },
    { emoji: "🫐", text: "Beeren ernten und einfrieren" },
    { emoji: "🥬", text: "Herbstgemüse aussäen: Feldsalat, Spinat" },
  ],
  8: [
    { emoji: "🍎", text: "Äpfel und Birnen ernten" },
    { emoji: "🌱", text: "Gründüngung auf leere Beete säen" },
    { emoji: "🧅", text: "Zwiebeln für Frühjahrsblüher stecken" },
  ],
  9: [
    { emoji: "🍂", text: "Laub sammeln – perfekt als Mulch" },
    { emoji: "🥀", text: "Dahlien vor dem Frost ausgraben" },
    { emoji: "🏡", text: "Garten winterfest machen" },
  ],
  10: [
    { emoji: "🌳", text: "Obstbäume pflanzen – ideale Zeit!" },
    { emoji: "🦔", text: "Igel-Quartiere aus Laub und Reisig" },
    { emoji: "🧹", text: "Beete aufräumen und mulchen" },
  ],
  11: [
    { emoji: "📋", text: "Gartenjahr reflektieren und planen" },
    { emoji: "🎄", text: "Winterdeko mit Naturmaterialien" },
    { emoji: "🌱", text: "Keimsprossen auf der Fensterbank ziehen" },
  ],
};

const quickLinks = [
  { to: "/blog", label: "Blog", icon: BookOpen },
  { to: "/rezepte", label: "Rezepte", icon: UtensilsCrossed },
  { to: "/aussaatkalender", label: "Aussaat", icon: Sprout },
  { to: "/about", label: "Über mich", icon: Leaf },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const MobileLandingPage = () => {
  const queryClient = useQueryClient();
  const currentMonth = new Date().getMonth();
  const seasonalTips = MONTHLY_TIPS[currentMonth] || MONTHLY_TIPS[0];

  useEffect(() => {
    queryClient.prefetchQuery({ queryKey: ['latest-posts'], queryFn: fetchLatestPosts }).catch(console.warn);
    queryClient.prefetchQuery({ queryKey: ['latest-comments'], queryFn: fetchLatestComments }).catch(console.warn);
  }, [queryClient]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* IMMERSIVE HERO */}
      <section className="relative h-[70vh] min-h-[480px] overflow-hidden">
        <img
          src={mainHeroImage}
          alt="Mariannes idyllischer Garten in Ostfriesland"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5 pb-6 space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={marianneImg}
              alt="Marianne"
              className="w-11 h-11 rounded-full ring-2 ring-primary/30 object-cover"
            />
            <div>
              <p className="text-xs font-medium text-foreground/70">Garten-Blog aus Ostfriesland</p>
            </div>
          </div>
          <h1 className="text-3xl font-bold leading-tight text-foreground tracking-tight">
            Moin! Willkommen in
            <span className="garden-gradient-text block">Mariannes Garten</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Seit über 20 Jahren gärtnere ich an der Nordseeküste und teile erprobte Tipps für naturnah leben.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg bg-primary text-primary-foreground hover:scale-[1.03] transition-all"
          >
            <Sprout className="w-4 h-4 mr-2" />
            Gartentipps entdecken
            <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </Link>
        </div>
      </section>

      {/* QUICK LINKS */}
      <nav className="flex gap-2 px-4 py-4 overflow-x-auto scrollbar-hide">
        {quickLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border border-border bg-card text-foreground hover:bg-primary/5 transition-colors"
          >
            <Icon className="w-3.5 h-3.5 text-primary" />
            {label}
          </Link>
        ))}
      </nav>

      {/* COMPACT WEATHER */}
      <MobileWeatherWidget />

      {/* BLOG CAROUSEL */}
      <MobilePostsCarousel />

      {/* SEASONAL TIPS – horizontal swipe */}
      <motion.section
        className="py-6 bg-secondary/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="px-4 mb-3">
          <h2 className="text-lg font-bold text-foreground">Gartentipps im {new Date().toLocaleDateString('de-DE', { month: 'long' })}</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-2 scrollbar-hide">
          {seasonalTips.map((tip, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              variants={fadeUp}
              className="flex-shrink-0 w-[70vw] max-w-[260px] snap-start bg-card rounded-xl p-4 border border-border"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <span className="text-2xl block mb-2">{tip.emoji}</span>
              <p className="text-sm text-foreground/80 font-medium leading-relaxed">{tip.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* RECIPE SPOTLIGHT */}
      <motion.section
        className="py-6 px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg font-bold text-foreground mb-3">Mariannes Küchentipp</h2>
        <div className="bg-card rounded-xl p-4 border border-border" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-xl font-serif font-bold text-foreground mb-2">
            Ostfriesischer Kräuterquark
          </h3>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Mit Schnittlauch, Petersilie, Dill und Liebstöckel – dazu frisches Bauernbrot.
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span>⏱ 15 Min</span>
            <span>👤 4 Portionen</span>
            <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full font-medium">kinderleicht</span>
          </div>
          <Link
            to="/rezepte"
            className="inline-flex items-center bg-accent text-accent-foreground px-4 py-2 rounded-full font-medium text-sm hover:opacity-90 transition"
          >
            Rezepte entdecken
            <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </div>
      </motion.section>

      {/* LATEST COMMENTS */}
      <div className="[&_section]:py-6 [&_section]:px-0 [&_.max-w-4xl]:max-w-full [&_h2]:text-lg [&_h2]:px-4">
        <LatestCommentsSection />
      </div>

      {/* ABOUT MARIANNE */}
      <motion.section
        className="py-6 px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg font-bold text-foreground mb-3">Über mich</h2>
        <div className="bg-card rounded-xl p-4 border border-border" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex gap-3 mb-3">
            <img
              src={marianneImg}
              alt="Marianne"
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            />
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hier in Ostfriesland gärtnere ich seit über 20 Jahren. Was ich gelernt habe? Gärtnern ist kein Hexenwerk – man braucht die richtigen Tipps zur richtigen Zeit.
              </p>
            </div>
          </div>
          <Link
            to="/about"
            className="inline-flex items-center text-primary font-medium text-sm hover:gap-2.5 gap-1.5 transition-all"
          >
            Mehr über mich <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.section>

      {/* NEWSLETTER – placed after trust-building content */}
      <motion.section
        className="py-6 px-4 bg-secondary/30"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-card rounded-xl p-5 border border-border" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <span className="text-lg">🌱</span> Gartentipps direkt ins Postfach
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Jeden Monat saisonale Tipps – kostenlos & jederzeit abbestellbar.
          </p>
          <NewsletterSignup />
        </div>
      </motion.section>

      {/* COMMUNITY CTA */}
      <section className="px-4 py-8">
        <div className="bg-gradient-to-br from-primary/90 to-primary rounded-xl p-5 text-center text-primary-foreground">
          <h3 className="text-base font-semibold mb-2">
            Lass uns zusammen gärtnern!
          </h3>
          <p className="text-primary-foreground/80 mb-4 text-xs">
            Zeig mir deine Erfolge mit #mientuun!
          </p>
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-background text-foreground py-2.5 px-5 rounded-full font-medium text-sm shadow hover:scale-105 transition-all"
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
