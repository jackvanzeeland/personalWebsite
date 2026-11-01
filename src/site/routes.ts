/**
 * The set of pages the build prerenders and lists in the sitemap.
 * Pure (no fs), so the prerender, OG-image, and test code share one answer.
 */

import type { RouteName } from '../app/routeMeta';
import { workItemHref, type WorkItem } from '../data/workItems';

export interface PrerenderRoute {
    path: string;
    name: Exclude<RouteName, 'notFound'>;
    params: Record<string, string>;
    item?: WorkItem;
}

const SECTIONS: PrerenderRoute[] = [
    { path: '/', name: 'home', params: {} },
    { path: '/projects', name: 'work', params: {} },
    { path: '/journey', name: 'journey', params: {} },
    { path: '/beyond', name: 'beyond', params: {} },
    { path: '/contact', name: 'contact', params: {} }
];

/**
 * `/projects/<slug>` paths CloudFront sends to a separate app's origin
 * (infrastructure.yaml cache behaviors) — the SPA never serves these, so
 * they must not get a prerendered page or a sitemap entry.
 */
export function cdnOwnedProjectPaths(infrastructureYaml: string): Set<string> {
    const paths = new Set<string>();
    for (const m of infrastructureYaml.matchAll(/PathPattern:\s*"(\/projects\/[a-z0-9-]+)"/g)) {
        paths.add(m[1]);
    }
    return paths;
}

export function prerenderRoutes(items: WorkItem[], cdnOwned: Set<string>): PrerenderRoute[] {
    const projects = items
        .filter((item) => !workItemHref(item).external)
        .filter((item) => !cdnOwned.has(`/projects/${item.slug}`))
        .map<PrerenderRoute>((item) => ({
            path: `/projects/${item.slug}`,
            name: 'workDetail',
            params: { slug: item.slug },
            item
        }));
    return [...SECTIONS, ...projects];
}

/** dist-relative output file for a route: "/" → index.html, "/a/b" → a/b/index.html */
export function outputFileFor(path: string): string {
    return path === '/' ? 'index.html' : `${path.slice(1)}/index.html`;
}
