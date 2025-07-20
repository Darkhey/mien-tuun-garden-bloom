
import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, '../public/sitemap.xml');

// Environment variables with fallbacks
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://ublbxvpmoccmegtwaslh.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibGJ4dnBtb2NjbWVndHdhc2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjExNTksImV4cCI6MjA2NTQ5NzE1OX0.MHtBC8D73NtPBONH2Qg0-hBZsyUyfDTUYZgzB_HEHpQ";

const baseUrl = 'https://mien-tuun.de';
const currentDate = new Date().toISOString().split('T')[0];

// Static pages configuration
const staticPages = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/blog', priority: '0.9', changefreq: 'daily' },
  { path: '/rezepte', priority: '0.8', changefreq: 'weekly' },
  { path: '/aussaatkalender', priority: '0.7', changefreq: 'weekly' },
  { path: '/ueber-uns', priority: '0.6', changefreq: 'monthly' },
  { path: '/kontakt', priority: '0.6', changefreq: 'monthly' },
  { path: '/links', priority: '0.5', changefreq: 'monthly' },
  { path: '/impressum', priority: '0.3', changefreq: 'yearly' },
  { path: '/datenschutz', priority: '0.3', changefreq: 'yearly' },
];

function logError(message, error = null) {
  console.error(`[Sitemap Error] ${message}`);
  if (error) {
    console.error(`[Sitemap Error] Details:`, error.message || error);
  }
}

function logInfo(message) {
  console.log(`[Sitemap Info] ${message}`);
}

async function fetchBlogPosts() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    logError('Missing Supabase configuration');
    return [];
  }

  try {
    logInfo('Attempting to connect to Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    logInfo('Fetching published blog posts...');
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at, title, status, published')
      .eq('status', 'veröffentlicht')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) {
      logError('Database query failed', error);
      return [];
    }

    logInfo(`Successfully fetched ${posts?.length || 0} blog posts`);
    
    if (posts && posts.length > 0) {
      logInfo('Sample post data:', posts[0]);
    }

    return posts || [];
  } catch (error) {
    logError('Failed to fetch blog posts', error);
    return [];
  }
}

async function fetchRecipes() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return [];
  }

  try {
    logInfo('Fetching published recipes...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('slug, created_at, title')
      .eq('status', 'veröffentlicht')
      .order('created_at', { ascending: false });

    if (error) {
      logError('Failed to fetch recipes', error);
      return [];
    }

    logInfo(`Successfully fetched ${recipes?.length || 0} recipes`);
    return recipes || [];
  } catch (error) {
    logError('Failed to fetch recipes', error);
    return [];
  }
}

function generateSitemapXML(posts = [], recipes = []) {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Add static pages
  staticPages.forEach(page => {
    const url = page.path === '' ? baseUrl : `${baseUrl}${page.path}`;
    sitemap += `  <url>\n    <loc>${url}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
  });

  // Add blog posts
  posts.forEach(post => {
    if (!post.slug) {
      logError(`Blog post missing slug: ${post.title || 'Unknown'}`);
      return;
    }

    const lastmod = (post.updated_at || post.published_at || currentDate).split('T')[0];
    const encodedSlug = encodeURIComponent(post.slug);
    sitemap += `  <url>\n    <loc>${baseUrl}/blog/${encodedSlug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  // Add recipes
  recipes.forEach(recipe => {
    if (!recipe.slug) {
      logError(`Recipe missing slug: ${recipe.title || 'Unknown'}`);
      return;
    }

    const lastmod = (recipe.created_at || currentDate).split('T')[0];
    const encodedSlug = encodeURIComponent(recipe.slug);
    sitemap += `  <url>\n    <loc>${baseUrl}/rezepte/${encodedSlug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  });

  sitemap += '</urlset>';
  return sitemap;
}

async function generateSitemap() {
  try {
    logInfo('Starting sitemap generation...');

    // Ensure output directory exists
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
      logInfo(`Created output directory: ${outputDir}`);
    }

    // Fetch data with timeout
    const fetchPromises = [
      Promise.race([
        fetchBlogPosts(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
      ]),
      Promise.race([
        fetchRecipes(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
      ])
    ];

    const [posts, recipes] = await Promise.allSettled(fetchPromises);
    
    const blogPosts = posts.status === 'fulfilled' ? posts.value : [];
    const recipeList = recipes.status === 'fulfilled' ? recipes.value : [];

    if (posts.status === 'rejected') {
      logError('Failed to fetch blog posts with timeout', posts.reason);
    }
    if (recipes.status === 'rejected') {
      logError('Failed to fetch recipes with timeout', recipes.reason);
    }

    // Generate sitemap XML
    const sitemapXML = generateSitemapXML(blogPosts, recipeList);
    
    // Write sitemap file
    await writeFile(outputPath, sitemapXML, 'utf8');
    
    logInfo(`Sitemap successfully generated at ${outputPath}`);
    logInfo(`Total URLs: ${staticPages.length + blogPosts.length + recipeList.length}`);
    logInfo(`- Static pages: ${staticPages.length}`);
    logInfo(`- Blog posts: ${blogPosts.length}`);
    logInfo(`- Recipes: ${recipeList.length}`);

    // Validate generated sitemap
    const urlCount = (sitemapXML.match(/<url>/g) || []).length;
    if (urlCount < staticPages.length) {
      logError(`Sitemap validation failed: Expected at least ${staticPages.length} URLs, got ${urlCount}`);
    }

    return sitemapXML;
  } catch (error) {
    logError('Critical sitemap generation error', error);
    
    // Generate fallback sitemap with just static pages
    logInfo('Generating fallback sitemap with static pages only...');
    const fallbackSitemap = generateSitemapXML([], []);
    
    try {
      await writeFile(outputPath, fallbackSitemap, 'utf8');
      logInfo('Fallback sitemap created successfully');
    } catch (fallbackError) {
      logError('Failed to create fallback sitemap', fallbackError);
      process.exit(1);
    }
    
    return fallbackSitemap;
  }
}

// Execute sitemap generation
generateSitemap()
  .then(xml => {
    logInfo('Sitemap generation completed successfully');
    process.exit(0);
  })
  .catch(err => {
    logError('Sitemap generation failed completely', err);
    process.exit(1);
  });
