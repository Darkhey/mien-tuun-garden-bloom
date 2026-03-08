import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sprout } from "lucide-react";
import NewsletterSignup from "./NewsletterSignup";

const EXIT_KEY = "mien-tuun-exit-shown";

const ExitIntentPopup: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || "ontouchstart" in window) return;
    const shown = sessionStorage.getItem(EXIT_KEY);
    if (shown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        sessionStorage.setItem(EXIT_KEY, "1");
        setVisible(true);
      }
    };
    // Wait 30s before enabling
    const t = setTimeout(() => document.addEventListener("mouseleave", handleMouseLeave), 30000);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setVisible(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setVisible(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <div className="text-center mb-6">
              <Sprout className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-serif font-bold text-foreground mb-2">Warte – bevor du gehst!</h3>
              <p className="text-sm text-muted-foreground">Erhalte wöchentlich Gartentipps, saisonale Rezepte und Inspiration direkt in dein Postfach. 🌱</p>
            </div>
            <NewsletterSignup />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
