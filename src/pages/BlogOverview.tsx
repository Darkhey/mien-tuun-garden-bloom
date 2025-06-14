
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { siteConfig } from '@/config/site.config';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Calendar, User, Tag } from 'lucide-react';

// Mock Daten - später aus API/CMS
const blogPosts = [
  {
    id: '1',
    slug: 'kraeutergarten-anlegen',
    title: 'Den perfekten Kräutergarten anlegen',
    excerpt: 'Schritt für Schritt zum eigenen Kräuterparadies - von der Planung bis zur ersten Ernte. Mit praktischen Tipps für Balkon und Garten.',
    featuredImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
    category: 'Garten & Pflanzen',
    publishedAt: '2024-06-10',
    readingTime: 8,
    author: 'Anna',
    tags: ['Kräuter', 'Garten', 'Anfänger', 'DIY'],
    featured: true
  },
  {
    id: '2',
    slug: 'saisonale-suppe-rezept',
    title: 'Herzhafte Kürbis-Ingwer-Suppe',
    excerpt: 'Wärmende Herbstsuppe mit frischen Kräutern aus dem eigenen Garten. Perfekt für kalte Tage und voller gesunder Zutaten.',
    featuredImage: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&h=600&fit=crop',
    category: 'Saisonale Rezepte',
    publishedAt: '2024-06-08',
    readingTime: 5,
    author: 'Anna',
    tags: ['Kürbis', 'Suppe', 'Herbst', 'Gesund'],
    featured: false
  },
  {
    id: '3',
    slug: 'nachhaltiges-gaertnern',
    title: 'Nachhaltig gärtnern ohne Chemie',
    excerpt: 'Natürliche Methoden für einen gesunden Garten und reiche Ernte. Entdecke umweltfreundliche Alternativen zu chemischen Düngemitteln.',
    featuredImage: 'https://images.unsplash.com/photo-1416943929109-1fce5dfb22e1?w=800&h=600&fit=crop',
    category: 'Nachhaltigkeit',
    publishedAt: '2024-06-05',
    readingTime: 12,
    author: 'Anna',
    tags: ['Nachhaltigkeit', 'Bio', 'Umwelt', 'Tipps'],
    featured: true
  },
  {
    id: '4',
    slug: 'kompost-anlegen-tipps',
    title: 'Kompost richtig anlegen - so geht\'s',
    excerpt: 'Verwandle Küchenabfälle in wertvollen Humus. Eine Anleitung für Kompost-Einsteiger mit allen wichtigen Tipps.',
    featuredImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
    category: 'Nachhaltigkeit',
    publishedAt: '2024-06-01',
    readingTime: 10,
    author: 'Anna',
    tags: ['Kompost', 'Zero Waste', 'Garten', 'DIY'],
    featured: false
  }
];

const BlogOverview = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Alle', ...siteConfig.categories];
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'Alle' || post.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <Layout title={`Blog - ${siteConfig.title}`}>
      {/* Header */}
      <section className="bg-gradient-to-br from-sage-50 to-accent-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6">
            Garten & Küche Blog
          </h1>
          <p className="text-xl text-earth-600 mb-8">
            Entdecke saisonale Rezepte, nachhaltige Gartentipps und Inspiration für ein bewusstes Leben
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Artikel durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-sage-200 rounded-full focus:ring-2 focus:ring-sage-300 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 bg-white border-b border-sage-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-sage-600 text-white'
                    : 'bg-sage-50 text-sage-700 hover:bg-sage-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-16 px-4 bg-gradient-to-r from-accent-50 to-sage-50">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative">
                  <img
                    src={featuredPost.featuredImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover min-h-80"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-accent-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Featured
                    </span>
                  </div>
                </div>
                
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="mb-4">
                    <span className="text-sage-600 text-sm font-medium">
                      {featuredPost.category}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-earth-800 mb-4">
                    {featuredPost.title}
                  </h2>
                  
                  <p className="text-earth-600 text-lg mb-6">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex items-center text-sm text-earth-500 mb-6">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="mr-4">
                      {new Date(featuredPost.publishedAt).toLocaleDateString('de-DE')}
                    </span>
                    <User className="h-4 w-4 mr-2" />
                    <span className="mr-4">{featuredPost.author}</span>
                    <span>{featuredPost.readingTime} Min Lesezeit</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-sage-100 text-sage-700 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <Link
                    to={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center bg-sage-600 text-white px-6 py-3 rounded-full font-medium hover:bg-sage-700 transition-colors w-fit"
                  >
                    Artikel lesen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Regular Posts Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {regularPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post, index) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-in"
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
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-sage-50 text-sage-700 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-earth-500 mb-4">
                      <span>{new Date(post.publishedAt).toLocaleDateString('de-DE')}</span>
                      <span>{post.readingTime} Min</span>
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
          ) : (
            <div className="text-center py-12">
              <p className="text-earth-500 text-lg">
                Keine Artikel gefunden. Versuche eine andere Kategorie oder Suchbegriff.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BlogOverview;
