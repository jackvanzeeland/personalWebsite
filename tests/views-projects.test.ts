import { describe, it, expect, beforeEach } from 'vitest';
import projectsView from '../src/app/views/projects';
import { PROJECTS } from '../src/data/projects';
import { allWorkTags } from '../src/data/workItems';

describe('projects view', () => {
    beforeEach(() => {
        document.body.innerHTML = '<main id="view-root"></main>';
    });

    it('renders one filter chip per topic tag plus ALL', async () => {
        const root = document.getElementById('view-root')!;
        await projectsView.mount(root, {});
        const chips = root.querySelectorAll('button.work-chip');
        expect(chips.length).toBe(allWorkTags().length + 1);
        projectsView.unmount();
    });

    it('gives app icons the contained thumbnail treatment', async () => {
        const root = document.getElementById('view-root')!;
        await projectsView.mount(root, {});
        expect(root.querySelectorAll('.work-card-img-icon').length).toBeGreaterThan(0);
        projectsView.unmount();
    });
});

describe('thumbnail framing', () => {
    it('every project declares an explicit imageStyle', () => {
        for (const p of PROJECTS) {
            expect(['icon', 'cover'], p.title).toContain(p.imageStyle);
        }
    });

    it('cards follow the declared style, not the file name', async () => {
        document.body.innerHTML = '<main id="view-root"></main>';
        const root = document.getElementById('view-root')!;
        await projectsView.mount(root, {});
        const iconTitles = [...root.querySelectorAll('.work-card')]
            .filter((c) => c.querySelector('.work-card-img-icon'))
            .map((c) => c.querySelector('.work-card-title')?.textContent);
        const expected = PROJECTS.filter((p) => p.imageStyle === 'icon').map((p) => p.title);
        expect(iconTitles.sort()).toEqual(expected.sort());
        // Only the standalone apps use their real app icons
        expect(iconTitles.sort()).toEqual(
            ['Budget Tracker', 'Journal', 'Lists', 'Mortgage Simulator', 'NameKeep', 'Woku'].sort()
        );
        projectsView.unmount();
    });
});
