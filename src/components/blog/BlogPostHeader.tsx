
import React from 'react';
import { Calendar, User, Tag } from 'lucide-react';

type BlogPostHeaderProps = {
  category: string;
  title: string;
  author: string;
  publishedAt: string;
  readingTime: number;
  tags: string[];
};

const BlogPostHeader: React.FC<BlogPostHeaderProps> = ({
  category,
  title,
  author,
  publishedAt,
  readingTime,
  tags,
}) => (
  <header className="mb-8">
    <div className="mb-4">
      <span className="bg-sage-100 text-sage-700 px-3 py-1 rounded-full text-sm font-medium">
        {category}
      </span>
    </div>
    <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6">{title}</h1>
    <div className="flex flex-wrap items-center gap-6 text-earth-500 mb-8">
      <div className="flex items-center"><User className="h-4 w-4 mr-2" />{author}</div>
      <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" />{new Date(publishedAt).toLocaleDateString('de-DE')}</div>
      <span>{readingTime} Min Lesezeit</span>
    </div>
    <div className="flex flex-wrap gap-2 mb-8">
      {tags.map((tag) => (
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
);

export default BlogPostHeader;
