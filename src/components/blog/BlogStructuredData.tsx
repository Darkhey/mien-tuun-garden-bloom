
import React from "react";

type BlogStructuredDataProps = {
  title: string;
  slug: string;
  publishedAt: string;
  author: string;
  averageRating?: number;
  ratingCount?: number;
};

const BlogStructuredData: React.FC<BlogStructuredDataProps> = ({
  title,
  slug,
  publishedAt,
  author,
  averageRating,
  ratingCount,
}) => {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    url: `https://mien-tuun.de/blog/${slug}`,
    datePublished: publishedAt,
    author: {
      "@type": "Person",
      name: author,
    },
  };

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
