/**
 * Page-level SEO: titles, descriptions, canonical URLs, Open Graph / X cards,
 * and schema.org JSON-LD.
 *
 * One module, three callers, so the head can never drift between them:
 *   - router.ts        → every client-side navigation
 *   - workDetail.ts    → refines the head once a project resolves
 *   - scripts/prerender.ts → bakes the same head into each static HTML file
 *
 * Project data is only referenced by type here, so the main bundle doesn't
 * pull in the project catalog.
 */

import { routeMeta, type RouteName } from './routeMeta';
import type { WorkItem } from '../data/workItems';

export const SITE_URL = 'https://jackvanzeeland.com';
export const SITE_NAME = 'Jack Van Zeeland';
export const DEFAULT_OG_IMAGE = '/og/default.jpg';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const META_DESCRIPTION_MAX = 160;

type JsonLd = Record<string, unknown>;

export interface PageSeo {
    /** Canonical path, no trailing slash ("/" for home). */
    path: string;
    title: string;
    description: string;
    /** Site-relative or absolute image URL, 1200×630. */
    image: string;
    imageAlt: string;
    ogType: 'website' | 'profile' | 'article';
    noindex?: boolean;
    jsonLd: JsonLd[];
}

export function absoluteUrl(pathOrUrl: string): string {
    if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
    return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const PERSON: JsonLd = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Jack Van Zeeland',
    url: `${SITE_URL}/`,
    image: absoluteUrl('/images/profile.jpg'),
    jobTitle: 'Software Engineer',
    description:
        'Chicago software engineer specializing in automation, AI tooling, and interactive web development.',
    worksFor: { '@type': 'Organization', name: 'Echo Global Logistics' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Wisconsin–Madison' },
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Chicago',
        addressRegion: 'IL',
        addressCountry: 'US'
    },
    sameAs: [
        'https://www.linkedin.com/in/jack-van-zeeland-aab0a7221/',
        'https://github.com/jackvanzeeland',
        'https://www.instagram.com/jack.vanzeeland/'
    ],
    knowsAbout: [
        'Software Engineering',
        'Robotic Process Automation',
        'UiPath',
        'Artificial Intelligence',
        'Python',
        'TypeScript',
        'Data Science',
        'Web Development'
    ]
};

const WEBSITE: JsonLd = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    author: { '@id': PERSON_ID },
    inLanguage: 'en-US'
};

function breadcrumbs(trail: [name: string, path: string][]): JsonLd {
    return {
        '@type': 'BreadcrumbList',
        itemListElement: trail.map(([name, path], i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name,
            item: absoluteUrl(path)
        }))
    };
}

const SECTION_CRUMB: Partial<Record<RouteName, string>> = {
    work: 'Projects',
    journey: 'Journey',
    beyond: 'Beyond the Code',
    contact: 'Contact'
};

/**
 * First sentence(s) of `text` that fit in `max` characters — a readable
 * meta description instead of a mid-word cut. Falls back to a word-boundary
 * trim with an ellipsis when even the first sentence is too long.
 */
export function metaDescription(text: string, max = META_DESCRIPTION_MAX): string {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;

    const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [];
    let out = '';
    for (const sentence of sentences) {
        if ((out + sentence).trim().length > max) break;
        out += sentence;
    }
    if (out.trim()) return out.trim();

    const cut = clean.slice(0, max - 1);
    return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:—-]+$/, '')}…`;
}

/** Head data for a section route (home, projects, journey, …). */
export function routeSeo(name: RouteName, path: string): PageSeo {
    const meta = routeMeta[name];
    const canonical = name === 'home' ? '/' : path;
    const crumb = SECTION_CRUMB[name];

    const jsonLd: JsonLd[] =
        name === 'home'
            ? [WEBSITE, PERSON, { '@type': 'ProfilePage', url: `${SITE_URL}/`, mainEntity: { '@id': PERSON_ID } }]
            : crumb
              ? [PERSON, breadcrumbs([['Home', '/'], [crumb, canonical]])]
              : [PERSON];

    return {
        path: canonical,
        title: meta.title,
        description: meta.description,
        image: DEFAULT_OG_IMAGE,
        imageAlt: 'Jack Van Zeeland — Software Engineer, Chicago',
        ogType: name === 'home' ? 'profile' : 'website',
        noindex: name === 'notFound',
        jsonLd
    };
}

/** Where a project's generated 1200×630 share image lives (scripts/generate-og-images.ts). */
export function projectOgImage(slug: string): string {
    return `/og/projects/${slug}.jpg`;
}

/** Head data for /projects/:slug. */
export function projectSeo(item: WorkItem): PageSeo {
    const path = `/projects/${item.slug}`;
    const keywords = [...item.tags.filter((t) => t !== 'Artifact'), ...item.technologies];
    const image = projectOgImage(item.slug);
    const description = item.seoDescription ?? metaDescription(item.description);

    return {
        path,
        title: `${item.title} — Jack Van Zeeland`,
        description,
        image,
        imageAlt: `${item.title} — a project by Jack Van Zeeland`,
        ogType: 'article',
        jsonLd: [
            PERSON,
            {
                '@type': item.tool ? 'SoftwareApplication' : 'CreativeWork',
                name: item.title,
                description,
                url: absoluteUrl(path),
                image: absoluteUrl(image),
                author: { '@id': PERSON_ID },
                keywords: keywords.join(', '),
                ...(item.tool
                    ? { applicationCategory: 'WebApplication', operatingSystem: 'Any', isAccessibleForFree: true }
                    : {})
            },
            breadcrumbs([
                ['Home', '/'],
                ['Projects', '/projects'],
                [item.title, path]
            ])
        ]
    };
}

/* ── Applying to a document ─────────────────────────────────────────── */

function upsertMeta(doc: Document, attr: 'name' | 'property', key: string, content: string): void {
    let el = doc.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!el) {
        el = doc.createElement('meta');
        el.setAttribute(attr, key);
        doc.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function upsertLink(doc: Document, rel: string, href: string): void {
    let el = doc.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!el) {
        el = doc.createElement('link');
        el.setAttribute('rel', rel);
        doc.head.appendChild(el);
    }
    el.setAttribute('href', href);
}

/** Write `seo` into `doc`'s <head>, creating any tag that's missing. */
export function applySeo(doc: Document, seo: PageSeo): void {
    const url = absoluteUrl(seo.path);
    const image = absoluteUrl(seo.image);

    doc.title = seo.title;
    upsertMeta(doc, 'name', 'description', seo.description);
    upsertMeta(doc, 'name', 'robots', seo.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large');
    upsertLink(doc, 'canonical', url);

    upsertMeta(doc, 'property', 'og:type', seo.ogType);
    upsertMeta(doc, 'property', 'og:url', url);
    upsertMeta(doc, 'property', 'og:title', seo.title);
    upsertMeta(doc, 'property', 'og:description', seo.description);
    upsertMeta(doc, 'property', 'og:image', image);
    upsertMeta(doc, 'property', 'og:image:width', String(OG_IMAGE_WIDTH));
    upsertMeta(doc, 'property', 'og:image:height', String(OG_IMAGE_HEIGHT));
    upsertMeta(doc, 'property', 'og:image:alt', seo.imageAlt);

    upsertMeta(doc, 'name', 'twitter:card', 'summary_large_image');
    upsertMeta(doc, 'name', 'twitter:title', seo.title);
    upsertMeta(doc, 'name', 'twitter:description', seo.description);
    upsertMeta(doc, 'name', 'twitter:image', image);
    upsertMeta(doc, 'name', 'twitter:image:alt', seo.imageAlt);

    let ld = doc.getElementById('structured-data');
    if (!ld) {
        ld = doc.createElement('script');
        ld.id = 'structured-data';
        ld.setAttribute('type', 'application/ld+json');
        doc.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': seo.jsonLd });
}
