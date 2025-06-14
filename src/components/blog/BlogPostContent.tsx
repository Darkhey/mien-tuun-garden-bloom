
import React from 'react';

type BlogPostContentProps = {
  html: string;
};

const BlogPostContent: React.FC<BlogPostContentProps> = ({ html }) => (
  <div
    className="prose prose-lg max-w-none prose-earth prose-headings:font-serif prose-headings:text-earth-800 prose-p:text-earth-600 prose-li:text-earth-600 prose-strong:text-earth-800"
    dangerouslySetInnerHTML={{ __html: html }}
  />
);

export default BlogPostContent;
