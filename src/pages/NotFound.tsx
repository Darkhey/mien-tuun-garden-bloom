import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Flower } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-br from-sage-50 via-cream to-accent-50">
      <Flower className="h-12 w-12 text-sage-600 mb-6" />
      <h1 className="text-5xl font-serif font-bold text-earth-800 mb-4">404 - Seite nicht gefunden</h1>
      <p className="text-earth-600 mb-6">Hier wächst leider nichts. Vielleicht hast du dich im Garten verirrt?</p>
      <p className="text-earth-600 mb-4 font-medium">Stöber doch in diesen Beeten:</p>
      <ul className="space-y-2">
        <li>
          <Link to="/" className="text-primary hover:underline">
            Startseite
          </Link>
        </li>
        <li>
          <Link to="/blog" className="text-primary hover:underline">
            Blog
          </Link>
        </li>
        <li>
          <Link to="/aussaatkalender" className="text-primary hover:underline">
            Aussaatkalender
          </Link>
        </li>
        <li>
          <Link to="/kontakt" className="text-primary hover:underline">
            Kontakt
          </Link>
        </li>
      </ul>
      <p className="mt-8 text-sm text-sage-500">Keine Sorge, wir jäten das Unkraut und pflanzen hier bald etwas Neues.</p>
    </section>
  );
};

export default NotFound;
