import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const seasonalTips = [
  { emoji: "🌱", text: "Jetzt aussäen: Radieschen und Spinat vertragen noch Kälte – mein Geheimtipp für frühe Ernte!" },
  { emoji: "🌸", text: "Rosen schneiden: In Ostfriesland warte ich bis nach den Eisheiligen – sicher ist sicher!" },
  { emoji: "🍓", text: "Erdbeer-Zeit: Stroh unterlegen gegen Schnecken und für saubere Früchte." },
  { emoji: "🌿", text: "Wildkräuter sammeln: Giersch und Brennnessel sind perfekt für grüne Smoothies." },
  { emoji: "🦋", text: "Blumenwiese anlegen: Kornblumen und Mohn – ein Paradies für Insekten!" }
];

const SeasonalTipsSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 text-center">
          Mariannes aktuelle Gartentipps
        </h2>
        <p className="text-center text-muted-foreground mb-10 text-lg">
          Frisch aus meinem Garten – das mache ich gerade:
        </p>
        <ul className="grid md:grid-cols-2 gap-5">
          {seasonalTips.map((tip, idx) => (
            <li
              key={idx}
              className="garden-card p-6 flex items-start gap-4 animate-fade-in"
              style={{ animationDelay: `${0.08 * idx}s` }}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{tip.emoji}</span>
              <span className="text-foreground/80 font-medium leading-relaxed">{tip.text}</span>
            </li>
          ))}
        </ul>
        <div className="text-center mt-12">
          <Link
            to="/blog"
            className="inline-flex items-center bg-accent text-accent-foreground px-8 py-4 rounded-full font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.03]"
          >
            Alle Gartentipps im Blog <ArrowRight className="ml-3 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SeasonalTipsSection;
