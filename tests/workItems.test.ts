import { describe, it, expect } from 'vitest';
import { WORK_ITEMS, getWorkItem, allWorkTags, workItemHref } from '../src/data/workItems';
import { PROJECTS } from '../src/data/projects';
import { ARTIFACTS } from '../src/data/artifacts';

describe('WORK_ITEMS adapter', () => {
    it('absorbs every project and every artifact (deduped by identity)', () => {
        // Artifacts also listed in PROJECTS collapse into one item
        for (const project of PROJECTS) {
            expect(WORK_ITEMS.some((i) => i.title === project.title)).toBe(true);
        }
        for (const artifact of ARTIFACTS) {
            expect(WORK_ITEMS.some((i) => i.title === artifact.title)).toBe(true);
        }
        expect(WORK_ITEMS.filter((i) => i.kind === 'artifact').length).toBe(ARTIFACTS.length);
        expect(WORK_ITEMS.length).toBeLessThanOrEqual(PROJECTS.length + ARTIFACTS.length);
    });

    it('every item has a unique, non-empty, url-safe slug', () => {
        const slugs = WORK_ITEMS.map((i) => i.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
        for (const slug of slugs) {
            expect(slug).toMatch(/^[a-z0-9-]+$/);
        }
    });

    it('interactive tools are flagged', () => {
        expect(getWorkItem('wordle-solver')?.tool).toBe('wordle-solver');
        expect(getWorkItem('secret-santa')?.tool).toBe('secret-santa');
        expect(getWorkItem('lyric-animator')?.tool).toBe('lyric-animator');
        expect(getWorkItem('qr-code-generator')?.tool).toBe('qr-code-generator');
        expect(getWorkItem('uipath-queue-processor')?.tool).toBe('uipath-queue-processor');
        expect(getWorkItem('html-gems')?.tool).toBe('html-gems');
    });

    it('artifact tools carry no stale external link (regression: /pages/artifacts/*)', () => {
        // A stale webpage_link here rendered an "Open the app ↗" button that
        // 301-redirected back to the same detail page.
        for (const slug of ['qr-code-generator', 'uipath-queue-processor', 'html-gems']) {
            const item = getWorkItem(slug)!;
            expect(item.links.external).toBeUndefined();
            expect(workItemHref(item)).toEqual({ href: `/projects/${slug}`, external: false });
        }
    });

    it('getWorkItem returns undefined for unknown slugs', () => {
        expect(getWorkItem('does-not-exist')).toBeUndefined();
    });

    it('apps hosted under /projects/* CloudFront behaviors link out directly', () => {
        const superbowl = WORK_ITEMS.find((i) => i.title === 'Super Bowl Competition')!;
        expect(workItemHref(superbowl)).toEqual({ href: '/projects/superbowl/', external: true });
        const wordle = getWorkItem('wordle-solver')!;
        expect(workItemHref(wordle)).toEqual({ href: '/projects/wordle-solver', external: false });
    });

    it('apps moved to their own subdomains route to the internal detail view', () => {
        // Woku lives at woku.jackvanzeeland.com now; its card should open the
        // detail page (which links out), same as the other subdomain apps.
        const woku = WORK_ITEMS.find((i) => i.title === 'Woku')!;
        expect(workItemHref(woku)).toEqual({ href: '/projects/woku', external: false });
    });

    it('allWorkTags is deduped and sorted', () => {
        const tags = allWorkTags();
        expect(new Set(tags).size).toBe(tags.length);
        expect([...tags].sort()).toEqual(tags);
        expect(tags.length).toBeGreaterThan(0);
    });
});
