
// ⚠️ SIMULATED DATA SERVICE - Replace with real API integrations

export interface ContentEnrichmentResult {
  enhancedContent: string;
  featuredImage: string;
  ogImage: string;
  internalLinks: Array<{ text: string; url: string; position: number }>;
  relatedContent: Array<{ title: string; url: string; excerpt: string }>;
  structuredData: any;
  socialMediaData: {
    twitterCard: any;
    openGraph: any;
  };
}

// Universal garden fallback image
const GARDEN_FALLBACK_IMAGE = "/lovable-uploads/2a3ad273-430b-4675-b1c4-33dbaac0b6cf.png";

export class ContentEnrichmentService {
  async enrichContent(content: any, seoData: any): Promise<ContentEnrichmentResult> {
    console.log('[ContentEnrichment] ⚠️ USING SIMULATED DATA - Enriching content with additional data');
    
    // Content mit internen Links anreichern
    const enhancedContent = await this.addInternalLinks(content.content, seoData.internalLinks);
    
    // Featured Image generieren oder auswählen
    const featuredImage = await this.generateOrSelectFeaturedImage(content);
    
    // Social Media Metadaten erstellen
    const socialMediaData = this.createSocialMediaData(content, featuredImage);
    
    // Verwandte Inhalte suchen
    const relatedContent = await this.findRelatedContent(content, seoData.keywords);
    
    return {
      enhancedContent,
      featuredImage,
      ogImage: featuredImage,
      internalLinks: seoData.internalLinks,
      relatedContent,
      structuredData: seoData.structuredData,
      socialMediaData
    };
  }

  private async addInternalLinks(content: string, internalLinks: Array<{ text: string; url: string }>): Promise<string> {
    console.log('[ContentEnrichment] ⚠️ SIMULATED INTERNAL LINKING');
    let enhancedContent = content;
    
    // Interne Links intelligent in den Content einfügen
    for (const link of internalLinks) {
      // Suche nach relevanten Textstellen
      const regex = new RegExp(`\\b${link.text}\\b`, 'gi');
      const matches = enhancedContent.match(regex);
      
      if (matches && matches.length > 0) {
        // Nur den ersten Match verlinken, um Spam zu vermeiden
        enhancedContent = enhancedContent.replace(regex, `[${link.text}](${link.url})`);
        break; // Nur einen Link pro Begriff
      }
    }
    
    return enhancedContent;
  }

  private async generateOrSelectFeaturedImage(content: any): Promise<string> {
    console.log('[ContentEnrichment] ⚠️ SIMULATED IMAGE SELECTION');
    
    // ⚠️ SIMULATED: Nutze das Garden Fallback als Standard
    if (content.category?.toLowerCase().includes('garten')) {
      return GARDEN_FALLBACK_IMAGE;
    } else if (content.category?.toLowerCase().includes('koch')) {
      return GARDEN_FALLBACK_IMAGE; // Auch für Kochen, da es ein Garten-Blog ist
    }
    
    // Fallback: Garden Image
    return GARDEN_FALLBACK_IMAGE;
  }

  private createSocialMediaData(content: any, featuredImage: string): any {
    console.log('[ContentEnrichment] ⚠️ SIMULATED SOCIAL MEDIA DATA CREATION');
    
    return {
      twitterCard: {
        card: 'summary_large_image',
        site: '@MienTuun',
        title: content.title,
        description: content.excerpt || content.content.substring(0, 200),
        image: featuredImage
      },
      openGraph: {
        type: 'article',
        title: content.title,
        description: content.excerpt || content.content.substring(0, 200),
        image: featuredImage,
        url: `https://mien-tuun.de/blog/${content.slug || 'artikel'}`,
        site_name: 'Mien Tuun'
      }
    };
  }

  private async findRelatedContent(content: any, keywords: string[]): Promise<Array<{ title: string; url: string; excerpt: string }>> {
    console.log('[ContentEnrichment] ⚠️ SIMULATED RELATED CONTENT SEARCH');
    
    // ⚠️ SIMULATED: Hardcoded verwandte Artikel
    const relatedArticles = [
      {
        title: 'Garten winterfest machen: Tipps für die kalte Jahreszeit',
        url: '/blog/garten-winterfest-machen',
        excerpt: 'So bereitest du deinen Garten optimal auf den Winter vor...'
      },
      {
        title: 'Nachhaltig kochen: Umweltfreundliche Küchentipps',
        url: '/blog/nachhaltig-kochen-tipps',
        excerpt: 'Entdecke einfache Wege, umweltbewusster zu kochen...'
      },
      {
        title: 'Kräuter trocknen: Die besten Methoden im Überblick',
        url: '/blog/kraeuter-trocknen-methoden',
        excerpt: 'Konserviere deine Kräuterernte mit diesen bewährten Techniken...'
      }
    ];
    
    // Filtere basierend auf Keywords (vereinfacht)
    return relatedArticles.filter(article => {
      return keywords.some(keyword => 
        article.title.toLowerCase().includes(keyword.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(keyword.toLowerCase())
      );
    }).slice(0, 3);
  }

  async generateImageWithAI(prompt: string): Promise<string> {
    console.log('[ContentEnrichment] ⚠️ SIMULATED AI IMAGE GENERATION for prompt:', prompt);
    
    // ⚠️ SIMULATED: Verwende Garden Fallback statt KI-Generierung
    return GARDEN_FALLBACK_IMAGE;
  }

  async optimizeImages(images: string[]): Promise<string[]> {
    console.log('[ContentEnrichment] ⚠️ SIMULATED IMAGE OPTIMIZATION:', images);
    
    // Füge Optimierungsparameter hinzu
    return images.map(img => {
      if (img.includes('unsplash.com')) {
        return `${img}&auto=format&fit=crop&w=1200&q=80`;
      }
      return img;
    });
  }
}
