import React from "react";

type BlogStructuredDataProps = {
  title: string;
  slug: string;
  publishedAt: string;
  author: string;
  averageRating?: number;
  ratingCount?: number;
  image?: string;
  description?: string;
  content?: string;
  category?: string;
  tags?: string[];
};

const BlogStructuredData: React.FC<BlogStructuredDataProps> = ({
  title,
  slug,
  publishedAt,
  author,
  averageRating,
  ratingCount,
  image,
  description,
  content,
  category,
  tags,
}) => {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    name: title,
    url: `https://mien-tuun.de/blog/${slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://mien-tuun.de/blog/${slug}`
    },
    datePublished: publishedAt,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "Mien Tuun",
      logo: {
        "@type": "ImageObject",
        url: "https://mien-tuun.de/logo.png"
      }
    }
  };

  // Add image if available
  if (image) {
    schema.image = {
      "@type": "ImageObject",
      url: image
    };
  }

  // Add description if available
  if (description) {
    schema.description = description;
  }

  // Add content if available (truncated for schema)
  if (content) {
    schema.articleBody = content.substring(0, 500) + (content.length > 500 ? '...' : '');
  }

  // Add category and keywords if available
  if (category) {
    schema.articleSection = category;
  }

  if (tags && tags.length > 0) {
    schema.keywords = tags.join(', ');
  }

  // Add ratings if available
  if (averageRating && ratingCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: averageRating,
      reviewCount: ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};

export default BlogStructuredData;