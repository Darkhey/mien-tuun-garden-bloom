import React from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '@/config/site.config';
import { Flower, Heart } from 'lucide-react';
import NewsletterSignup from "./NewsletterSignup";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-earth-50 border-t border-sage-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Flower className="h-8 w-8 text-sage-600" />
              <span className="text-xl font-serif font-semibold text-earth-800">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-earth-600 mb-6 max-w-md">
              {siteConfig.description}
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {siteConfig.social.instagram && (
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center text-sage-600 hover:bg-sage-200 transition-colors"
                  aria-label="Instagram"
                >
                  📷
                </a>
              )}
              {siteConfig.social.pinterest && (
                <a
                  href={siteConfig.social.pinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center text-sage-600 hover:bg-sage-200 transition-colors"
                  aria-label="Pinterest"
                >
                  📌
                </a>
              )}
              {siteConfig.social.email && (
                <a
                  href={`mailto:${siteConfig.social.email}`}
                  className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center text-sage-600 hover:bg-sage-200 transition-colors"
                  aria-label="E-Mail"
                >
                  ✉️
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-earth-800 mb-4">Schnelle Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/blog" className="text-earth-600 hover:text-sage-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/rezepte" className="text-earth-600 hover:text-sage-600 transition-colors">
                  Rezepte
                </Link>
              </li>
              <li>
                <Link to="/garten" className="text-earth-600 hover:text-sage-600 transition-colors">
                  Gartentipps
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-earth-600 hover:text-sage-600 transition-colors">
                  Über mich
                </Link>
              </li>
              <li>
                <Link to="/kontakt" className="text-earth-600 hover:text-sage-600 transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link to="/links" className="text-earth-600 hover:text-sage-600 transition-colors">
                  Link-Übersicht
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-earth-800 mb-4">Newsletter</h3>
            <p className="text-earth-600 text-sm mb-4">
              Erhalte saisonale Rezepte und Gartentipps direkt in dein Postfach.
            </p>
            <NewsletterSignup compact />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-sage-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-earth-600 text-sm flex items-center">
            © {currentYear} {siteConfig.name}. Gemacht mit 
            <Heart className="h-4 w-4 text-rose-500 mx-1" />
            für nachhaltiges Leben.
          </p>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/datenschutz" className="text-earth-600 hover:text-sage-600 text-sm transition-colors">
              Datenschutz
            </Link>
            <Link to="/impressum" className="text-earth-600 hover:text-sage-600 text-sm transition-colors">
              Impressum
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
