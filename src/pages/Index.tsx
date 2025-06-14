
import React from 'react';
import Layout from '@/components/Layout';
import { siteConfig } from '@/config/site.config';
import { Link } from 'react-router-dom';
import { ArrowRight, Flower, Calendar, User } from 'lucide-react';

// Mock Daten für die Demonstration
const featuredPosts = [
  {
    id: '1',
    slug: 'kraeutergarten-anlegen',
    title: 'Den perfekten Kräutergarten anlegen',
    excerpt: 'Schritt für Schritt zum eigenen Kräuterparadies - von der Planung bis zur ersten Ernte.',
    featuredImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
    category: 'Garten & Pflanzen',
    publishedAt: '2024-06-10',
    readingTime: 8,
    author: 'Anna'
  },
  {
    id: '2', 
    slug: 'saisonale-suppe-rezept',
    title: 'Herzhafte Kürbis-Ingwer-Suppe',
    excerpt: 'Wärmende Herbstsuppe mit frischen Kräutern aus dem eigenen Garten.',
    featuredImage: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&h=600&fit=crop',
    category: 'Saisonale Rezepte',
    publishedAt: '2024-06-08',
    readingTime: 5,
    author: 'Anna'
  },
  {
    id: '3',
    slug: 'nachhaltiges-gaertnern',
    title: 'Nachhaltig gärtnern ohne Chemie',
    excerpt: 'Natürliche Methoden für einen gesunden Garten und reiche Ernte.',
    featuredImage: 'https://images.unsplash.com/photo-1416943929109-1fce5dfb22e1?w=800&h=600&fit=crop',
    category: 'Nachhaltigkeit',
    publishedAt: '2024-06-05',
    readingTime: 12,
    author: 'Anna'
  }
];

const featuredRecipe = {
  id: '1',
  slug: 'zucchini-muffins',
  title: 'Saftige Zucchini-Muffins',
  description: 'Gesunde Muffins mit Zucchini aus dem eigenen Garten - perfekt für den Nachmittagskaffee.',
  image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&h=600&fit=crop',
  prepTime: 15,
  cookTime: 25,
  servings: 12,
  difficulty: 'einfach' as const
};

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sage-50 via-cream to-accent-50 py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 text-sage-300">
            <Flower className="w-full h-full rotate-12" />
          </div>
          <div className="absolute top-32 right-20 w-16 h-16 text-accent-300">
            <Flower className="w-full h-full -rotate-45" />
          </div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 text-sage-400">
            <Flower className="w-full h-full rotate-90" />
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-earth-800 mb-6 animate-fade-in">
            Willkommen in{' '}
            <span className="text-sage-600">{siteConfig.name}</span>
          </h1>
          <p className="text-xl md:text-2xl text-earth-600 mb-8 animate-slide-up">
            {siteConfig.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
            <Link
              to="/blog"
              className="bg-sage-600 text-white px-8 py-4 rounded-full font-medium hover:bg-sage-700 transition-all duration-300 hover:scale-105 flex items-center justify-center"
            >
              Entdecke den Blog
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/rezepte"
              className="bg-white text-sage-600 border-2 border-sage-200 px-8 py-4 rounded-full font-medium hover:border-sage-300 hover:bg-sage-50 transition-all duration-300 hover:scale-105"
            >
              Saisonale Rezepte
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Recipe Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-earth-800 mb-4">
              Rezept der Woche
            </h2>
            <p className="text-earth-600 text-lg">
              Frisch aus der saisonalen Küche
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-accent-50 to-sage-50 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-4">
                  {featuredRecipe.title}
                </h3>
                <p className="text-earth-600 mb-6 text-lg">
                  {featuredRecipe.description}
                </p>
                
                <div className="flex flex-wrap gap-6 mb-8 text-sm">
                  <div className="flex items-center text-earth-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {featuredRecipe.prepTime + featuredRecipe.cookTime} Min
                  </div>
                  <div className="flex items-center text-earth-600">
                    <User className="h-4 w-4 mr-2" />
                    {featuredRecipe.servings} Portionen
                  </div>
                  <div className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-xs font-medium">
                    {featuredRecipe.difficulty}
                  </div>
                </div>
                
                <Link
                  to={`/rezepte/${featuredRecipe.slug}`}
                  className="inline-flex items-center bg-earth-600 text-white px-6 py-3 rounded-full font-medium hover:bg-earth-700 transition-colors"
                >
                  Zum Rezept
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
              
              <div className="relative">
                <img
                  src={featuredRecipe.image}
                  alt={featuredRecipe.title}
                  className="w-full h-80 object-cover rounded-xl shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="py-16 px-4 bg-sage-25">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-earth-800 mb-4">
              Neueste Beiträge
            </h2>
            <p className="text-earth-600 text-lg">
              Inspiration für Garten und Küche
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPosts.map((post, index) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 text-earth-700 px-3 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-serif font-bold text-earth-800 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-earth-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-earth-500 mb-4">
                    <span>{new Date(post.publishedAt).toLocaleDateString('de-DE')}</span>
                    <span>{post.readingTime} Min Lesezeit</span>
                  </div>
                  
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sage-600 font-medium hover:text-sage-700 transition-colors"
                  >
                    Weiterlesen
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/blog"
              className="inline-flex items-center bg-sage-600 text-white px-8 py-4 rounded-full font-medium hover:bg-sage-700 transition-colors"
            >
              Alle Beiträge anzeigen
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-sage-600 to-earth-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Bleib auf dem Laufenden
          </h2>
          <p className="text-xl mb-8 text-sage-100">
            Erhalte saisonale Rezepte, Gartentipps und nachhaltige Ideen direkt in dein Postfach.
          </p>
          {siteConfig.social.newsletter ? (
            <a
              href={siteConfig.social.newsletter}
              className="inline-flex items-center bg-white text-sage-600 px-8 py-4 rounded-full font-medium hover:bg-sage-50 transition-colors"
            >
              Jetzt anmelden
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          ) : (
            <div className="bg-white/10 rounded-xl p-6 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Deine E-Mail-Adresse"
                className="w-full px-4 py-3 rounded-lg mb-4 text-earth-800"
              />
              <button className="w-full bg-accent-500 text-white py-3 rounded-lg font-medium hover:bg-accent-600 transition-colors">
                Anmelden
              </button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
