import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import homeView from '../src/app/views/home';
import { HOME_STATEMENT } from '../src/app/views/homeTerminal';

describe('home view', () => {
    let root: HTMLElement;

    beforeEach(() => {
        document.body.innerHTML = '<main id="view-root"></main>';
        root = document.getElementById('view-root')!;
        sessionStorage.clear();
    });

    afterEach(() => vi.useRealTimers());

    it('renders name, statement, nav chips and odometer', async () => {
        await homeView.mount(root, {});

        expect(root.querySelector('h1')?.textContent).toContain('Jack Van Zeeland');
        expect(root.querySelector('.home-term-statement')?.textContent).toBe(HOME_STATEMENT);
        const hrefs = [...root.querySelectorAll('.home-term-chips a')].map((a) => a.getAttribute('href'));
        expect(hrefs).toEqual(expect.arrayContaining(['/projects', '/journey', '/contact']));
        expect(root.querySelector('.home-odo')).not.toBeNull();
        expect(root.querySelector('.home-stats')).toBeNull();
        expect(root.querySelector('.home-sub')).toBeNull();
        expect(root.textContent).not.toMatch(/48K|AUTOMATIONS AT WORK/);

        homeView.unmount();
    });

    it('unmount leaves no timers', async () => {
        vi.useFakeTimers();
        await homeView.mount(root, {});
        vi.advanceTimersByTime(700);
        homeView.unmount();
        expect(vi.getTimerCount()).toBe(0);
    });
});
