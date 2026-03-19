import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/types/content";

interface BlogHeroCardProps {
  post: BlogPost;
}

const BlogHeroCard: React.FC<BlogHeroCardProps> = ({ post }) => {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block rounded-2xl overflow-hidden border border-border bg-card hover:shadow-2xl transition-all duration-500 mb-10"
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-3/5 overflow-hidden relative">
          <img
            src={post.featuredImage || "/placeholder.svg"}
            alt={post.title}
            className="w-full h-56 md:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
            loading="eager"
            width="720"
            height="320"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-md">
              ⭐ Neuester Artikel
            </span>
          </div>
        </div>
        <div className="p-6 md:p-8 flex flex-col justify-center md:w-2/5">
          <span className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">
            {post.category}
          </span>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-foreground group-hover:text-primary transition-colors mb-3 leading-tight">
            {post.title}
          </h2>
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed">
            {post.excerpt || ""}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.publishedAt).toLocaleDateString("de-DE")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime} min
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
            Jetzt lesen <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BlogHeroCard;
