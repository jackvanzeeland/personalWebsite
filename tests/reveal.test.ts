import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('reveal util', () => {
    beforeEach(() => {
        vi.resetModules();
        document.body.innerHTML = '<div data-reveal id="a"></div><div data-reveal id="b"></div>';
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('reveals everything instantly under reduced motion', async () => {
        vi.stubGlobal('matchMedia', vi.fn(() => ({
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        })));
        const { initReveals } = await import('../src/utils/reveal');
        initReveals(document.body);
        expect(document.getElementById('a')?.classList.contains('in')).toBe(true);
        expect(document.getElementById('b')?.classList.contains('in')).toBe(true);
    });

    it('observes elements when motion is allowed', async () => {
        vi.stubGlobal('matchMedia', vi.fn(() => ({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        })));
        const observed: Element[] = [];
        vi.stubGlobal('IntersectionObserver', class {
            constructor(public cb: IntersectionObserverCallback) {}
            observe(el: Element) { observed.push(el); }
            unobserve() {}
            disconnect() {}
        });
        const { initReveals } = await import('../src/utils/reveal');
        initReveals(document.body);
        expect(observed.length).toBe(2);
        expect(document.getElementById('a')?.classList.contains('in')).toBe(false);
    });
});
