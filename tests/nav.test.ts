import { describe, it, expect } from 'vitest';
import { renderNav } from '../src/app/nav';

describe('renderNav', () => {
    it('renders 5 numbered links with the active route marked', () => {
        const nav = renderNav('work');
        const links = [...nav.querySelectorAll('.site-nav-links a')];
        expect(links.map((a) => a.getAttribute('href'))).toEqual([
            '/', '/projects', '/journey', '/beyond', '/contact'
        ]);
        expect(nav.textContent).toContain('01');
        expect(nav.textContent).toContain('05');
        const active = nav.querySelector('[aria-current="page"]');
        expect(active?.getAttribute('href')).toBe('/projects');
    });

    it('treats workDetail as work for active state', () => {
        const nav = renderNav('workDetail');
        expect(nav.querySelector('[aria-current="page"]')?.getAttribute('href')).toBe('/projects');
    });
});
