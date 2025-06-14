import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { siteConfig } from '@/config/site.config';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Calendar, User, Tag } from 'lucide-react';
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogFilter from "@/components/blog/BlogFilter";

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

  // Es gibt keine Blogdaten (liste leer)
  const filteredPosts: any[] = [];
  const featuredPost = null;
  const regularPosts: any[] = [];

  return (
    <Layout title={`Blog - ${siteConfig.title}`}>
      <section className="bg-gradient-to-br from-sage-50 to-accent-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6">
            Garten & Küche Blog
          </h1>
          <p className="text-xl text-earth-600 mb-8">
            Entdecke saisonale Rezepte, nachhaltige Gartentipps und Inspiration für ein bewusstes Leben
          </p>
          {/* Search & Kategorie-Filter ausgelagert */}
          <BlogFilter
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </section>
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {filteredPosts.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <BlogPostCard post={post} key={post.id} />
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
