
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { siteConfig } from '@/config/site.config';
import { Menu, X, Flower, Search, LogOut, Shield } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import AuthDialog from "@/components/AuthDialog";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  // Check admin role whenever session changes
  useEffect(() => {
    const checkAdmin = async () => {
      if (session?.user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .single();
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
    navigate("/"); // Nach Logout zur Startseite leiten
  };

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
            {/* Auth Links */}
            {!session?.user && (
              <AuthDialog>
                <button
                  className="ml-4 px-4 py-2 rounded-lg bg-sage-100 text-sage-700 hover:bg-sage-200 font-medium transition-colors"
                >
                  Login/Registrieren
                </button>
              </AuthDialog>
            )}
            {session?.user && (
              <>
                <Link
                  to="/profil"
                  className="ml-4 px-4 py-2 rounded-lg bg-sage-100 text-sage-700 hover:bg-sage-200 font-medium transition-colors"
                >
                  Mein Profil
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="ml-2 px-3 py-2 rounded-lg bg-amber-200 text-amber-900 hover:bg-amber-300 font-medium transition-colors flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4 mr-1" /> Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-2 flex items-center gap-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg font-medium"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            )}
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
              {!session?.user && (
                <AuthDialog>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="mt-2 text-sage-700 bg-sage-100 hover:bg-sage-200 font-medium px-3 py-2 rounded-lg transition-colors w-full"
                  >
                    Login/Registrieren
                  </button>
                </AuthDialog>
              )}
              {session?.user && (
                <>
                  <Link
                    to="/profil"
                    onClick={() => setIsMenuOpen(false)}
                    className="mt-2 text-sage-700 bg-sage-100 hover:bg-sage-200 font-medium px-3 py-2 rounded-lg transition-colors"
                  >
                    Mein Profil
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="mt-2 text-amber-900 bg-amber-200 hover:bg-amber-300 font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Shield className="w-4 h-4 mr-1" /> Admin
                    </Link>
                  )}
                  <button
                    onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                    className="mt-2 text-red-700 bg-red-100 hover:bg-red-200 px-3 py-2 rounded-lg font-medium flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
