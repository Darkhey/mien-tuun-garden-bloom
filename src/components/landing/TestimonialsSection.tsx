
import React from 'react';
import { Star } from 'lucide-react';

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

const TestimonialsSection: React.FC = () => {
  return (
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
  );
};

export default TestimonialsSection;
