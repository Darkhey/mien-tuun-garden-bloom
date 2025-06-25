import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from '@/integrations/supabase/types';
import type { BlogPost } from '@/types/content';
import BlogStructuredData from "@/components/blog/BlogStructuredData";
import BlogPostHeader from "@/components/blog/BlogPostHeader";
import BlogPostContent from "@/components/blog/BlogPostContent";
import BlogPostShareSection from "@/components/blog/BlogPostShareSection";
import CallToActionSection from "@/components/blog/CallToActionSection";
import RelatedArticlesSection from "@/components/blog/RelatedArticlesSection";
import BlogComments from "@/components/blog/BlogComments";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from '@/types/Recipe';
import { generateUniqueSlug } from '@/utils/slugHelpers';
import BlogPodcastSection from '@/components/blog/BlogPodcastSection';

interface RouteParams {
  slug: string;
}

const BlogPost = () => {
  const { slug } = useParams<RouteParams>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [relatedRecipe, setRelatedRecipe] = useState<Recipe | null>(null);
  const [showRecipeCreateButton, setShowRecipeCreateButton] = useState(false);
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);

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

  useEffect(() => {
    if (post?.id) {
      fetchRelatedRecipe(post.id);
    }
  }, [post?.id]);

  const fetchRelatedRecipe = async (blogPostId: string) => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('blog_post_id', blogPostId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching related recipe:", error);
        throw error;
      }

      if (data) {
        setRelatedRecipe(data as Recipe);
      } else {
        setShowRecipeCreateButton(true);
      }
    } catch (error) {
      console.error("Error fetching related recipe:", error);
    }
  };

  const handleRecipeCreate = async () => {
    setIsCreatingRecipe(true);
    try {
      if (!post) throw new Error("Blog post data is not available.");

      const baseTitle = `Rezept passend zum Artikel "${post.title}"`;
      const uniqueSlug = await generateUniqueSlug(baseTitle);

      const newRecipe = {
        title: baseTitle,
        slug: uniqueSlug,
        blog_post_id: post.id,
        status: 'draft',
        description: `Automatisches Rezept für Blog-Post "${post.title}"`,
        category: post.category || 'Sonstiges',
        prep_time: 15,
        cook_time: 30,
        total_time: 45,
        servings: 4,
        ingredients: ['Zutaten...'],
        instructions: ['Anleitung...'],
        notes: ['Notizen...'],
        images: [],
        user_id: post.user_id,
      };

      const { data, error } = await supabase
        .from('recipes')
        .insert([newRecipe])
        .select()
        .single();

      if (error) {
        console.error("Error creating recipe:", error);
        throw error;
      }

      toast({
        title: "Rezept erstellt!",
        description: `Neues Rezept "${newRecipe.title}" wurde als Entwurf erstellt.`,
      });

      setRelatedRecipe(data as Recipe);
      setShowRecipeCreateButton(false);
      navigate(`/admin/recipes/${data.id}`);
    } catch (error: any) {
      console.error("Error creating recipe:", error);
      toast({
        title: "Fehler beim Erstellen des Rezepts",
        description: error.message || "Ein Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRecipe(false);
    }
  };

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
        <meta property="og:image" content={post.featuredImage} />
        <meta property="og:type" content="article" />
        <meta property="article:author" content={post.author} />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:section" content={post.category} />
        {post.tags?.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <link rel="canonical" href={`https://mien-tuun.de/blog/${post.slug}`} />
      </Helmet>

      <BlogStructuredData post={post} />

      <article className="max-w-4xl mx-auto px-4 py-8">
        <BlogPostHeader 
          post={post} 
          relatedRecipe={relatedRecipe}
          showRecipeCreateButton={showRecipeCreateButton}
          onRecipeCreate={handleRecipeCreate}
          isCreatingRecipe={isCreatingRecipe}
        />
        
        <BlogPostContent content={post.content} />
        
        <BlogPostShareSection post={post} />
        
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
        
        <BlogComments blogSlug={post.slug} />
      </article>
    </>
  );
};

export default BlogPost;
