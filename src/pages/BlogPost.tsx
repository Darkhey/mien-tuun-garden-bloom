
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from '@/integrations/supabase/types';
import BlogStructuredData from "@/components/blog/BlogStructuredData";
import BlogPostContent from "@/components/blog/BlogPostContent";
import BlogPostShareSection from "@/components/blog/BlogPostShareSection";
import CallToActionSection from "@/components/blog/CallToActionSection";
import RelatedArticlesSection from "@/components/blog/RelatedArticlesSection";
import BlogComments from "@/components/blog/BlogComments";
import { useToast } from "@/hooks/use-toast";
import { generateUniqueSlug } from '@/utils/slugHelpers';
import BlogPodcastSection from '@/components/blog/BlogPodcastSection';
import { Calendar, User, Tag } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      if (!slug) throw new Error("Slug is required");
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      return data as Tables<'blog_posts'>;
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Lädt Artikel...</div>;
  }

  if (error || !post) {
    return <div className="text-center py-12">Artikel nicht gefunden.</div>;
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | Mien Tuun</title>
        <meta name="description" content={post.excerpt || post.description || ''} />
        <meta name="keywords" content={post.tags?.join(', ') || ''} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.description || ''} />
        <meta property="og:image" content={post.featured_image} />
        <meta property="og:type" content="article" />
        <meta property="article:author" content={post.author} />
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:section" content={post.category} />
        {post.tags?.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <link rel="canonical" href={`https://mien-tuun.de/blog/${post.slug}`} />
      </Helmet>

      <BlogStructuredData 
        title={post.title}
        description={post.excerpt}
        author={post.author}
        publishedAt={post.published_at}
        category={post.category}
        tags={post.tags}
        slug={post.slug}
      />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Blog Post Header */}
        <header className="mb-8">
          <div className="mb-4">
            <span className="bg-sage-100 text-sage-700 px-3 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-earth-500 mb-8">
            <div className="flex items-center"><User className="h-4 w-4 mr-2" />{post.author}</div>
            <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" />{new Date(post.published_at).toLocaleDateString('de-DE')}</div>
            <span>{post.reading_time} Min Lesezeit</span>
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
        
        <BlogPostContent content={post.content} />
        
        <BlogPostShareSection
          title={post.title}
          excerpt={post.excerpt}
        />
        
        {/* Podcast Section */}
        <BlogPodcastSection 
          blogPostId={post.id}
          blogTitle={post.title}
        />
        
        <CallToActionSection />
        
        <RelatedArticlesSection 
          currentSlug={post.slug}
          category={post.category}
          tags={post.tags}
        />
        
        <BlogComments 
          blogSlug={post.slug} 
          userId={user?.id || null}
        />
      </article>
    </>
  );
};

export default BlogPost;
