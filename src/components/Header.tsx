
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '@/config/site.config';
import { Menu, X, Flower, Search } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'Rezepte', href: '/rezepte' },
    { name: 'Garten', href: '/garten' },
    { name: 'Über mich', href: '/about' },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-sage-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Flower className="h-8 w-8 text-sage-600 group-hover:text-sage-700 transition-colors" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full opacity-60"></div>
            </div>
            <span className="text-xl font-serif font-semibold text-earth-800 group-hover:text-earth-900 transition-colors">
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-earth-700 hover:text-sage-600 font-medium transition-colors relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sage-500 transition-all group-hover:w-full"></span>
              </Link>
            ))}
            
            <button className="p-2 text-earth-700 hover:text-sage-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-earth-700 hover:text-sage-600 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-sage-200 py-4">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-earth-700 hover:text-sage-600 font-medium px-3 py-2 rounded-lg hover:bg-sage-50 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
