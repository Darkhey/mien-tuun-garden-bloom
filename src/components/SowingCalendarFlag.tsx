
import React, { useState } from "react";
import SowingCalendar from "./admin/SowingCalendar";
import { Flag } from "lucide-react";

const SowingCalendarFlag: React.FC = () => {
  const [open, setOpen] = useState(false);

  // Mobil und Desktop responsive, Button immer sichtbar rechts unten, Overlay fixiert
  return (
    <>
      {/* Das süße Flaggen-Label */}
      <button
        type="button"
        className="
          fixed z-40 right-4 bottom-4 flex flex-col items-center group
          focus:outline-none
        "
        aria-label="Aussaatkalender öffnen"
        onClick={() => setOpen(true)}
      >
        <span className="relative flex flex-col items-center">
          {/* Flaggen-Stiel */}
          <span
            className="h-12 w-1 bg-sage-400 rounded-full"
            style={{ marginBottom: -8 }}
          ></span>
          {/* Flagge selbst */}
          <span
            className="
              flex items-center gap-2 px-3 py-1.5 rounded-lg
              bg-gradient-to-br from-green-200 via-green-100 to-green-50
              border-2 border-green-300
              shadow-md
              -rotate-6 transition-transform group-hover:scale-105 group-hover:-rotate-3
              font-serif text-sage-900 text-base
              whitespace-nowrap
            "
          >
            <Flag className="w-5 h-5 text-green-600 mr-1" />
            Aussaatkalender
          </span>
        </span>
      </button>
      {/* Overlay-Popover für den Kalender */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end sm:items-center sm:justify-center bg-black/20"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl p-4 shadow-2xl w-full max-w-lg mx-auto m-4 border border-green-200"
            style={{ maxHeight: "80vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}
          >
            {/* X zum Schließen */}
            <button
              type="button"
              aria-label="Schließen"
              className="absolute right-3 top-3 text-sage-400 hover:text-sage-700 font-bold text-xl"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <SowingCalendar />
          </div>
        </div>
      )}
    </>
  );
};

export default SowingCalendarFlag;
