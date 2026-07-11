import { describe, it, expect, beforeEach } from 'vitest';
import beyondView from '../src/app/views/beyond';

describe('beyond view', () => {
    beforeEach(() => {
        document.body.innerHTML = '<main id="view-root"></main>';
    });

    it('renders the hero', async () => {
        const root = document.getElementById('view-root')!;
        await beyondView.mount(root, {});
        expect(root.querySelector('h1')?.textContent).toBe('Beyond the Code');
        beyondView.unmount();
    });

    it('renders 4 sport cards', async () => {
        const root = document.getElementById('view-root')!;
        await beyondView.mount(root, {});
        const cards = root.querySelectorAll('.sport-card');
        expect(cards.length).toBe(4);
        const titles = [...cards].map((c) => c.querySelector('h4')?.textContent);
        expect(titles).toEqual(['Intramural Sports', 'Golf', 'Running', 'Weight Training']);
        beyondView.unmount();
    });

    it('renders 4 accordion categories with matching panel ids', async () => {
        const root = document.getElementById('view-root')!;
        await beyondView.mount(root, {});
        const items = root.querySelectorAll('.media-accordion .accordion-item');
        expect(items.length).toBe(4);

        const headers = root.querySelectorAll('.accordion-header');
        const panelIds = [...headers].map((h) => h.getAttribute('aria-controls'));
        expect(panelIds).toEqual(['movies-panel', 'podcasts-panel', 'episodes-panel', 'audiobooks-panel']);

        panelIds.forEach((id) => {
            expect(root.querySelector(`#${id}`)).toBeTruthy();
        });
        beyondView.unmount();
    });

    it('renders movie, podcast, and episode iframes', async () => {
        const root = document.getElementById('view-root')!;
        await beyondView.mount(root, {});
        expect(root.querySelectorAll('#movies-panel iframe').length).toBe(3);
        expect(root.querySelectorAll('#podcasts-panel iframe').length).toBe(3);
        expect(root.querySelectorAll('#episodes-panel iframe').length).toBe(3);
        expect(root.querySelector('#movies-panel iframe')?.getAttribute('src')).toBe(
            'https://www.youtube.com/embed/ReIJ1lbL-Q8?si=x2nwOC3OkT-7AbZ9'
        );
        beyondView.unmount();
    });

    it('renders 5 audiobooks', async () => {
        const root = document.getElementById('view-root')!;
        await beyondView.mount(root, {});
        const items = root.querySelectorAll('#audiobooks-panel li.list-group-item');
        expect(items.length).toBe(5);
        expect(items[0].querySelector('strong')?.textContent).toBe('The Almanack of Naval Ravikant');
        expect(items[0].textContent).toContain('A Guide to Wealth and Happiness');
        beyondView.unmount();
    });

    it('renders the photo gallery skeleton and Instagram embed', async () => {
        const root = document.getElementById('view-root')!;
        await beyondView.mount(root, {});
        expect(root.querySelector('#photo-gallery')).toBeTruthy();
        expect(root.querySelector('#photo-counter')).toBeTruthy();
        expect(root.querySelector('#prev-photo')).toBeTruthy();
        expect(root.querySelector('#next-photo')).toBeTruthy();
        expect(
            root.querySelector('blockquote.instagram-media')?.getAttribute('data-instgrm-permalink')
        ).toBe('https://www.instagram.com/jack.vanzeeland/');
        beyondView.unmount();
    });
});
