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
    <>
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-br from-sage-50 via-cream to-accent-50">
        <Flower className="h-12 w-12 text-sage-600 mb-6" />
        <h1 className="text-5xl font-serif font-bold text-earth-800 mb-4">404 - Seite nicht gefunden</h1>
        <p className="text-earth-600 mb-6 max-w-md mx-auto">Hier wächst leider nichts. Vielleicht hast du dich im Garten verirrt? Nutze einfach die Suche (Cmd+K) oder stöbere in unseren Beeten:</p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link to="/" className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors font-medium">
            Zur Startseite
          </Link>
          <Link to="/blog" className="px-6 py-2 bg-white border-2 border-primary text-primary rounded-full hover:bg-sage-50 transition-colors font-medium">
            Zum Blog
          </Link>
        </div>
      </section>
      
      {/* Show popular posts so the user has somewhere interesting to go */}
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-serif font-bold text-earth-800 mb-8 text-center">Das könnte dich auch interessieren</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/blog/hochbeet-anlegen-guide" className="group block">
              <div className="rounded-xl overflow-hidden mb-4 border border-sage-200">
                <img src="/placeholder.svg" alt="Hochbeet" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="font-serif font-bold text-lg text-earth-800 group-hover:text-primary transition-colors">Hochbeet anlegen: Der ultimative Guide</h3>
            </Link>
            <Link to="/aussaatkalender" className="group block">
              <div className="rounded-xl overflow-hidden mb-4 border border-sage-200">
                <img src="/placeholder.svg" alt="Aussaat" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="font-serif font-bold text-lg text-earth-800 group-hover:text-primary transition-colors">Aussaatkalender: Wann was pflanzen?</h3>
            </Link>
            <Link to="/rezepte" className="group block">
              <div className="rounded-xl overflow-hidden mb-4 border border-sage-200">
                <img src="/placeholder.svg" alt="Rezepte" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="font-serif font-bold text-lg text-earth-800 group-hover:text-primary transition-colors">Saisonale Rezepte entdecken</h3>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
