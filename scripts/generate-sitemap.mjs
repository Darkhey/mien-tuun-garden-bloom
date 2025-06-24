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

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at, published_at')
    .eq('status', 'veröffentlicht')
    .eq('published', true);

  posts?.forEach(post => {
    const lastmod = (post.updated_at || post.published_at || currentDate).split('T')[0];
    sitemap += `\n  <url>\n    <loc>${baseUrl}/blog/${post.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
  });

  const { data: recipes } = await supabase
    .from('recipes')
    .select('slug, created_at, updated_at')
    .eq('status', 'veröffentlicht');

  recipes?.forEach(recipe => {
    const lastmod = (recipe.updated_at || recipe.created_at || currentDate).split('T')[0];
    sitemap += `\n  <url>\n    <loc>${baseUrl}/rezept/${recipe.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
  });

  sitemap += '\n</urlset>\n';

  await writeFile('public/sitemap.xml', sitemap, 'utf8');
  console.log('sitemap.xml generated');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
