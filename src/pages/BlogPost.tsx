
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogPost = () => {
  const { slug } = useParams();
  
  // Mock Daten - später aus API
  const post = {
    title: 'Den perfekten Kräutergarten anlegen',
    content: `
      <p>Ein eigener Kräutergarten ist der Traum vieler Hobby-Köche und Gartenliebhaber. Frische Kräuter direkt vor der Haustür zu haben, bedeutet nicht nur aromatischere Gerichte, sondern auch die Gewissheit, was man zu sich nimmt.</p>
      
      <h2>Planung ist alles</h2>
      <p>Bevor Sie mit dem Anlegen beginnen, sollten Sie sich Gedanken über den Standort machen. Die meisten Kräuter bevorzugen einen sonnigen bis halbschattigen Platz mit durchlässigem Boden.</p>
      
      <h3>Die wichtigsten Faktoren:</h3>
      <ul>
        <li>Sonneneinstrahlung (mindestens 4-6 Stunden täglich)</li>
        <li>Windschutz</li>
        <li>Wasserzugang</li>
        <li>Qualität des Bodens</li>
      </ul>
      
      <h2>Die richtigen Kräuter wählen</h2>
      <p>Für Anfänger eignen sich besonders robuste und pflegeleichte Kräuter wie Basilikum, Petersilie, Schnittlauch und Rosmarin.</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=600&fit=crop',
    author: 'Anna',
    publishedAt: '2024-06-10',
    readingTime: 8,
    category: 'Garten & Pflanzen',
    tags: ['Kräuter', 'Garten', 'Anfänger', 'DIY']
  };

  return (
    <Layout title={`${post.title} - Blog`}>
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link
          to="/blog"
          className="inline-flex items-center text-sage-600 hover:text-sage-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Blog
        </Link>
      </div>

      {/* Hero */}
      <article className="max-w-4xl mx-auto px-4 pb-16">
        <header className="mb-8">
          <div className="mb-4">
            <span className="bg-sage-100 text-sage-700 px-3 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-earth-500 mb-8">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              {post.author}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(post.publishedAt).toLocaleDateString('de-DE')}
            </div>
            <span>{post.readingTime} Min Lesezeit</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-sage-50 text-sage-700 px-3 py-1 rounded-full text-sm"
              >
                <Tag className="h-3 w-3 inline mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-12">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none prose-earth prose-headings:font-serif prose-headings:text-earth-800 prose-p:text-earth-600 prose-li:text-earth-600 prose-strong:text-earth-800"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share Section */}
        <div className="mt-12 pt-8 border-t border-sage-200">
          <div className="bg-sage-50 rounded-xl p-6 text-center">
            <h3 className="text-xl font-serif font-bold text-earth-800 mb-4">
              Hat dir dieser Artikel gefallen?
            </h3>
            <p className="text-earth-600 mb-6">
              Teile ihn mit deinen Freunden und lass dich von weiteren Gartentipps inspirieren!
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-sage-600 text-white px-6 py-2 rounded-full hover:bg-sage-700 transition-colors">
                Bei Pinterest merken
              </button>
              <button className="bg-earth-600 text-white px-6 py-2 rounded-full hover:bg-earth-700 transition-colors">
                Auf Facebook teilen
              </button>
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default BlogPost;
