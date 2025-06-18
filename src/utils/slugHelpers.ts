
import { supabase } from "@/integrations/supabase/client";

export const generateUniqueSlug = async (title: string): Promise<string> => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Entferne Sonderzeichen
    .replace(/\s+/g, '-') // Ersetze Leerzeichen durch Bindestriche
    .replace(/-+/g, '-') // Entferne mehrfache Bindestriche
    .trim()
    .substring(0, 50); // Begrenze auf 50 Zeichen

  let slug = baseSlug;
  let counter = 1;

  // Prüfe Eindeutigkeit und generiere Varianten falls nötig
  while (true) {
    const { data: existingPost, error } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .maybeSingle(); // Verwende maybeSingle() statt single()

    if (error && error.code !== 'PGRST116') {
      console.error('Fehler bei Slug-Prüfung:', error);
      // Fallback bei Datenbankfehler
      return `${baseSlug}-${Date.now()}`;
    }

    if (!existingPost) {
      return slug; // Slug ist eindeutig
    }

    // Generiere neue Variante
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
};

export const sanitizeContent = (content: string): string => {
  if (!content) return '';
  
  // Entferne gefährliche HTML-Tags und JavaScript
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input'];
  let sanitized = content;
  
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    const selfClosingRegex = new RegExp(`<${tag}[^>]*/>`, 'gi');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });
  
  // Entferne JavaScript-Event-Handler
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '');
  
  // Entferne javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized.trim();
};

export const validateBlogPostData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Titel ist erforderlich');
  }
  
  if (!data.content || data.content.trim().length === 0) {
    errors.push('Inhalt ist erforderlich');
  }
  
  if (data.title && data.title.length > 200) {
    errors.push('Titel darf maximal 200 Zeichen haben');
  }
  
  if (data.excerpt && data.excerpt.length > 500) {
    errors.push('Kurzbeschreibung darf maximal 500 Zeichen haben');
  }
  
  const validSeasons = ['frühling', 'sommer', 'herbst', 'winter', 'ganzjährig'];
  if (data.season && !validSeasons.includes(data.season)) {
    errors.push('Ungültige Saison angegeben');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
