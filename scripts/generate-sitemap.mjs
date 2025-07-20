import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ublbxvpmoccmegtwaslh.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibGJ4dnBtb2NjbWVndHdhc2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjExNTksImV4cCI6MjA2NTQ5NzE1OX0.MHtBC8D73NtPBONH2Qg0-hBZsyUyfDTUYZgzB_HEHpQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generateSitemap() {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at, published_at')
    .eq('status', 'veröffentlicht')
    .eq('published', true);

  const baseUrl = 'https://mien-tuun.de';
  const currentDate = new Date().toISOString().split('T')[0];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <url>\n    <loc>${baseUrl}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>${baseUrl}/blog</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`;

  posts?.forEach(post => {
    const lastmod = (post.updated_at || post.published_at || currentDate).split('T')[0];
    sitemap += `\n  <url>\n    <loc>${baseUrl}/blog/${post.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
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
