import { describe, it, expect, beforeEach } from 'vitest';
import homeView from '../src/app/views/home';

describe('home view', () => {
    beforeEach(() => {
        document.body.innerHTML = '<main id="view-root"></main>';
    });

    it('renders hero, CTAs, and three featured cards', async () => {
        const root = document.getElementById('view-root')!;
        await homeView.mount(root, {});

        expect(root.querySelector('h1')?.textContent).toContain('Jack Van Zeeland');

        const ctas = [...root.querySelectorAll('a.btn-glow, a.btn-ghost')].map(
            (a) => a.getAttribute('href')
        );
        expect(ctas).toContain('/projects');
        expect(ctas).toContain('/journey');

        expect(root.querySelectorAll('.home-featured-card').length).toBe(3);

        homeView.unmount();
    });
});
