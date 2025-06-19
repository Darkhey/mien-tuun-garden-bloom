import React from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

const SowingCalendarFlag: React.FC = () => {
  return (
    <Link
      to="/aussaatkalender"
      className="fixed z-40 right-4 bottom-4 flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-br from-green-200 via-green-100 to-green-50 border-2 border-green-300 shadow-md hover:shadow-lg transition-all duration-200 group"
      aria-label="Zum Aussaatkalender"
    >
      <Calendar className="w-5 h-5 text-green-600" />
      <span className="font-serif text-sage-900 text-base whitespace-nowrap">
        Aussaatkalender
      </span>
      <span className="absolute -top-2 -right-2 bg-accent-200 text-accent-800 text-xs px-1.5 py-0.5 rounded-full">
        Beta
      </span>
    </Link>
  );
};

export default SowingCalendarFlag;