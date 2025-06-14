
import React from "react";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Mail } from "lucide-react";

const NewsletterInlineCard: React.FC = () => (
  <div className="w-full max-w-xs sm:max-w-md bg-sage-100 border border-sage-300 rounded-2xl shadow flex flex-col sm:flex-row items-center gap-3 py-4 px-5">
    <div className="flex-shrink-0 bg-sage-200 rounded-full p-2">
      <Mail className="text-sage-700 w-6 h-6" />
    </div>
    <div className="flex-1 text-left">
      <div className="font-serif text-sage-800 text-base leading-tight mb-1">
        Jetzt Garten-Newsletter sichern!
      </div>
      <div className="text-sage-600 text-xs mb-1">
        Einmal im Monat Inspiration & Tipps. Kein Spam, jederzeit abbestellbar.
      </div>
      <NewsletterSignup compact />
    </div>
  </div>
);

export default NewsletterInlineCard;
