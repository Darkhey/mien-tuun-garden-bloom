
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

export function getRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function extractKeywordsFromText(text: string, minLength: number = 4): string[] {
  return text
    .toLowerCase()
    .replace(/[^\wäöüß\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= minLength)
    .filter((word, index, arr) => arr.indexOf(word) === index)
    .slice(0, 20);
}

export function validateContentQuality(content: string): {
  isValid: boolean;
  wordCount: number;
  issues: string[];
} {
  const issues: string[] = [];
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  
  if (wordCount < 300) {
    issues.push(`Artikel zu kurz: ${wordCount} Wörter (mindestens 300 erforderlich)`);
  }
  
  if (wordCount > 3000) {
    issues.push(`Artikel sehr lang: ${wordCount} Wörter (empfohlen: 1000-2500)`);
  }
  
  const headingCount = (content.match(/^#{1,6}\s/gm) || []).length;
  if (headingCount < 3) {
    issues.push("Zu wenige Überschriften für gute Struktur");
  }
  
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  if (paragraphs.length < 5) {
    issues.push("Zu wenige Absätze für gute Lesbarkeit");
  }
  
  return {
    isValid: issues.length === 0,
    wordCount,
    issues
  };
}
