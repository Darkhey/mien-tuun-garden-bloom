import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import BlogPostHeader from "@/components/blog/BlogPostHeader";
import BlogPostImage from "@/components/blog/BlogPostImage";
import BlogPostContent from "@/components/blog/BlogPostContent";
import BlogPostToRecipeSection from "@/components/blog/BlogPostToRecipeSection";
import BlogPostShareSection from "@/components/blog/BlogPostShareSection";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Hilfsfunktion zum Slugifizieren eines Strings (einfache deutsche Variante)
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

const BlogPost = () => {
  const { slug } = useParams();

  // Mock Blogdaten
  const post = {
    slug: slug || "kraeutergarten-anlegen",
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
      <article className="max-w-4xl mx-auto px-4 pb-16">
        <BlogPostHeader
          category={post.category}
          title={post.title}
          author={post.author}
          publishedAt={post.publishedAt}
          readingTime={post.readingTime}
          tags={post.tags}
        />
        <BlogPostImage src={post.featuredImage} alt={post.title} />
        <BlogPostContent html={post.content} />
        <BlogPostToRecipeSection post={post} />
        <BlogPostShareSection />
      </article>
    </Layout>
  );
};

export default BlogPost;
