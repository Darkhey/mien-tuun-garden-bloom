import { writeFile } from 'fs/promises';

const baseUrl = 'https://mien-tuun.de';
const pages = [
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

const date = new Date().toISOString().split('T')[0];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

for (const page of pages) {
  sitemap += `\n  <url>\n    <loc>${baseUrl}${page}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
}

sitemap += '\n</urlset>';

await writeFile('public/sitemap.xml', sitemap);
console.log('Sitemap generated');
