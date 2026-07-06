/**
 * Regenerates sitemap.xml for the SPA's section routes.
 * Detail pages (/work/:slug) are discovered by crawlers via internal links.
 * Run automatically as part of `npm run build`.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://jackvanzeeland.com';

const ROUTES = [
    { path: '/', priority: '1.0' },
    { path: '/projects', priority: '0.9' },
    { path: '/journey', priority: '0.8' },
    { path: '/beyond', priority: '0.6' },
    { path: '/contact', priority: '0.7' }
];

const today = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(
    (r) => `  <url>
    <loc>${BASE}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <priority>${r.priority}</priority>
  </url>`
).join('\n')}
</urlset>
`;

await fs.writeFile(path.join(ROOT, 'sitemap.xml'), xml);
console.log(`generate-sitemap: ${ROUTES.length} routes`);
