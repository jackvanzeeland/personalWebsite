/**
 * History-API router for the SPA redesign.
 *
 * Responsibilities: path matching, legacy-URL redirects, same-origin link
 * interception, per-route document metadata (title/description/canonical)
 * and the per-route accent custom property.
 *
 * The legacy redirect map is the single source of truth — the CloudFront
 * function used in production is generated from it (scripts/generate-redirects.mjs)
 * and a sync test keeps them identical.
 */

export type RouteName =
    | 'home'
    | 'work'
    | 'workDetail'
    | 'journey'
    | 'beyond'
    | 'contact'
    | 'notFound';

export interface RouteMatch {
    name: RouteName;
    params: Record<string, string>;
    path: string;
}

interface RouteDef {
    name: RouteName;
    pattern: RegExp;
    paramNames?: string[];
}

const ROUTES: RouteDef[] = [
    { name: 'home', pattern: /^\/$/ },
    { name: 'work', pattern: /^\/projects$/ },
    { name: 'workDetail', pattern: /^\/projects\/([a-z0-9-]+)$/, paramNames: ['slug'] },
    { name: 'journey', pattern: /^\/journey$/ },
    { name: 'beyond', pattern: /^\/beyond$/ },
    { name: 'contact', pattern: /^\/contact$/ }
];

export const routeMeta: Record<RouteName, { title: string; description: string; accent: string }> = {
    home: {
        title: 'Jack Van Zeeland — Automation Engineer',
        description: 'Software engineer focused on automation, AI tooling, and building things that are actually useful.',
        accent: '#38bdf8'
    },
    work: {
        title: 'Work — Jack Van Zeeland',
        description: 'Projects, artifacts, and interactive tools: automation, algorithms, and AI applications.',
        accent: '#818cf8'
    },
    workDetail: {
        title: 'Work — Jack Van Zeeland',
        description: 'Project detail — Jack Van Zeeland.',
        accent: '#818cf8'
    },
    journey: {
        title: 'Journey — Jack Van Zeeland',
        description: 'Career timeline, skills, and background of automation engineer Jack Van Zeeland.',
        accent: '#34d399'
    },
    beyond: {
        title: 'Beyond the Code — Jack Van Zeeland',
        description: 'Photos and life beyond the code.',
        accent: '#fbbf24'
    },
    contact: {
        title: 'Contact — Jack Van Zeeland',
        description: 'Get in touch: email, LinkedIn, GitHub, resume.',
        accent: '#38bdf8'
    },
    notFound: {
        title: 'Not found — Jack Van Zeeland',
        description: 'Page not found.',
        accent: '#38bdf8'
    }
};

import { LEGACY_MAP } from './legacyRedirects.mjs';

export function getLegacyMap(): Readonly<Record<string, string>> {
    return LEGACY_MAP;
}

function normalize(path: string): string {
    let p = path.replace(/\.html$/, '');
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p || '/';
}

export function legacyRedirect(path: string): string | null {
    return LEGACY_MAP[normalize(path)] ?? null;
}

export function matchRoute(path: string): RouteMatch {
    const p = normalize(path);
    for (const route of ROUTES) {
        const m = p.match(route.pattern);
        if (m) {
            const params: Record<string, string> = {};
            route.paramNames?.forEach((name, i) => {
                params[name] = m[i + 1];
            });
            return { name: route.name, params, path: p };
        }
    }
    return { name: 'notFound', params: {}, path: p };
}

function applyMeta(match: RouteMatch): void {
    const meta = routeMeta[match.name];
    document.title = meta.title;

    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', meta.description);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', `https://jackvanzeeland.com${match.path === '/' ? '/' : match.path}`);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', meta.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', meta.description);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', `https://jackvanzeeland.com${match.path}`);

    document.documentElement.style.setProperty('--accent', meta.accent);
}

type RouteHandler = (match: RouteMatch) => void;
let handler: RouteHandler | null = null;

function dispatch(path: string): void {
    const match = matchRoute(path);
    applyMeta(match);
    handler?.(match);
}

/** Programmatic navigation (pushState + dispatch). */
export function navigate(path: string): void {
    if (normalize(location.pathname) === normalize(path)) return;
    history.pushState(null, '', path);
    dispatch(path);
    window.scrollTo({ top: 0, behavior: 'auto' });
}

/**
 * Boot the router: resolve legacy URLs and the 404.html `?p=` fallback,
 * intercept same-origin link clicks, handle back/forward, dispatch initial route.
 */
export function startRouter(onRoute: RouteHandler): void {
    handler = onRoute;

    // 404.html S3-website fallback: /404?p=%2Fwork%2Ffoo
    const fallback = new URLSearchParams(location.search).get('p');
    if (fallback) {
        history.replaceState(null, '', fallback);
    }

    const redirected = legacyRedirect(location.pathname);
    if (redirected) {
        history.replaceState(null, '', redirected);
    }

    document.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const anchor = (e.target as Element).closest?.('a');
        if (!anchor || anchor.target || anchor.hasAttribute('download') || anchor.hasAttribute('data-external')) return;
        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:')) return;
        const url = new URL(href, location.origin);
        if (url.origin !== location.origin) return;
        e.preventDefault();
        navigate(url.pathname);
    });

    window.addEventListener('popstate', () => dispatch(location.pathname));

    dispatch(location.pathname);
}
