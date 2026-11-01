import { describe, it, expect, beforeEach } from 'vitest';
import projectsView from '../src/app/views/projects';
import { isIconImage } from '../src/utils/iconImage';
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

describe('isIconImage', () => {
    it('flags app icons and logos', () => {
        expect(isIconImage('https://journal.jackvanzeeland.com/apple-touch-icon.png')).toBe(true);
        expect(isIconImage('https://lists.jackvanzeeland.com/icons/icon-192.png')).toBe(true);
        expect(isIconImage('uipath_logo.jpeg')).toBe(true);
    });

    it('leaves photos and artwork full-bleed', () => {
        expect(isIconImage('wordleMain.png')).toBe(false);
        expect(isIconImage('partnerMatchingMain.jpeg')).toBe(false);
    });
});
