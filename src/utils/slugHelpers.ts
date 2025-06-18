
import { supabase } from "@/integrations/supabase/client";

/**
 * Generiert einen eindeutigen Slug für Blog-Posts
 */
export async function generateUniqueSlug(baseTitle: string): Promise<string> {
  // Basis-Slug erstellen
  const baseSlug = baseTitle
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60); // Kürzer für Suffix-Raum

  // Prüfe ob Basis-Slug bereits existiert
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('slug', baseSlug)
    .maybeSingle();

  if (!existing) {
    return baseSlug;
  }

  // Finde nächste verfügbare Nummer
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (true) {
    const { data: existingNumbered } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('slug', uniqueSlug)
      .maybeSingle();
    
    if (!existingNumbered) {
      return uniqueSlug;
    }
    
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
}

/**
 * Sanitized HTML/Markdown Content für XSS-Schutz
 */
export function sanitizeContent(content: string): string {
  // Entferne gefährliche HTML-Tags und Attribute
  return content
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gis, '')
    .replace(/<embed[^>]*>/gi, '');
}
