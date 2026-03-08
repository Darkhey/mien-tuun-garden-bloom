import React, { useEffect, useMemo } from 'react';
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Sprout, Leaf, Sun, Droplets, ArrowRight, ExternalLink, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import ModularSowingCalendar from '@/components/sowing/ModularSowingCalendar';
import aussaatHero from '@/assets/aussaat-hero.jpg';
import muuttoPromo from '@/assets/muutto-promo.jpg';

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
];

const SEASONAL_TIPS: Record<string, { icon: React.ReactNode; tasks: string[]; color: string }> = {
  "Frühling": {
    icon: <Sprout className="h-6 w-6" />,
    tasks: ["Tomaten & Paprika vorziehen", "Kartoffeln setzen", "Kräuter aussäen", "Boden vorbereiten"],
    color: "from-green-50 to-emerald-50 border-green-200"
  },
  "Sommer": {
    icon: <Sun className="h-6 w-6" />,
    tasks: ["Regelmäßig gießen", "Beeren & Tomaten ernten", "Herbstgemüse aussäen", "Mulchen"],
    color: "from-yellow-50 to-amber-50 border-yellow-200"
  },
  "Herbst": {
    icon: <Leaf className="h-6 w-6" />,
    tasks: ["Wintergemüse pflanzen", "Erntereste kompostieren", "Beete winterfest machen", "Zwiebeln stecken"],
    color: "from-orange-50 to-amber-50 border-orange-200"
  },
  "Winter": {
    icon: <Droplets className="h-6 w-6" />,
    tasks: ["Saatgut bestellen", "Gartenplanung machen", "Werkzeuge pflegen", "Erste Voranzucht ab Feb"],
    color: "from-blue-50 to-slate-50 border-blue-200"
  }
};

const AussaatkalenderPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentMonth = new Date().getMonth();
  const currentSeason = useMemo(() => {
    if (currentMonth >= 2 && currentMonth <= 4) return "Frühling";
    if (currentMonth >= 5 && currentMonth <= 7) return "Sommer";
    if (currentMonth >= 8 && currentMonth <= 10) return "Herbst";
    return "Winter";
  }, [currentMonth]);

  const seasonData = SEASONAL_TIPS[currentSeason];

  return (
    <>
      <Helmet>
        <title>Interaktiver Aussaatkalender 2026 | Mien Tuun</title>
        <meta name="description" content="Interaktiver Aussaatkalender mit Beetnachbar-Finder, Pflanztipps und Saatgut-Datenbank. Finde den perfekten Zeitpunkt für Aussaat, Pflanzung und Ernte." />
        <meta name="keywords" content="Aussaatkalender, Gartenplanung, Saatkalender, Pflanzzeit, Beetnachbarn, Mischkultur" />
      </Helmet>

      {/* Hero Section with Background Image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={aussaatHero} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-earth-900/80 via-earth-900/60 to-earth-900/40" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6">
              <Calendar className="h-4 w-4" />
              Aktualisiert für {MONTH_NAMES[currentMonth]} 2026
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              Dein interaktiver<br />
              <span className="text-accent-300">Aussaatkalender</span>
            </h1>
            <p className="text-lg md:text-xl text-white/85 mb-8 leading-relaxed">
              Finde den perfekten Zeitpunkt für Aussaat, Pflanzung und Ernte. 
              Mit Beetnachbar-Finder, Anbautipps und über 50 Pflanzen in unserer Datenbank.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#kalender" className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl">
                <Sprout className="h-5 w-5" />
                Zum Kalender
              </a>
              <a href="#was-jetzt" className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium transition-all">
                Was jetzt säen?
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Current Season Quick Guide */}
      <section id="was-jetzt" className="py-12 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
              Was steht im {currentSeason} an?
            </h2>
            <p className="text-muted-foreground">
              Deine wichtigsten Aufgaben für {MONTH_NAMES[currentMonth]}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {seasonData.tasks.map((task, i) => (
              <Card key={i} className={`bg-gradient-to-br ${seasonData.color} border hover:shadow-md transition-shadow`}>
                <CardContent className="p-5 flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 text-sage-600">
                    {i === 0 ? <Sprout className="h-5 w-5" /> :
                     i === 1 ? <Sun className="h-5 w-5" /> :
                     i === 2 ? <Leaf className="h-5 w-5" /> :
                     <Droplets className="h-5 w-5" />}
                  </div>
                  <p className="text-sm font-medium text-earth-800">{task}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Current Month Highlight */}
          <Card className="bg-gradient-to-r from-sage-50 to-accent-50 border-sage-200">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0 w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-sage-700">{currentMonth + 1}</div>
                    <div className="text-xs text-sage-500 uppercase tracking-wider">{MONTH_NAMES[currentMonth].slice(0, 3)}</div>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-serif font-bold text-earth-800 mb-2">
                    Mariannes Tipp für {MONTH_NAMES[currentMonth]}
                  </h3>
                  <p className="text-earth-600 leading-relaxed">
                    {currentSeason === "Frühling" && "Moin moin! Jetzt ist die beste Zeit, um Tomaten auf der Fensterbank vorzuziehen. Ab Mitte des Monats können robuste Gemüsesorten wie Radieschen und Spinat direkt ins Freiland."}
                    {currentSeason === "Sommer" && "Moin moin! Vergiss nicht, regelmäßig zu gießen – am besten morgens oder abends. Ernte dein Gemüse regelmäßig, das fördert neues Wachstum!"}
                    {currentSeason === "Herbst" && "Moin moin! Jetzt Wintergemüse wie Grünkohl und Feldsalat setzen. Die letzten Tomaten nachreifen lassen und Beete winterfest machen."}
                    {currentSeason === "Winter" && "Moin moin! Zeit für die Gartenplanung! Bestelle schon jetzt dein Saatgut und plane deine Beete. Ab Februar geht es mit der Voranzucht los."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Calendar */}
      <section id="kalender" className="py-12 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <ModularSowingCalendar />
        </div>
      </section>

      {/* MUUTTO Cross-Promotion */}
      <section className="py-12 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="grid md:grid-cols-2">
              <div className="relative">
                <img 
                  src={muuttoPromo} 
                  alt="MUUTTO - Dein smarter Umzugshelfer" 
                  className="w-full h-full object-cover min-h-[280px]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 md:bg-gradient-to-l md:from-white/20 md:to-transparent" />
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold mb-4 w-fit">
                  <Package className="h-3.5 w-3.5" />
                  UNSER SCHWESTERPROJEKT
                </div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-3">
                  MUUTTO – Dein smarter Umzugshelfer
                </h3>
                <p className="text-earth-600 mb-4 leading-relaxed">
                  Du planst einen Umzug? Unser Schwesterprojekt MUUTTO hilft dir, den Überblick über alle Umzugskartons zu behalten. 
                  Mit KI-gestützter Inhalterkennung, Haushaltsverwaltung und cleverer Organisation wird dein Umzug stressfrei.
                </p>
                <ul className="text-sm text-earth-600 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    Kartons fotografieren & KI erkennt den Inhalt
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    Räume, Regale & Standorte verwalten
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    Gemeinsam mit dem Haushalt organisieren
                  </li>
                </ul>
                <a 
                  href="https://muutto.lovable.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl w-fit"
                >
                  MUUTTO entdecken
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Blog CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-sage-50 to-accent-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-4">
            Noch mehr Gartenwissen entdecken
          </h2>
          <p className="text-lg text-earth-600 mb-8 max-w-2xl mx-auto">
            In unserem Blog findest du saisonale Tipps, Rezepte mit Zutaten aus dem eigenen Garten 
            und Mariannes persönliche Gartengeschichten.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-sage-600 hover:bg-sage-700 rounded-full px-8">
              <Link to="/blog">
                <Leaf className="h-5 w-5 mr-2" />
                Zum Blog
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8">
              <Link to="/rezepte">
                Saisonale Rezepte
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default AussaatkalenderPage;
