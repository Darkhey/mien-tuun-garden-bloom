import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";

const COOKIE_KEY = "mien-tuun-cookie-consent";

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = (all: boolean) => {
    localStorage.setItem(COOKIE_KEY, all ? "all" : "essential");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[70] p-4 bg-card border-t border-border shadow-xl"
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Cookie className="h-6 w-6 text-primary shrink-0 hidden sm:block" />
            <p className="text-sm text-muted-foreground flex-1">
              Wir verwenden Cookies, um dein Erlebnis zu verbessern.{" "}
              <Link to="/cookie-richtlinie" className="underline hover:text-primary">Mehr erfahren</Link>
            </p>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => accept(false)} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors">
                Nur notwendige
              </button>
              <button onClick={() => accept(true)} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Alle akzeptieren
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
