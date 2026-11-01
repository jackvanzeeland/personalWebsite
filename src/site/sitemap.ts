/** sitemap.xml builder for the prerendered routes. */

import { absoluteUrl } from '../app/seo';

export interface SitemapEntry {
    path: string;
    /** YYYY-MM-DD; omitted when unknown rather than faked as "today". */
    lastmod?: string;
}

function escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function buildSitemap(entries: SitemapEntry[]): string {
    const urls = entries
        .map((e) => {
            const lastmod = e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : '';
            return `  <url>\n    <loc>${escapeXml(absoluteUrl(e.path))}</loc>${lastmod}\n  </url>`;
        })
        .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
