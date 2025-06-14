
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Tag } from "lucide-react";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  publishedAt: string;
  readingTime: number;
  author: string;
  tags: string[];
};

interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => (
  <article className="bg-white rounded-2xl shadow group hover:shadow-lg transition-all duration-200 overflow-hidden">
    <Link to={`/blog/${post.slug}`}>
      <img src={post.featuredImage} alt={post.title} className="w-full h-56 object-cover" />
    </Link>
    <div className="p-5">
      <div className="flex items-center gap-2 mb-2 text-sm">
        <span className="text-sage-700">{post.category}</span>
        <span>·</span>
        <span className="text-sage-400 flex items-center gap-1">
          <Calendar className="h-4 w-4" /> {post.publishedAt}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-2 font-serif">
        <Link to={`/blog/${post.slug}`} className="hover:text-sage-700">{post.title}</Link>
      </h3>
      <p className="text-earth-600 mb-4 line-clamp-2">{post.excerpt}</p>
      <div className="flex gap-1 flex-wrap">
        {post.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="bg-sage-50 text-sage-700 px-2 py-1 rounded text-xs flex items-center gap-1">
            <Tag className="h-3 w-3" /> {tag}
          </span>
        ))}
      </div>
      <div className="text-xs text-sage-600 mt-2">von {post.author} · {post.readingTime} min</div>
    </div>
  </article>
);

export default BlogPostCard;
