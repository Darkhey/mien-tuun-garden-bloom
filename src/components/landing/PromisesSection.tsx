
import React from 'react';
import { CheckCircle, Heart, Flower } from 'lucide-react';

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

const PromisesSection: React.FC = () => {
  return (
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
  );
};

export default PromisesSection;
