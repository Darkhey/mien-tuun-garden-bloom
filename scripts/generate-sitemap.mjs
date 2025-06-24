import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'fs/promises';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function escapeXml(str) {
  return String(str).replace(/[<>&"']/g, c => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&apos;';
      default:
        return c;
    }
  });
}

async function generate() {
  const baseUrl = 'https://mien-tuun.de';
  const currentDate = new Date().toISOString().split('T')[0];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const staticRoutes = [
    '/',
    '/blog',
    '/rezepte',
    '/ueber-uns',
    '/kontakt',
    '/aussaatkalender',
    '/links',
    '/impressum',
    '/datenschutz'
  ];

  for (const route of staticRoutes) {
    sitemap += `\n  <url>\n    <loc>${baseUrl}${route}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
  }

  const { data: posts, error: postError } = await supabase
    .from('blog_posts')
    .select('slug, updated_at, published_at')
    .eq('status', 'veröffentlicht')
    .eq('published', true);

  if (postError) {
    console.error('Failed to fetch posts:', postError.message);
    throw postError;
  }

  posts?.forEach(post => {
    const lastmod = (() => {
      const dateStr = post.updated_at || post.published_at;
      if (dateStr && typeof dateStr === 'string') {
        try {
          return dateStr.split('T')[0];
        } catch (e) {
          console.warn(`Invalid date format for post ${post.slug}:`, dateStr);
        }
      }
      return currentDate;
    })();
    sitemap += `\n  <url>\n    <loc>${baseUrl}/blog/${escapeXml(post.slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
  });

  const { data: recipes, error: recipeError } = await supabase
    .from('recipes')
    .select('slug, created_at, updated_at')
    .eq('status', 'veröffentlicht');

  if (recipeError) {
    console.error('Failed to fetch recipes:', recipeError.message);
    throw recipeError;
  }

  recipes?.forEach(recipe => {
    const lastmod = (() => {
      const dateStr = recipe.updated_at || recipe.created_at;
      if (dateStr && typeof dateStr === 'string') {
        try {
          return dateStr.split('T')[0];
        } catch (e) {
          console.warn(`Invalid date format for recipe ${recipe.slug}:`, dateStr);
        }
      }
      return currentDate;
    })();
    sitemap += `\n  <url>\n    <loc>${baseUrl}/rezept/${escapeXml(recipe.slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
  });

  sitemap += '\n</urlset>\n';

  await writeFile('public/sitemap.xml', sitemap, 'utf8');
  console.log('sitemap.xml generated');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
