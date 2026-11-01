import { describe, it, expect, beforeEach } from 'vitest';
import { PROJECTS } from '../src/data/projects';
import homeView, { STATS } from '../src/app/views/home';

describe('home view', () => {
    beforeEach(() => {
        document.body.innerHTML = '<main id="view-root"></main>';
    });

    it('renders hero and CTAs', async () => {
        const root = document.getElementById('view-root')!;
        await homeView.mount(root, {});

        expect(root.querySelector('h1')?.textContent).toContain('Jack Van Zeeland');

        const ctas = [...root.querySelectorAll('a.btn-glow, a.btn-ghost')].map(
            (a) => a.getAttribute('href')
        );
        expect(ctas).toContain('/projects');
        expect(ctas).toContain('/journey');

        homeView.unmount();
    });

    it('side-project stat matches the real project count', () => {
        const stat = STATS.find(([, label]) => label === 'SIDE PROJECTS');
        expect(stat?.[0]).toBe(String(PROJECTS.length));
    });
});
