/**
 * Hilfsfunktionen zur Generierung von Blogpost-Slug und SEO-Metadaten.
 * - Schneidet Sonderzeichen, numeriert Slugs bei Bedarf hoch, normalisiert Umlaute
 * - Kürzt Meta-Description sinnvoll
 */

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')        // Sonderzeichen entfernen
    .replace(/\s+/g, '-')                // Leerzeichen zu Bindestrich
    .replace(/-+/g, '-')                 // Mehrfache Bindestriche reduzieren
    .replace(/^-+|-+$/g, '');            // Am Anfang/Ende entfernen
}

export function generateMetaTitle(title: string, siteName = "Mien Tuun"): string {
  if (title.toLowerCase().includes(siteName.toLowerCase())) {
    return title;
  }
  return `${title} | ${siteName}`;
}

export function generateMetaDescription(content: string, excerpt = '', maxLength = 156): string {
  let text = excerpt || '';
  if (!text) {
    // Aus Content die ersten 1-2 Sätze oder Wörter nehmen
    text = (content.replace(/<[^>]*>?/gm, '') || '').split('.').slice(0,2).join('.').trim();
  }
  if (text.length > maxLength) {
    text = text.slice(0, maxLength-1).trim() + '…';
  }
  return text;
}

/**
 * Generiert Standard-Metatags für den Blogpost (SEO & OpenGraph)
 */
export function getBlogPostMeta({
  title,
  content,
  excerpt,
  featuredImage,
  slug,
  seo = {},
  siteName = "Mien Tuun",
  urlBase = "https://mien-tuun.de"
}: {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  slug: string;
  seo?: any;
  siteName?: string;
  urlBase?: string;
}) {
  return {
    title: generateMetaTitle(title, siteName),
    description: generateMetaDescription(content, excerpt),
    keywords: Array.isArray(seo.keywords) ? seo.keywords : [],
    ogTitle: generateMetaTitle(title, siteName),
    ogDescription: generateMetaDescription(content, excerpt, 160),
    ogImage: featuredImage || '/images/og-default.jpg',
    ogUrl: `${urlBase}/blog/${slug}`,
    twitterCard: 'summary_large_image',
    canonicalUrl: `${urlBase}/blog/${slug}`,
    author: seo.author || "Mien Tuun",
    language: "de",
    revisitAfter: "7 days",
    robots: "index, follow"
  };
}

/**
 * Generiert Schema.org JSON-LD für Blogposts
 */
export function generateStructuredData({
  title,
  description,
  author,
  publishedAt,
  updatedAt,
  featuredImage,
  slug,
  category,
  tags,
  siteName = "Mien Tuun",
  urlBase = "https://mien-tuun.de"
}: {
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  featuredImage?: string;
  slug: string;
  category?: string;
  tags?: string[];
  siteName?: string;
  urlBase?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    name: title,
    description: description,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: {
      "@type": "Person",
      name: author
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: `${urlBase}/logo.png`
      }
    },
    image: featuredImage ? [featuredImage] : undefined,
    url: `${urlBase}/blog/${slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${urlBase}/blog/${slug}`
    },
    articleSection: category,
    keywords: tags?.join(", ")
  };
}