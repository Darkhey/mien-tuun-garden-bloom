
import { generateSlug, generateMetaTitle, generateMetaDescription, generateStructuredData } from '@/utils/blogSeo';
import { supabase } from '@/integrations/supabase/client';

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  canonicalUrl: string;
  structuredData: any;
  twitterCard: string;
  author: string;
  publishedAt?: string;
  updatedAt?: string;
}

export interface SEOAnalysis {
  score: number;
  recommendations: string[];
  keywords: string[];
  readabilityScore: number;
  contentLength: number;
}

export class SEOService {
  private static instance: SEOService;

  public static getInstance(): SEOService {
    if (!SEOService.instance) {
      SEOService.instance = new SEOService();
    }
    return SEOService.instance;
  }

  /**
   * Generiert automatisch SEO-Metadaten für einen Blog-Post
   */
  async generateBlogPostSEO(data: {
    title: string;
    content: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    slug?: string;
    featuredImage?: string;
    author?: string;
  }): Promise<SEOMetadata> {
    const slug = data.slug || generateSlug(data.title);
    const baseUrl = 'https://mien-tuun.de';
    
    // Keywords aus Content und Tags extrahieren
    const keywords = this.extractKeywords(data.content, data.tags);
    
    // Structured Data generieren
    const structuredData = generateStructuredData({
      title: data.title,
      description: data.excerpt || generateMetaDescription(data.content),
      author: data.author || 'Mien Tuun Team',
      publishedAt: new Date().toISOString(),
      featuredImage: data.featuredImage,
      slug,
      category: data.category,
      tags: data.tags
    });

    return {
      title: generateMetaTitle(data.title),
      description: generateMetaDescription(data.content, data.excerpt),
      keywords,
      ogTitle: generateMetaTitle(data.title),
      ogDescription: generateMetaDescription(data.content, data.excerpt, 160),
      ogImage: data.featuredImage || `${baseUrl}/images/og-default.jpg`,
      ogUrl: `${baseUrl}/blog/${slug}`,
      canonicalUrl: `${baseUrl}/blog/${slug}`,
      structuredData,
      twitterCard: 'summary_large_image',
      author: data.author || 'Mien Tuun Team',
      publishedAt: new Date().toISOString()
    };
  }

  /**
   * Analysiert SEO-Qualität eines Blog-Posts
   */
  analyzeSEO(data: {
    title: string;
    content: string;
    excerpt?: string;
    keywords?: string[];
  }): SEOAnalysis {
    let score = 0;
    const recommendations: string[] = [];
    
    // Titel-Analyse (20 Punkte)
    if (data.title.length >= 30 && data.title.length <= 60) {
      score += 20;
    } else if (data.title.length < 30) {
      recommendations.push('Titel sollte mindestens 30 Zeichen haben');
      score += 10;
    } else {
      recommendations.push('Titel sollte maximal 60 Zeichen haben');
      score += 15;
    }

    // Content-Länge (20 Punkte)
    const wordCount = data.content.split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 2000) {
      score += 20;
    } else if (wordCount < 300) {
      recommendations.push('Content sollte mindestens 300 Wörter haben');
      score += 10;
    } else {
      recommendations.push('Content ist sehr lang - prüfe Struktur');
      score += 15;
    }

    // Excerpt-Analyse (15 Punkte)
    if (data.excerpt && data.excerpt.length >= 120 && data.excerpt.length <= 160) {
      score += 15;
    } else if (!data.excerpt) {
      recommendations.push('Füge eine Meta-Description hinzu');
      score += 5;
    } else {
      recommendations.push('Meta-Description sollte 120-160 Zeichen haben');
      score += 10;
    }

    // Struktur-Analyse (15 Punkte)
    const headerCount = (data.content.match(/^#{1,6}\s/gm) || []).length;
    if (headerCount >= 3) {
      score += 15;
    } else if (headerCount >= 1) {
      recommendations.push('Füge mehr Zwischenüberschriften hinzu');
      score += 10;
    } else {
      recommendations.push('Verwende Überschriften für bessere Struktur');
      score += 5;
    }

    // Keywords-Analyse (15 Punkte)
    const extractedKeywords = this.extractKeywords(data.content, data.keywords);
    if (extractedKeywords.length >= 5) {
      score += 15;
    } else {
      recommendations.push('Verwende mehr relevante Keywords');
      score += 8;
    }

    // Lesbarkeit (15 Punkte)
    const readabilityScore = this.calculateReadability(data.content);
    if (readabilityScore >= 60) {
      score += 15;
    } else {
      recommendations.push('Verbessere Lesbarkeit mit kürzeren Sätzen');
      score += Math.floor(readabilityScore / 4);
    }

    return {
      score: Math.min(100, score),
      recommendations,
      keywords: extractedKeywords,
      readabilityScore,
      contentLength: wordCount
    };
  }

  /**
   * Extrahiert Keywords aus Content und Tags
   */
  private extractKeywords(content: string, tags?: string[]): string[] {
    const words = content
      .toLowerCase()
      .replace(/<[^>]*>/g, '') // HTML entfernen
      .replace(/[^\wäöüß\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Häufigkeitsanalyse
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Top Keywords + Tags kombinieren
    const topWords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return [...new Set([...(tags || []), ...topWords])].slice(0, 15);
  }

  /**
   * Berechnet Lesbarkeit-Score
   */
  private calculateReadability(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(Boolean);
    
    const avgWordsPerSentence = words.length / (sentences.length || 1);
    
    // Vereinfachte Flesch-Reading-Ease Formel
    return Math.max(0, Math.min(100, 206.835 - (1.015 * avgWordsPerSentence)));
  }

  /**
   * Generiert Sitemap für alle veröffentlichten Blog-Posts
   */
  async generateSitemap(): Promise<string> {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'veröffentlicht')
      .eq('published', true);

    const baseUrl = 'https://mien-tuun.de';
    const currentDate = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    posts?.forEach(post => {
      const lastmod = (post.updated_at || post.published_at || currentDate).split('T')[0];
      sitemap += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    sitemap += '\n</urlset>';
    return sitemap;
  }
}

export default SEOService;
