import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const SITE_URL = (process.env.VITE_SITE_URL || 'https://subwaycaculation.vercel.app').trim().replace(/\/+$/, '');

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${SITE_URL}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`;

await fs.writeFile(path.join(PUBLIC_DIR, 'robots.txt'), robots, 'utf8');
await fs.writeFile(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf8');

console.log(`Generated robots.txt and sitemap.xml for: ${SITE_URL}`);
