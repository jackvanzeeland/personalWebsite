import { describe, it, expect, beforeEach } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
    applySeo,
    routeSeo,
    projectSeo,
    metaDescription,
    absoluteUrl,
    META_DESCRIPTION_MAX,
    DEFAULT_OG_IMAGE
} from '../src/app/seo';
import { routeMeta, type RouteName } from '../src/app/routeMeta';
import { WORK_ITEMS } from '../src/data/workItems';
import { prerenderRoutes, cdnOwnedProjectPaths, outputFileFor } from '../src/site/routes';
import { buildSitemap } from '../src/site/sitemap';

const infra = readFileSync(resolve(__dirname, '../infrastructure.yaml'), 'utf8');
const routes = prerenderRoutes(WORK_ITEMS, cdnOwnedProjectPaths(infra));
const seoFor = (r: (typeof routes)[number]) => (r.item ? projectSeo(r.item) : routeSeo(r.name, r.path));

describe('page metadata', () => {
    it('every route has a specific description that fits in a search snippet', () => {
        for (const [name, meta] of Object.entries(routeMeta)) {
            expect(meta.description.length, name).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
            expect(meta.description.length, name).toBeGreaterThan(10);
        }
    });

    it('every prerendered page has a unique title and description', () => {
        const pages = routes.map(seoFor);
        expect(new Set(pages.map((p) => p.title)).size).toBe(pages.length);
        expect(new Set(pages.map((p) => p.description)).size).toBe(pages.length);
        pages.forEach((p) => expect(p.description.length, p.path).toBeLessThanOrEqual(META_DESCRIPTION_MAX));
    });

    it('canonical paths have no trailing slash (home is "/")', () => {
        expect(routeSeo('home', '/').path).toBe('/');
        routes.map(seoFor).forEach((p) => expect(p.path === '/' || !p.path.endsWith('/')).toBe(true));
    });

    it('the 404 route is noindex; real pages are not', () => {
        expect(routeSeo('notFound', '/nope').noindex).toBe(true);
        routes.map(seoFor).forEach((p) => expect(p.noindex).toBeFalsy());
    });

    it('every share image referenced by a page exists in public/', () => {
        for (const page of routes.map(seoFor)) {
            expect(existsSync(resolve(__dirname, '../public', page.image.slice(1))), page.image).toBe(true);
        }
        expect(existsSync(resolve(__dirname, '../public', DEFAULT_OG_IMAGE.slice(1)))).toBe(true);
    });
});

describe('structured data', () => {
    it('project pages describe the work and a breadcrumb trail', () => {
        const item = WORK_ITEMS.find((i) => i.slug === 'wordle-solver')!;
        const types = projectSeo(item).jsonLd.map((n) => n['@type']);
        expect(types).toEqual(['Person', 'SoftwareApplication', 'BreadcrumbList']);
    });

    it('home declares the WebSite and the Person', () => {
        const types = routeSeo('home', '/').jsonLd.map((n) => n['@type']);
        expect(types).toContain('WebSite');
        expect(types).toContain('Person');
    });
});

describe('applySeo', () => {
    beforeEach(() => {
        document.head.innerHTML = '<title>old</title><meta name="description" content="old">';
    });

    it('writes title, description, canonical, OG/X tags and JSON-LD', () => {
        applySeo(document, routeSeo('journey', '/journey'));
        expect(document.title).toBe(routeMeta.journey.title);
        expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(absoluteUrl('/journey'));
        expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
            absoluteUrl(DEFAULT_OG_IMAGE)
        );
        expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image');
        const ld = JSON.parse(document.getElementById('structured-data')!.textContent!);
        expect(ld['@context']).toBe('https://schema.org');
    });

    it('updates tags in place instead of duplicating them on navigation', () => {
        (['home', 'journey', 'contact'] as RouteName[]).forEach((name) => applySeo(document, routeSeo(name, `/${name}`)));
        expect(document.querySelectorAll('meta[name="description"]').length).toBe(1);
        expect(document.querySelectorAll('link[rel="canonical"]').length).toBe(1);
        expect(document.querySelectorAll('#structured-data').length).toBe(1);
    });
});

describe('metaDescription', () => {
    it('keeps whole sentences under the limit', () => {
        const text = 'First sentence here. ' + 'Second sentence is quite a bit longer. '.repeat(6);
        const out = metaDescription(text, 60);
        expect(out).toBe('First sentence here. Second sentence is quite a bit longer.');
    });

    it('falls back to a word-boundary cut with an ellipsis', () => {
        const out = metaDescription('word '.repeat(80), 40);
        expect(out.length).toBeLessThanOrEqual(40);
        expect(out.endsWith('…')).toBe(true);
    });
});

describe('prerender route list', () => {
    it('skips project paths CloudFront hands to their own apps', () => {
        const owned = cdnOwnedProjectPaths(infra);
        expect(owned.has('/projects/budget-tracker')).toBe(true);
        routes.forEach((r) => expect(owned.has(r.path), r.path).toBe(false));
    });

    it('covers the five sections plus the in-site project pages', () => {
        expect(routes.slice(0, 5).map((r) => r.path)).toEqual(['/', '/projects', '/journey', '/beyond', '/contact']);
        expect(routes.some((r) => r.path === '/projects/wordle-solver')).toBe(true);
    });

    it('maps each path to its S3 key', () => {
        expect(outputFileFor('/')).toBe('index.html');
        expect(outputFileFor('/projects/wordle-solver')).toBe('projects/wordle-solver/index.html');
    });

    it('sitemap lists every route, omitting unknown lastmod', () => {
        const xml = buildSitemap([{ path: '/', lastmod: '2026-11-01' }, { path: '/projects' }]);
        expect(xml).toContain('<loc>https://jackvanzeeland.com/</loc>\n    <lastmod>2026-11-01</lastmod>');
        expect(xml).toContain('<loc>https://jackvanzeeland.com/projects</loc>\n  </url>');
    });
});
