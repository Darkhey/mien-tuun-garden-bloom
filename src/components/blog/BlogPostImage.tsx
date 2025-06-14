
import React, { useState } from 'react';

type BlogPostImageProps = {
  src: string;
  alt: string;
};
// Nutze Storage-Bucket für Blogbilder!
const SUPABASE_BLOG_IMG_URL = "https://ublbxvpmoccmegtwaslh.supabase.co/storage/v1/object/public/blog-images/";

const BlogPostImage: React.FC<BlogPostImageProps> = ({ src, alt }) => {
  const [imgError, setImgError] = useState(false);

  function getImageUrl(imagePath: string): string {
    if (!imagePath) return "/placeholder.svg";
    return SUPABASE_BLOG_IMG_URL + imagePath;
  }

  return (
    <div className="mb-12">
      <img
        src={imgError ? "/placeholder.svg" : getImageUrl(src)}
        alt={alt}
        className="w-full h-96 object-cover rounded-xl shadow-lg"
        onError={() => setImgError(true)}
      />
    </div>
  );
};

export default BlogPostImage;
