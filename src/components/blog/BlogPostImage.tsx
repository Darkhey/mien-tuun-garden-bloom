
import React from 'react';

type BlogPostImageProps = {
  src: string;
  alt: string;
};

const BlogPostImage: React.FC<BlogPostImageProps> = ({ src, alt }) => (
  <div className="mb-12">
    <img
      src={src}
      alt={alt}
      className="w-full h-96 object-cover rounded-xl shadow-lg"
    />
  </div>
);

export default BlogPostImage;
