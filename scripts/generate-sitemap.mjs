import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// scripts/generate-sitemap.mjs

// … previous imports and code …

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    'Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
  process.exit(1);
}

// … rest of the sitemap generation logic …

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generateSitemap() {
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('slug, updated_at, published_at')
    .eq('status', 'veröffentlicht')
    .eq('published', true);

  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }

  const baseUrl = 'https://mien-tuun.de';
  const currentDate = new Date().toISOString().split('T')[0];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <url>\n    <loc>${baseUrl}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>${baseUrl}/blog</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`;

  posts?.forEach(post => {
    const lastmod = (post.updated_at || post.published_at || currentDate).split('T')[0];
    const encodedSlug = encodeURIComponent(post.slug);
    sitemap += `
  <url>
    <loc>${baseUrl}/blog/${encodedSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  sitemap += '\n</urlset>';
  return sitemap;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, '../public/sitemap.xml');

generateSitemap()
  .then(async xml => {
    await writeFile(outputPath, xml);
    console.log('Sitemap written to', outputPath);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
