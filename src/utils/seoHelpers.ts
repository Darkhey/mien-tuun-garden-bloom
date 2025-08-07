interface SEOMetaData {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export const generateSEOTitle = (title: string, siteName: string = 'Mien Tuun'): string => {
  if (title.includes(siteName)) {
    return title;
  }
  return `${title} | ${siteName}`;
};

export const generateSEODescription = (content: string, excerpt?: string, maxLength: number = 160): string => {
  if (excerpt && excerpt.length <= maxLength) {
    return excerpt;
  }

  // Clean content and extract meaningful description
  const cleanContent = content
    .replace(/#{1,6}\s+/g, '') // Remove markdown headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
    .replace(/\[(.*?)]\(.*?\)/g, '$1') // Remove markdown links
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\n\s*\n/g, ' ') // Replace multiple newlines with space
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  // Find the last complete sentence within the limit
  const truncated = cleanContent.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  
  if (lastSentence > maxLength * 0.7) { // If we have at least 70% of content with complete sentence
    return truncated.substring(0, lastSentence + 1);
  }
  
  // Otherwise, truncate at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace) + '...';
};

export const generateKeywords = (
  title: string,
  content: string,
  category?: string,
  tags: string[] = []
): string[] => {
  const keywords = new Set<string>();

  // Add tags
  tags.forEach(tag => keywords.add(tag.toLowerCase()));

  // Add category
  if (category) {
    keywords.add(category.toLowerCase());
  }

  // Extract keywords from title
  const titleWords = title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['und', 'oder', 'aber', 'dass', 'wenn', 'dann', 'für', 'von', 'mit', 'bei', 'nach', 'über', 'unter', 'durch'].includes(word));
  
  titleWords.forEach(word => keywords.add(word));

  // Extract common phrases from content (2-3 word combinations)
  const contentWords = content
    .toLowerCase()
    .replace(/[^\\w\\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);

  // Add frequent 2-word phrases
  for (let i = 0; i < contentWords.length - 1 && keywords.size < 15; i++) {
    const phrase = `${contentWords[i]} ${contentWords[i + 1]}`;
    if (phrase.length > 6 && phrase.length < 25) {
      keywords.add(phrase);
    }
  }

  return Array.from(keywords).slice(0, 15); // Limit to 15 keywords
};

export const generateStructuredData = (data: {
  type: 'Article' | 'BlogPosting' | 'Recipe';
  title: string;
  description: string;
  author: string;
  publishedDate: string;
  modifiedDate?: string;
  image?: string;
  url: string;
  category?: string;
  tags?: string[];
  readingTime?: number;
}): object => {
  const baseStructure = {
    '@context': 'https://schema.org',
    '@type': data.type,
    'headline': data.title,
    'description': data.description,
    'author': {
      '@type': 'Person',
      'name': data.author
    },
    'datePublished': data.publishedDate,
    'dateModified': data.modifiedDate || data.publishedDate,
    'url': data.url,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': data.url
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Mien Tuun',
      'url': 'https://mien-tuun.de'
    }
  };

  if (data.image) {
    (baseStructure as any).image = {
      '@type': 'ImageObject',
      'url': data.image
    };
  }

  if (data.category) {
    (baseStructure as any).articleSection = data.category;
  }

  if (data.tags && data.tags.length > 0) {
    (baseStructure as any).keywords = data.tags;
  }

  if (data.readingTime) {
    (baseStructure as any).timeRequired = `PT${data.readingTime}M`;
  }

  return baseStructure;
};

export const optimizeImageForSEO = (
  imageUrl: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): string => {
  if (!imageUrl || imageUrl.includes('placeholder')) {
    return imageUrl;
  }

  // If it's an Unsplash URL, optimize it
  if (imageUrl.includes('unsplash.com')) {
    const url = new URL(imageUrl);
    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('fm', options.format);
    
    // Add auto format and compression
    params.set('auto', 'format,compress');
    
    url.search = params.toString();
    return url.toString();
  }

  return imageUrl;
};
