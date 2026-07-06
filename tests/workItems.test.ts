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
        expect(getWorkItem('qr-code-generator')?.tool).toBeUndefined();
    });

    it('getWorkItem returns undefined for unknown slugs', () => {
        expect(getWorkItem('does-not-exist')).toBeUndefined();
    });

    it('apps hosted under /projects/* CloudFront behaviors link out directly', () => {
        const woku = WORK_ITEMS.find((i) => i.title === 'Woku')!;
        expect(workItemHref(woku)).toEqual({ href: '/projects/woku/', external: true });
        const wordle = getWorkItem('wordle-solver')!;
        expect(workItemHref(wordle)).toEqual({ href: '/projects/wordle-solver', external: false });
    });

    it('allWorkTags is deduped and sorted', () => {
        const tags = allWorkTags();
        expect(new Set(tags).size).toBe(tags.length);
        expect([...tags].sort()).toEqual(tags);
        expect(tags.length).toBeGreaterThan(0);
    });
});
