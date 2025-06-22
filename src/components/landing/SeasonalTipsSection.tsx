
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const seasonalTips = [
  "🌱 Jetzt aussäen: Radieschen und Spinat vertragen noch Kälte - mein Geheimtipp für frühe Ernte!",
  "🌸 Rosen schneiden: In Ostfriesland warte ich bis nach den Eisheiligen - sicher ist sicher!",
  "🍓 Erdbeer-Zeit: Stroh unterlegen gegen Schnecken und für saubere Früchte - alte Gärtnerweisheit!",
  "🌿 Wildkräuter sammeln: Giersch und Brennnessel sind jetzt perfekt für grüne Smoothies",
  "🦋 Blumenwiese anlegen: Kornblumen und Mohn - so wird dein Garten zum Paradies für Insekten"
];

const SeasonalTipsSection: React.FC = () => {
  return (
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
  );
};

export default SeasonalTipsSection;
