export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  userId?: string;
  publishedAt: string;
  updatedAt?: string;
  featuredImage: string;
  category: string;
  tags: string[];
  readingTime: number;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  featured?: boolean;
  published: boolean;
  /**
   * Optionales Feld für automatisch generierte strukturierte Daten (JSON-LD) für Rich Snippets.
   */
  structuredData?: string; // JSON-LD als string (z.B. für HowTo/FAQ/Recipe)
  /**
   * Original-Titel (z.B. für interne Zwecke)
   */
  originalTitle?: string;
  /**
   * Optional: alternatives Social Media Bild (OpenGraph override)
   */
  ogImage?: string;
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  prepTime: number; // in Minuten
  cookTime: number; // in Minuten
  totalTime: number; // in Minuten
  servings: number;
  difficulty: 'einfach' | 'mittel' | 'schwer';
  category: string;
  cuisine?: string;
  season: 'frühling' | 'sommer' | 'herbst' | 'winter' | 'ganzjährig';
  tags: string[];
  ingredients: Ingredient[];
  instructions: Instruction[];
  nutrition?: Nutrition;
  tips?: string[];
  relatedRecipes?: string[]; // Recipe IDs
  publishedAt: string;
  author: string;
  featured?: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface Ingredient {
  id: string;
  amount?: number;
  unit?: string;
  name: string;
  notes?: string;
  group?: string; // z.B. "Für den Teig", "Für die Sauce"
}

export interface Instruction {
  id: string;
  step: number;
  text: string;
  image?: string;
  time?: number; // Zeit für diesen Schritt in Minuten
}

export interface Nutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  count: number;
}
