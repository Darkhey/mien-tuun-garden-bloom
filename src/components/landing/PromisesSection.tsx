import React from 'react';
import { CheckCircle, Heart, Flower } from 'lucide-react';

const promises = [
  {
    icon: CheckCircle,
    title: "Erprobte Tipps aus 20+ Jahren",
    description: "Keine Theorie – nur was wirklich funktioniert im norddeutschen Klima.",
    emoji: "🌿"
  },
  {
    icon: Heart,
    title: "Mit Herz & Verstand",
    description: "Authentische Ratschläge einer echten Gärtnerin, direkt aus dem Garten.",
    emoji: "💚"
  },
  {
    icon: Flower,
    title: "Saisonal & Regional",
    description: "Alles abgestimmt auf norddeutsches Wetter und unsere Böden.",
    emoji: "🌸"
  }
];

const PromisesSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-secondary/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Warum du mir vertrauen kannst
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Über zwei Jahrzehnte Erfahrung in Ostfrieslands Gärten – das merkt man.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {promises.map((promise, idx) => (
            <div
              key={idx}
              className="garden-card p-8 text-center space-y-4"
            >
              <div className="text-4xl mb-2">{promise.emoji}</div>
              <h3 className="text-xl font-bold text-foreground">{promise.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{promise.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromisesSection;
