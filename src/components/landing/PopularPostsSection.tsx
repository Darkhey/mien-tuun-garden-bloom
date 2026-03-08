import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight } from "lucide-react";

const PopularPostsSection: React.FC = () => {
  const { data: posts } = useQuery({
    queryKey: ["popular-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("title, slug, category, featured_image, reading_time")
        .eq("published", true)
        .eq("featured", true)
        .order("published_at", { ascending: false })
        .limit(4);
      return data || [];
    },
    staleTime: 15 * 60 * 1000,
  });

  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Beliebte Artikel</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={post.featured_image || "/placeholder.svg"}
                  alt={post.title}
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                  #{i + 1}
                </span>
              </div>
              <div className="p-4">
                <span className="text-xs text-muted-foreground">{post.category} · {post.reading_time} min</span>
                <h3 className="text-sm font-semibold mt-1 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
            Alle Artikel ansehen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularPostsSection;
